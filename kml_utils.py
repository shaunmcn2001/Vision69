"""
Very small KML + Shapefile helpers (no third-party deps except `pyshp`).
"""
from __future__ import annotations

import io
import os
import tempfile
import zipfile
from datetime import datetime
from typing import List

# ---------------------------------------------------------------------------#
# Internal colour helper
# ---------------------------------------------------------------------------#
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


# ---------------------------------------------------------------------------#
# Public API – KML
# ---------------------------------------------------------------------------#
def generate_kml(
    features: List[dict],
    region: str,
    *,
    fill_hex: str,
    fill_opacity: float,
    outline_hex: str,
    outline_weight: int,
    folder_name: str = "Parcels",
) -> str:
    """
    Turn a list of GeoJSON‐like features into a string of KML.
    """
    fill_kml_color = _hex_to_kml_color(fill_hex, fill_opacity)
    outline_kml_color = _hex_to_kml_color(outline_hex, 1.0)

    kml_lines: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<kml xmlns='http://www.opengis.net/kml/2.2'>",
        f"  <Document><name>{folder_name}</name>",
        f"""  <Style id="parcel">
            <LineStyle><color>{outline_kml_color}</color><width>{outline_weight}</width></LineStyle>
            <PolyStyle><color>{fill_kml_color}</color></PolyStyle>
          </Style>""",
    ]

    for feat in features:
        props = feat.get("properties", {})
        if region == "QLD":
            placename = f"Lot {props.get('lot')} Plan {props.get('plan')}"
        else:
            lot = props.get("lotnumber")
            sec = props.get("sectionnumber") or ""
            plan = props.get("planlabel")
            placename = f"Lot {lot} {'Section ' + sec + ' ' if sec else ''}{plan}"

        kml_lines.append("    <Placemark>")
        kml_lines.append(f"      <name>{placename}</name>")
        kml_lines.append('      <styleUrl>#parcel</styleUrl>')

        geom = feat.get("geometry", {})
        gtype = geom.get("type")
        coords = geom.get("coordinates")

        def _write_ring(ring: list):
            if ring[0] != ring[-1]:
                ring.append(ring[0])
            kml_lines.append("            <coordinates>")
            kml_lines.extend(f"              {x},{y},0" for x, y in ring)
            kml_lines.append("            </coordinates>")

        if gtype == "Polygon":
            polygons = [coords]
        elif gtype == "MultiPolygon":
            polygons = coords
        else:
            continue

        if len(polygons) > 1:
            kml_lines.append("      <MultiGeometry>")

        for poly in polygons:
            kml_lines.append("        <Polygon>")
            kml_lines.append("          <outerBoundaryIs><LinearRing>")
            _write_ring(poly[0])
            kml_lines.append("          </LinearRing></outerBoundaryIs>")

            for hole in poly[1:]:
                kml_lines.append("          <innerBoundaryIs><LinearRing>")
                _write_ring(hole)
                kml_lines.append("          </LinearRing></innerBoundaryIs>")

            kml_lines.append("        </Polygon>")

        if len(polygons) > 1:
            kml_lines.append("      </MultiGeometry>")

        kml_lines.append("    </Placemark>")

    kml_lines.append("  </Document></kml>")
    return "\n".join(kml_lines)


# ---------------------------------------------------------------------------#
# Public API – Shapefile
# ---------------------------------------------------------------------------#
def generate_shapefile(features: List[dict], region: str) -> bytes:
    """
    Return a `.zip` (bytes) containing SHP/SHX/DBF/PRJ for the parcels.
    """
    import shapefile  # pyshp

    with tempfile.TemporaryDirectory() as tmp:
        base = os.path.join(tmp, "parcels")
        w = shapefile.Writer(base)
        w.field("LOT", "C", size=10)
        w.field("SEC", "C", size=10)
        w.field("PLAN", "C", size=15)
        w.autoBalance = 1

        for feat in features:
            props = feat.get("properties", {})
            if region == "QLD":
                lot = props.get("lot", "") or ""
                sec = ""
                plan = props.get("plan", "") or ""
            else:
                lot = props.get("lotnumber", "") or ""
                sec = props.get("sectionnumber", "") or ""
                plan = props.get("planlabel", "") or ""

            w.record(lot, sec, plan)

            gtype = feat.get("geometry", {}).get("type")
            coords = feat.get("geometry", {}).get("coordinates")
            parts: list = []

            if gtype == "Polygon":
                parts = coords
            elif gtype == "MultiPolygon":
                for poly in coords:
                    parts.extend(poly)

            if parts:
                w.poly(parts)

        w.close()

        # Basic WGS-84 .prj
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
