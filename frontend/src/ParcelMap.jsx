import { MapContainer, TileLayer } from 'react-leaflet';

export default function ParcelMap({ children }) {
  return (
    <MapContainer
      className="map"
      center={[-27.467, 153.028]}
      zoom={10}
      style={{ height: '100vh', width: '100%' }}
    >
      {/* ───────---  MANDATORY BASEMAP  ---─────── */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {/* 👉 any parcel layers / markers go **below** the basemap */}
      {children}
    </MapContainer>
  );
}
