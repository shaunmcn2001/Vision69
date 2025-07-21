import { useState, useMemo, useEffect } from 'react';
import ParcelMap from './ParcelMap.jsx';
import SearchPanel from './SearchPanel.jsx';
import { API_BASE } from './api.js';
import './App.css';                       // global dark theme

export default function App() {
  /* ───── parcels & styling state ───── */
  const [features, setFeatures] = useState([]);
  const [selected, setSelected]   = useState({});
  const defaultStyle = {
    fill: '#FF0000',
    outline: '#FFFFFF',
    opacity: 0.5,
    weight: 2,
  };
  const [style, setStyle] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('parcelStyle')) || defaultStyle;
    } catch {
      return defaultStyle;
    }
  });
  useEffect(() => {
    localStorage.setItem('parcelStyle', JSON.stringify(style));
  }, [style]);

  /* ───── sidebar open / closed ───── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  /* ───── helpers ───── */
  const toggleRow = (idx) =>
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));

  const handleResults = (list) => {
    setFeatures(list);
    setSelected({});
  };

  const chosen = useMemo(() => {
    const picked = features.filter((_, i) => selected[i]);
    return picked.length ? picked : features;
  }, [features, selected]);

  const download = async (type, folderName, fileName) => {
    if (!features.length) return;
    const resp = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: chosen, folderName, fileName }),
    });
    if (!resp.ok) return;
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ───── UI ───── */
  return (
    <div className={`app ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      {/* toggle button – always visible */}
      <button className="toggle-btn" onClick={toggleSidebar} title="Search">
        🔍
      </button>

      {/* sidebar (hidden when closed) */}
      {sidebarOpen && (
        <SearchPanel
          onResults={handleResults}
          features={features}
          selected={selected}
          toggle={toggleRow}
          download={download}
          style={style}
          setStyle={setStyle}
          onClose={toggleSidebar}
        />
      )}

      {/* map */}
      <ParcelMap features={features} style={style} />
    </div>
  );
}