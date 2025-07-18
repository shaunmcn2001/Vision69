# Parcel Viewer

This project contains a small FastAPI application for viewing cadastral parcels. The frontend uses Bootstrap and Leaflet served via Jinja2 templates.

## Setup

Install the required packages:

```bash
pip install -r requirements.txt
```

## Running the app locally

Start the server with Uvicorn and open your browser at <http://localhost:8000>:

```bash
uvicorn app.main:app --reload
```

## Testing

Run the tests to verify functionality:

```bash
pytest -q
```

## Deployment

The repository includes a `Procfile` for Render:

```procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Push the repository to GitHub and create a new Web Service on [Render](https://render.com/) connected to your repo. Render will install the dependencies and start the app using the command above.
