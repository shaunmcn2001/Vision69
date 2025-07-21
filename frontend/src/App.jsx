import { useState, useCallback } from 'react';
import NavBar        from './NavBar.jsx';
import SearchPanel   from './SearchPanel.jsx';
import ParcelMap     from './ParcelMap.jsx';
import ResultDrawer  from './ResultDrawer.jsx';
import { API_BASE }  from './api.js';
import './App.css';

export default function App() {
  /* ---------- reactive state ---------- */
  const [features,  setFeatures]  = useState([]);      // search results
  const [selected,  setSelected]  = useState([]);      // ids that are ticked
  const [style,     setStyle]     = useState({         // map/polygon styling
    fillColor   : '#FF0000',
    fillOpacity : 0.5,
  });
  const [drawerOpen, setDrawerOpen] = useState(false); // RHS results drawer

  /* ---------- helpers ---------- */
  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const download = useCallback(
    async (type, folderName, fileName) => {
      const body = {
        type,
        folderName,
        fileName,
        featureIds: selected,
        style,
      };
      const res = await fetch(`${API_BASE}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return alert('Export failed – check server logs.');
      /* Stream the blob to the browser */
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    [selected, style],
  );

  /* ---------- render ---------- */
  return (
    <div className="h-screen w-screen flex flex-col">
      <NavBar onToggleSearch={() => setDrawerOpen((o) => !o)} />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: map */}
        <ParcelMap style={style} selected={selected} features={features} />

        {/* RIGHT: drawer / search */}
        <ResultDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <SearchPanel
            onResults={(f) => {
              setFeatures(f);
              setSelected([]);       // reset ticks on new query
            }}
            features={features}
            selected={selected}
            toggle={toggleSelect}
            download={download}
            style={style}
            setStyle={setStyle}
          />
        </ResultDrawer>
      </div>
    </div>
  );
}
