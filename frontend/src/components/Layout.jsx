import { useState } from 'react';
import TopBar from './TopBar.jsx';
import LeftRail from './LeftRail.jsx';
import RightPanel from './RightPanel.jsx';
import MapToolbar from './MapToolbar.jsx';
import MapboxMap from '../MapboxMap.jsx';
import { API_BASE } from '../api.js';

export default function Layout() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState({});
  const [style, setStyle] = useState({ fill: '#ff0000', outline: '#000000', opacity: 0.5, weight: 2 });

  const toggleSelected = (idx) => setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  const onResults = (list) => { setFeatures(list); setSelected({}); };

  const onDownload = async (type, folderName, fileName) => {
    const sel = features.filter((_, i) => selected[i]);
    const body = { features: sel.length ? sel : features, folderName, fileName };
    const r = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <TopBar onOpenHelp={() => setPanelOpen(true)} />

      <div className="h-[calc(100vh-56px)] w-full flex">
        <LeftRail
          onOpenSearch={() => setPanelOpen(true)}
          onOpenStyle={() => setPanelOpen(true)}
          onOpenExport={() => setPanelOpen(true)}
          onReset={() => setFeatures([])}
        />

        <div className="flex-1 relative">
          <div className="map-area">
            <MapboxMap
              features={features}
              style={style}
              selected={selected}
              onFeatureClick={toggleSelected}
            />
          </div>

          {/* Bottom-left toolbar (over the map) */}
          <MapToolbar className="absolute left-3 bottom-3" />
        </div>
      </div>

      {/* Right overlay panel (over the map; map size unchanged) */}
      <RightPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        features={features}
        selected={selected}
        toggle={toggleSelected}
        style={style}
        setStyle={setStyle}
        onResults={onResults}
        onDownload={onDownload}
      />
    </div>
  );
}
