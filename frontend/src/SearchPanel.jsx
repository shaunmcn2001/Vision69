import { useState } from 'react';
import ResultsList from './ResultsList.jsx';
import { API_BASE } from './api.js';

export default function SearchPanel({
  onResults,
  features,
  selected,
  toggle,
  download,
  style,
  setStyle,
  onClose,
}) {
  const [bulk, setBulk] = useState('');
  const [folderName, setFolderName] = useState('Parcels');
  const [fileName,  setFileName]  = useState('parcels.kml');

  const handleSearch = async () => {
    const lines = bulk.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!lines.length) return;
    const r = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: lines }),
    });
    if (!r.ok) return;
    const data = await r.json();
    onResults(data.features || []);
  };

  const updateStyle = (p) => setStyle({ ...style, ...p });
  const downloadWithMeta = (t) =>
    download(t, folderName, t === 'kml' ? fileName : fileName.replace(/\.kml$/i, '.zip'));

  return (
    <div className="sidebar" title="Drag right edge to resize">
      {/* header with close button */}
      <div className="sidebar-header">
        <h2>Search</h2>
        <button className="close-btn" onClick={onClose}>Cancel</button>
      </div>

      <textarea
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        placeholder="QLD 3RP123456\nNSW 4/DP765432"
      />
      <button className="primary" onClick={handleSearch}>
        Search
      </button>

      {features.length > 0 && (
        <>
          <hr />
          <h3>Export</h3>
          <label>Folder name
            <input value={folderName} onChange={(e)=>setFolderName(e.target.value)} />
          </label>
          <label>File name
            <input value={fileName}  onChange={(e)=>setFileName(e.target.value)} />
          </label>

          <hr />
          <h3>Style</h3>
          <label className="inline">Fill&nbsp;
            <input type="color" value={style.fill}
              onChange={(e)=>updateStyle({fill:e.target.value})}/>
          </label>
          <label className="inline">Outline&nbsp;
            <input type="color" value={style.outline}
              onChange={(e)=>updateStyle({outline:e.target.value})}/>
          </label>
          <label>Opacity&nbsp;
            <input type="range" min={0} max={1} step={0.01}
              value={style.opacity}
              onChange={(e)=>updateStyle({opacity:+e.target.value})}/>
            <span className="range-val">{style.opacity.toFixed(2)}</span>
          </label>
          <label>Outline weight&nbsp;
            <input type="number" min={0} max={10}
              value={style.weight}
              onChange={(e)=>updateStyle({weight:+e.target.value})}/>
          </label>

          <ResultsList features={features} selected={selected} toggle={toggle} />

          <div className="downloads">
            <button onClick={()=>downloadWithMeta('kml')}>Download KML</button>
            <button onClick={()=>downloadWithMeta('shp')}>Download SHP</button>
          </div>
        </>
      )}
    </div>
  );
}