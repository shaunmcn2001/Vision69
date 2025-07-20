import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ParcelMap({ children }) {
  return (
    <MapContainer
      className="map"                 /* .map has height:100vh in App.css */
      center={[-27.467, 153.028]}     /* Brisbane CBD – change if you like */
      zoom={10}
      scrollWheelZoom
      style={{ height: '100vh', width: '100%' }}
    >
      {/* Basemap (HTTPS so Render won’t block it) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* Dynamic GeoJSON / markers from <App /> */}
      {children}
    </MapContainer>
  );
}
