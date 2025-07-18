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
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Push the repository to GitHub and create a new Web Service on [Render](https://render.com/) connected to your repo. Render automatically reads the `Procfile` and starts the service with the command shown above.

If Render asks for a start command, use the exact line from the `Procfile`:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Including a `web:` prefix in the start command will cause an error like `web: command not found` during deployment.
