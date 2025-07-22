from __future__ import annotations

import os
import re
from pathlib import Path
from typing import List

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .constants import NSW_PARCEL_URL, QLD_PARCEL_URL
from .utils import parse_user_input
from kml_utils import generate_kml, generate_shapefile

# Determine absolute paths so the app works regardless of the working directory
BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / "frontend" / "dist"
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Vision Parcel API")

# ── CORS ─────────────────────────────────────────────────────────
frontend_origin = os.getenv("VISION_FRONTEND") or "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── static SPA ───────────────────────────────────────────────────
app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def serve_spa() -> FileResponse:
    return FileResponse(DIST_DIR / "index.html")


@app.get("/ping")
async def ping() -> dict[str, bool]:
    return {"pong": True}


# ── models ───────────────────────────────────────────────────────
class SearchBody(BaseModel):
    inputs: List[str]


class DownloadBody(BaseModel):
    features: List[dict]
    folderName: str | None = Field(None, description="KML folder name")
    fileName: str | None = Field(None, description="download filename")


# ── helpers (unchanged) ──────────────────────────────────────────
async def _fetch_geojson(url: str, params: dict) -> list[dict]:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
        return data.get("features", []) or []


def _region_from_features(flist: list[dict]) -> str:
    return "QLD" if any("lot" in f.get("properties", {}) for f in flist) else "NSW"


# ── routes ───────────────────────────────────────────────────────
@app.post("/api/search")
async def search(body: SearchBody):
    features, regions = [], []
    for raw in body.inputs:
        region, lot, section, plan = parse_user_input(raw)
        if not region:
            continue
        feats = await _search_one(region, lot, section, plan)
        features.extend(feats)
        regions.extend([region] * len(feats))
    return {"features": features, "regions": regions}


async def _search_one(region: str, lot: str, section: str, plan: str) -> list[dict]:
    if region == "NSW":
        plannum = int(re.sub(r"[^\d]", "", plan))
        where = [
            f"lotnumber='{lot}'",
            f"plannumber={plannum}",
            "(sectionnumber IS NULL OR sectionnumber='')" if not section else f"sectionnumber='{section}'",
        ]
        return await _fetch_geojson(
            NSW_PARCEL_URL,
            {"where": " AND ".join(where), "outFields": "*", "outSR": "4326", "f": "geoJSON"},
        )
    return await _fetch_geojson(
        QLD_PARCEL_URL,
        {"where": f"lot='{lot}' AND plan='{plan}'", "outFields": "*", "outSR": "4326", "f": "geoJSON"},
    )


@app.post("/api/download/kml")
async def download_kml(body: DownloadBody):
    if not body.features:
        raise HTTPException(400, "No features provided")
    region = _region_from_features(body.features)
    kml = generate_kml(
        body.features,
        region,
        folder_name=body.folderName or "Parcels",
    )
    fname = (body.fileName or "parcels.kml").replace("/", "_")
    return Response(
        content=kml,
        media_type="application/vnd.google-earth.kml+xml",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


@app.post("/api/download/shp")
async def download_shp(body: DownloadBody):
    if not body.features:
        raise HTTPException(400, "No features provided")
    region = _region_from_features(body.features)
    shp_zip = generate_shapefile(body.features, region)
    fname = (body.fileName or "parcels.zip").replace("/", "_")
    return Response(
        content=shp_zip,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )
