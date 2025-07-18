from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .services import ParcelService

app = FastAPI()

# Mount static directory for CSS and JavaScript
app.mount("/static", StaticFiles(directory="static"), name="static")

# Jinja2 templates directory
templates = Jinja2Templates(directory="templates")

def get_parcel_service():
    """Dependency that provides a ParcelService instance."""
    return ParcelService()


@app.get("/", response_class=HTMLResponse)
async def index(
    request: Request,
    service: ParcelService = Depends(get_parcel_service),
):
    """Render the homepage with map and parcel list."""
    parcels = service.list_parcels()
    return templates.TemplateResponse(
        "index.html", {"request": request, "parcels": parcels}
    )
