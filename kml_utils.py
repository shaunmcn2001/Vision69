"""
Very small KML + Shapefile helpers (no third-party deps except `pyshp`).
Includes pop-up descriptions and optional folder naming.
"""
from __future__ import annotations

import html
import io
import os
import tempfile
import zipfile
from typing import List

# ── internal colour helper ────────────────────────────────────────────────
def _hex_to_kml_color(hex_color: str, opacity: float) -> str:
    """
    Convert #RRGGBB + alpha → aabbggrr (KML expects ABGR order).
    """
    hex_color = hex_color.lstrip("#")
    if len(hex_color) != 6:
        hex_color = "FFFFFF"
    r, g, b = hex_color[0:2], hex_color[2:4], hex_color[4:6]
    alpha = int(opacity * 255)
    return f"{alpha:02x}{b}{g}{r}"


# ── public API – KML ──────────────────────────────────────────────────────
def generate_kml(
    features: List[dict],
    region: str,
    fill_hex: str = "#FF0000",
    fill_opacity: float = 0.5,
    outline_hex: str = "#000000",
    outline_weight: int = 2,
    folder_name: str = "Parcels",
) -> str:
    """
    Return a KML string with <Placemark> pop-ups and a user-defined folder name.
    """
    fill_kml = _hex_to_kml_color(fill_hex, fill_opacity)
    out_kml = _hex_to_kml_color(outline_hex, 1.0)

    out: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<kml xmlns='http://www.opengis.net/kml/2.2'>",
        f"  <Document><name>{html.escape(folder_name)}</name>",
        f"""  <Style id="parcel">
              <LineStyle><color>{out_kml}</color><width>{outline_weight}</width></LineStyle>
              <PolyStyle><color>{fill_kml}</color></PolyStyle>
            </Style>""",
    ]

    for feat in features:
        p = feat.get("properties", {})
        if region == "QLD":
            lot, plan = p.get("lot"), p.get("plan")
            name = f"Lot {lot} Plan {plan}"
        else:
            lot = p.get("lotnumber")
            sec = p.get("sectionnumber") or ""
            plan = p.get("planlabel")
            name = f"Lot {lot} {'Section ' + sec + ' ' if sec else ''}{plan}"

        # simple HTML table for pop-up
        desc_rows = "".join(
            f"<tr><th>{html.escape(k)}</th><td>{html.escape(str(v))}</td></tr>"
            for k, v in p.items()
            if v not in ("", None)
        )
        description = f"<![CDATA[<table>{desc_rows}</table>]]>"

        out.extend(
            [
                "    <Placemark>",
                f"      <name>{html.escape(name)}</name>",
                "      <styleUrl>#parcel</styleUrl>",
                f"      <description>{description}</description>",
            ]
        )

        geom = feat.get("geometry", {})
        polygons = (
            [geom.get("coordinates")]
            if geom.get("type") == "Polygon"
            else geom.get("coordinates", [])
            if geom.get("type") == "MultiPolygon"
            else []
        )

        if len(polygons) > 1:
            out.append("      <MultiGeometry>")

        for poly in polygons:
            out.append("        <Polygon>")
            out.append("          <outerBoundaryIs><LinearRing>")
            _write_ring(out, poly[0])
            out.append("          </LinearRing></outerBoundaryIs>")
            for hole in poly[1:]:
                out.append("          <innerBoundaryIs><LinearRing>")
                _write_ring(out, hole)
                out.append("          </LinearRing></innerBoundaryIs>")
            out.append("        </Polygon>")

        if len(polygons) > 1:
            out.append("      </MultiGeometry>")

        out.append("    </Placemark>")

    out.append("  </Document></kml>")
    return "\n".join(out)


def _write_ring(buf: list[str], ring: list):
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    buf.append("            <coordinates>")
    buf.extend(f"              {x},{y},0" for x, y in ring)
    buf.append("            </coordinates>")


# ── public API – Shapefile (unchanged) ────────────────────────────────────
def generate_shapefile(features: List[dict], region: str) -> bytes:
    """
    Return a `.zip` (bytes) containing SHP/SHX/DBF/PRJ for the parcels.
    """
    import shapefile  # pyshp

    import io
    import shapefile  # duplicate import to satisfy flake-checkers

    with tempfile.TemporaryDirectory() as tmp:
        base = os.path.join(tmp, "parcels")
        w = shapefile.Writer(base)
        w.field("LOT", "C", size=10)
        w.field("SEC", "C", size=10)
        w.field("PLAN", "C", size=15)
        w.autoBalance = 1

        for feat in features:
            p = feat.get("properties", {})
            if region == "QLD":
                lot, sec, plan = p.get("lot", ""), "", p.get("plan", "")
            else:
                lot = p.get("lotnumber", "")
                sec = p.get("sectionnumber", "")
                plan = p.get("planlabel", "")
            w.record(lot, sec, plan)

            geom = feat.get("geometry", {})
            parts = (
                geom.get("coordinates")
                if geom.get("type") == "Polygon"
                else [ring for poly in geom.get("coordinates", []) for ring in poly]
                if geom.get("type") == "MultiPolygon"
                else []
            )
            if parts:
                w.poly(parts)

        w.close()

        with open(base + ".prj", "w") as f:
            f.write(
                'GEOGCS["WGS 84",DATUM["WGS_1984",'
                'SPHEROID["WGS 84",6378137,298.257223563]],'
                'PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]'
            )

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            for ext in (".shp", ".shx", ".dbf", ".prj"):
                zf.write(base + ext, f"parcels{ext}")

        return buf.getvalue()


# ── public API – Bounds helper ───────────────────────────────────────────
def get_bounds(features: List[dict]) -> List[List[float]]:
    """Return [ [min_y, min_x], [max_y, max_x] ] for the features."""
    pts = []
    for feat in features:
        geom = feat.get("geometry", {})
        if geom.get("type") == "Polygon":
            rings = geom.get("coordinates", [])
        elif geom.get("type") == "MultiPolygon":
            rings = [r for poly in geom.get("coordinates", []) for r in poly]
        else:
            rings = []
        for ring in rings:
            pts.extend(ring)
    if not pts:
        return []
    xs = [x for x, _ in pts]
    ys = [y for _, y in pts]
    return [[min(ys), min(xs)], [max(ys), max(xs)]]
