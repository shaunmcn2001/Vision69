# Parcel Viewer

This project contains a small FastAPI backend with a React frontend. The React app uses Leaflet to display parcels on a map and communicates with the FastAPI API for searching and downloading data.

## Setup

Install the required Python packages and build the frontend:

```bash
pip install -r requirements.txt
npm --prefix frontend install
npm --prefix frontend run build
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

Push the repository to GitHub and create a new Web Service on [Render](https://render.com/) connected to your repo. Render automatically reads the `Procfile` and starts the service with the command shown above. Make sure the frontend is built (using `npm run build`) before deployment so the `frontend/dist` directory exists.

If Render asks for a start command, use the exact line from the `Procfile`:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Including a `web:` prefix in the start command will cause an error like `web: command not found` during deployment.

## Troubleshooting the Map

If the map shows a grey box or fails to render, check the following common issues:

| Symptom | Typical root cause | One-line fix |
|---------|-------------------|--------------|
| Grey box, no errors | Tile layer wasn’t added or was removed during a refactor | Add a `<TileLayer>` inside `<MapContainer>` |
| Grey box with `Blocked: mixed-content` in the browser console | Tile URL starts with `http://` while the site is served over `https://` | Use an `https://` tile provider |
| Grey box with `leaflet.css not found` in the console | Leaflet CSS not imported | `import 'leaflet/dist/leaflet.css';` at the top of your entry file |
| Whole page scrolls, map never appears | A parent element has `height: 0` | Give the map (or its flex parent) an explicit height, e.g. `100vh` |
