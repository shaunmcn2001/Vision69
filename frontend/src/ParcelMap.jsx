import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ParcelMap({ children }) {
  return (
    <MapContainer
      className="map"
      center={[-27.467, 153.028]}   // default view – adjust if you like
      zoom={10}
      scrollWheelZoom
      style={{ height: '100vh', width: '100%' }}
    >
      {/* ───── Basemap (HTTPS so Render won’t block it) ───── */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* dynamic layers passed from <App /> */}
      {children}
    </MapContainer>
  );
}
