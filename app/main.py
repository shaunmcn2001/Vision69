from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests, re
from typing import List

from kml_utils import generate_kml, generate_shapefile, get_bounds

app = FastAPI()

# serve React build
app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
app.mount("/static", StaticFiles(directory="static"), name="static")

class SearchBody(BaseModel):
    inputs: List[str]

class FeaturesBody(BaseModel):
    features: List[dict]

@app.get("/")
async def index():
    return FileResponse("frontend/dist/index.html")

@app.post("/api/search")
async def search(body: SearchBody):
    feats = []
    regions = []
    for user_input in body.inputs:
        user_input = user_input.strip()
        if not user_input:
            continue
        if "/" in user_input:
            parts = user_input.split("/")
            if len(parts) == 3:
                lot_str, sec_str, plan_str = parts[0].strip(), parts[1].strip(), parts[2].strip()
            elif len(parts) == 2:
                lot_str, sec_str, plan_str = parts[0].strip(), "", parts[1].strip()
            else:
                continue
            plan_num = "".join(filter(str.isdigit, plan_str))
            if not lot_str or not plan_num:
                continue
            where_clauses = [f"lotnumber='{lot_str}'"]
            if sec_str:
                where_clauses.append(f"sectionnumber='{sec_str}'")
            else:
                where_clauses.append("(sectionnumber IS NULL OR sectionnumber = '')")
            where_clauses.append(f"plannumber={plan_num}")
            where = " AND ".join(where_clauses)
            url = "https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Cadastre/MapServer/9/query"
            params = {"where": where, "outFields": "lotnumber,sectionnumber,planlabel", "outSR": "4326", "f": "geoJSON"}
            try:
                res = requests.get(url, params=params, timeout=10)
                data = res.json()
                for feat in data.get("features", []) or []:
                    feats.append(feat)
                    regions.append("NSW")
            except Exception:
                continue
        else:
            inp = user_input.replace(" ", "").upper()
            match = re.match(r"^(\d+)([A-Z].+)$", inp)
            if not match:
                continue
            lot_str = match.group(1)
            plan_str = match.group(2)
            url = "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandParcelPropertyFramework/MapServer/4/query"
            params = {"where": f"lot='{lot_str}' AND plan='{plan_str}'", "outFields": "lot,plan,lotplan,locality", "outSR": "4326", "f": "geoJSON"}
            try:
                res = requests.get(url, params=params, timeout=10)
                data = res.json()
                for feat in data.get("features", []) or []:
                    feats.append(feat)
                    regions.append("QLD")
            except Exception:
                continue
    return {"features": feats, "regions": regions}

@app.post("/api/download/kml")
async def download_kml(body: FeaturesBody):
    if not body.features:
        raise HTTPException(status_code=400, detail="No features provided")
    region = "QLD" if any("lot" in f.get("properties", {}) for f in body.features) else "NSW"
    data = generate_kml(body.features, region, "#FF0000", 0.5, "#000000", 2, "Parcels")
    return Response(content=data, media_type="application/vnd.google-earth.kml+xml", headers={"Content-Disposition": "attachment; filename=parcels.kml"})

@app.post("/api/download/shp")
async def download_shp(body: FeaturesBody):
    if not body.features:
        raise HTTPException(status_code=400, detail="No features provided")
    region = "QLD" if any("lot" in f.get("properties", {}) for f in body.features) else "NSW"
    data = generate_shapefile(body.features, region)
    return Response(content=data, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=parcels.zip"})
