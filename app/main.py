from __future__ import annotations

import os
from typing import List

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .constants import NSW_PARCEL_URL, QLD_PARCEL_URL
from .utils import parse_user_input
from kml_utils import generate_kml, generate_shapefile   # top-level module

app = FastAPI(title="Vision Parcel API")

# ---------------------------------------------------------------------------#
# CORS
# ---------------------------------------------------------------------------#
frontend_origin = os.getenv("VISION_FRONTEND") or "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------#
# Serve React build & other static assets (single-service deployment)
# ---------------------------------------------------------------------------#
app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def serve_spa() -> FileResponse:
    """Return the bundled React index.html (SPA entry point)."""
    return FileResponse("frontend/dist/index.html")


@app.get("/ping")
async def ping() -> dict[str, bool]:
    return {"pong": True}


# ---------------------------------------------------------------------------#
# Pydantic models
# ---------------------------------------------------------------------------#
class SearchBody(BaseModel):
    inputs: List[str]


class FeaturesBody(BaseModel):
    features: List[dict]


# ---------------------------------------------------------------------------#
# Helpers
# ---------------------------------------------------------------------------#
async def _fetch_geojson(url: str, params: dict) -> list[dict]:
    """Query ArcGIS layer, return list of GeoJSON features (may be empty)."""
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
        return data.get("features", []) or []


def _region_from_features(flist: list[dict]) -> str:
    """Infer region from the first feature's attribute schema."""
    return "QLD" if any("lot" in f.get("properties", {}) for f in flist) else "NSW"


# ---------------------------------------------------------------------------#
# Routes
# ---------------------------------------------------------------------------#
@app.post("/api/search")
async def search(body: SearchBody):
    """
    Accepts:  {"inputs": ["3/RP123456", "43/DP756474", ...]}
    Returns:  {"features": [...], "regions": ["QLD", "NSW", ...]}
    """
    features, regions = [], []

    for raw in body.inputs:
        region, lot, section, plan = parse_user_input(raw)
        if not region:
            continue

        if region == "NSW":
            # Plan label already includes "DP"
            where = [
                f"lotnumber = '{lot}'",
                f"planlabel = '{plan}'",
            ]
            if section is None:
                where.append("(sectionnumber IS NULL OR sectionnumber = '')")
            else:
                where.append(f"sectionnumber = '{section}'")

            feats = await _fetch_geojson(
                NSW_PARCEL_URL,
                {
                    "where": " AND ".join(where),
                    "outFields": "lotnumber,sectionnumber,planlabel",
                    "outSR": "4326",
                    "f": "geoJSON",
                },
            )
        else:  # QLD
            feats = await _fetch_geojson(
                QLD_PARCEL_URL,
                {
                    "where": f"lotplan = '{lot}{plan}'",
                    "outFields": "lot,plan,locality",
                    "outSR": "4326",
                    "f": "geoJSON",
                },
            )

        features.extend(feats)
        regions.extend([region] * len(feats))

    return {"features": features, "regions": regions}


@app.post("/api/download/kml")
async def download_kml(body: FeaturesBody):
    if not body.features:
        raise HTTPException(400, "No features provided")

    region = _region_from_features(body.features)
    kml = generate_kml(
        body.features,
        region,
        fill_hex="#FF0000",
        fill_opacity=0.5,
        outline_hex="#000000",
        outline_weight=2,
        folder_name="Parcels",
    )
    return Response(
        content=kml,
        media_type="application/vnd.google-earth.kml+xml",
        headers={"Content-Disposition": 'attachment; filename="parcels.kml"'},
    )


@app.post("/api/download/shp")
async def download_shp(body: FeaturesBody):
    if not body.features:
        raise HTTPException(400, "No features provided")

    region = _region_from_features(body.features)
    shp_zip = generate_shapefile(body.features, region)
    return Response(
        content=shp_zip,
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="parcels.zip"'},
    )
