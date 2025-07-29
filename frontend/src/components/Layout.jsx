import { useState } from 'react';
import MapboxMap from '../MapboxMap.jsx';
import NavBar from './NavBar.jsx';
import RightDrawer from './RightDrawer.jsx';
import SearchPanel from '../SearchPanel.jsx';
import { API_BASE } from '../api.js';

export default function Layout() {
  const [drawer, setDrawer] = useState(null); // 'search' | 'style' | 'export' | null
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState({});
  const [style, setStyle] = useState({ fill: '#ff0000', outline: '#000000', opacity: 0.5, weight: 2 });

  const toggleSelected = (idx) => setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  const onResults = (list) => { setFeatures(list); setSelected({}); };

  const onDownload = async (type, folderName, fileName) => {
    const sel = features.filter((_, i) => selected[i]);
    const body = { features: sel.length ? sel : features, folderName, fileName };
    const r = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Permanent left nav bar */}
      <NavBar
        onOpenSearch={() => setDrawer('search')}
        onOpenStyle={() => setDrawer('style')}
        onOpenExport={() => setDrawer('export')}
        onReset={() => setFeatures([])}
      />

      {/* Map area fills remaining width; the drawer overlays it (does not resize) */}
      <div className="flex-1 relative bg-black">
        <div className="map-area">
          <MapboxMap
            features={features}
            style={style}
            selected={selected}
            onFeatureClick={toggleSelected}
          />
        </div>

        <RightDrawer
          open={!!drawer}
          title={drawer === 'style' ? 'Style' : drawer === 'export' ? 'Export' : 'Search & Export'}
          onClose={() => setDrawer(null)}
          width={420}
        >
          <SearchPanel
            onResults={onResults}
            features={features}
            selected={selected}
            toggle={toggleSelected}
            style={style}
            setStyle={setStyle}
            onDownload={onDownload}
          />
        </RightDrawer>
      </div>
    </div>
  );
}
