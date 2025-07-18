# Parcel Viewer

This project contains a small FastAPI application for viewing cadastral parcels. The frontend uses Bootstrap and Leaflet served via Jinja2 templates.
It also includes a minimal example of dependency injection using a `ParcelService`.

The repository previously included Streamlit configuration files which are not
needed for the FastAPI implementation. These have been removed to keep the
project focused on the API and template based frontend.

## Setup

The application requires **Python 3.12**. Install the required packages:

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

## Project structure

```
.
├── app
│   ├── main.py          # FastAPI application
│   └── services.py      # Example service used via dependency injection
├── templates
│   └── index.html       # Bootstrap + Leaflet homepage
├── static
│   ├── css/style.css    # Custom styles
│   └── js/map.js        # Leaflet initialization logic
├── requirements.txt
├── Procfile
└── tests                # Unit tests
```

## Deployment

The repository includes a `Procfile` for Render:

```procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Push the repository to GitHub and create a new Web Service on [Render](https://render.com/) connected to your repo. Render will install the dependencies and start the app using the command above.
