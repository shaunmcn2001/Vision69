"""
Centralised constants for external data sources.
"""

# NSW Lot layer (ID 9) – returns GeoJSON when f=geoJSON
NSW_PARCEL_URL = (
    "https://maps.six.nsw.gov.au/arcgis/rest/services/public/"
    "NSW_Cadastre/MapServer/9/query"
)

# QLD Land Parcel framework layer (ID 4)
QLD_PARCEL_URL = (
    "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/"
    "PlanningCadastre/LandParcelPropertyFramework/MapServer/4/query"
)
