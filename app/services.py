class ParcelService:
    """A simple service to list parcels."""

    def __init__(self):
        self.parcels = [
            {"id": 1, "name": "Parcel A"},
            {"id": 2, "name": "Parcel B"},
        ]

    def list_parcels(self):
        return self.parcels
