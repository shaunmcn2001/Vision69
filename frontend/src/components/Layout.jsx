import { useState } from 'react';
import MapboxMap from '../MapboxMap.jsx';
import SearchPanel from '../SearchPanel.jsx';
import Sidebar from './Sidebar.jsx';
import { API_BASE } from '../api.js';

/**
 * Layout is the top‑level component responsible for assembling the map, sidebar
 * and search panel. It manages application state such as the list of
 * currently displayed features, styling information and selection state.
 */
export default function Layout() {
  // Sidebar and search panel visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Feature list returned from parcel search
  const [features, setFeatures] = useState([]);
  // Selection dictionary keyed by feature index
  const [selected, setSelected] = useState({});
  // Style for parcel overlay
  const [style, setStyle] = useState({
    fill: '#ff0000',
    outline: '#000000',
    opacity: 0.5,
    weight: 2,
  });

  // Toggle the selected flag on an item
  const toggleSelected = (idx) => {
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  };

  // Called when search results are returned
  const handleResults = (list) => {
    setFeatures(list);
    setSelected({});
  };

  // Download KML or SHP for the selected features. When nothing is selected
  // the entire feature set is exported.
  const download = async (type, folderName, fileName) => {
    const sel = features.filter((_, i) => selected[i]);
    const body = {
      features: sel.length ? sel : features,
      folderName,
      fileName,
    };
    const resp = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) return;
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Reset the map by clearing all current features
  const resetMap = () => {
    setFeatures([]);
    setSelected({});
  };

  return (
    <div className="h-full flex">
      {/* Sidebar (slide in/out) */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 overflow-y-auto ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        {sidebarOpen && (
          <Sidebar
            openSearch={() => setSearchOpen(true)}
            download={download}
            resetMap={resetMap}
          />
        )}
      </div>
      {/* Main map area */}
      <div className="relative flex-1">
        {/* Toggle button for sidebar */}
        <button
          className="absolute top-2 left-2 z-20 btn-primary"
          onClick={() => setSidebarOpen((o) => !o)}
        >
          {sidebarOpen ? 'Close' : 'Menu'}
        </button>
        {/* The Map */}
        <MapboxMap
          features={features}
          style={style}
          selected={selected}
          onFeatureClick={toggleSelected}
        />
      </div>
      {/* Overlay search panel */}
      {searchOpen && (
        <div className="absolute inset-0 z-30 flex justify-end">
          <div className="w-full sm:w-96 bg-gray-900 text-white p-4 h-full overflow-y-auto shadow-xl">
            <SearchPanel
              onResults={handleResults}
              features={features}
              selected={selected}
              toggle={toggleSelected}
              download={download}
              style={style}
              setStyle={setStyle}
              onClose={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}