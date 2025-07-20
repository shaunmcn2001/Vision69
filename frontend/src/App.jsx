import { useState, useMemo, useEffect } from 'react';
import NavBar       from './NavBar.jsx';
import ResultDrawer from './ResultDrawer.jsx';
import ParcelMap    from './ParcelMap.jsx';
import SearchPanel  from './SearchPanel.jsx';
import { API_BASE } from './api.js';
import './index.css';          // Tailwind global

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

  /* ───── drawer open / closed ───── */
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    <div className="flex h-screen dark:bg-gray-800">
      <NavBar onToggleSearch={() => setDrawerOpen((o) => !o)} />

      <ResultDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SearchPanel
          onResults={handleResults}
          features={features}
          selected={selected}
          toggle={toggleRow}
          download={download}
          style={style}
          setStyle={setStyle}
          onClose={() => setDrawerOpen(false)}
        />
      </ResultDrawer>

      <main className="flex-1">
        <ParcelMap features={features} style={style} />
      </main>
    </div>
  );
}
