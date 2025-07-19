import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ParcelMap({ children }) {
  return (
    <MapContainer
      className="map"
      center={[-27.467, 153.028]}   // Brisbane CBD – tweak if you like
      zoom={10}
      scrollWheelZoom
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* dynamic GeoJSON etc. from <App /> */}
      {children}
    </MapContainer>
  );
}
