import { useState } from 'react';
import ResultsList from './ResultsList.jsx';
import { API_BASE } from './api.js';

export default function SearchPanel({ onResults, features, selected, toggle, download, style, setStyle, onClose }) {
  const [bulk, setBulk] = useState('');
  const [folderName, setFolderName] = useState('Parcels');
  const [fileName, setFileName] = useState('parcels.kml');

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
    <div className="w-80 max-w-sm bg-gray-800 text-white p-4 overflow-y-auto border-l border-gray-700 text-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Search</h2>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
      <textarea
        className="input-base w-full h-28 mb-2"
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        placeholder="QLD 3RP123456\nNSW 4/DP765432"
      />
      <button className="btn-primary w-full mb-2" onClick={handleSearch}>
        Search
      </button>
      {features.length > 0 && (
        <>
          <hr className="my-3 border-gray-700" />
          <h3 className="font-semibold mb-1">Export</h3>
          <label className="block mb-1">Folder name
            <input className="input-base w-full mt-1" value={folderName} onChange={(e)=>setFolderName(e.target.value)} />
          </label>
          <label className="block mb-1">File name
            <input className="input-base w-full mt-1" value={fileName} onChange={(e)=>setFileName(e.target.value)} />
          </label>
          <hr className="my-3 border-gray-700" />
          <h3 className="font-semibold mb-1">Style</h3>
          <div className="flex space-x-2 mb-2">
            <label className="inline-flex items-center">Fill
              <input type="color" className="ml-2" value={style.fill} onChange={(e)=>updateStyle({fill:e.target.value})} />
            </label>
            <label className="inline-flex items-center">Outline
              <input type="color" className="ml-2" value={style.outline} onChange={(e)=>updateStyle({outline:e.target.value})} />
            </label>
          </div>
          <label className="block">Opacity
            <input type="range" min={0} max={1} step={0.01} className="w-full" value={style.opacity} onChange={(e)=>updateStyle({opacity:+e.target.value})} />
            <span className="ml-2 font-mono">{style.opacity.toFixed(2)}</span>
          </label>
          <label className="block mt-2">Outline weight
            <input type="number" min={0} max={10} className="input-base mt-1 w-20" value={style.weight} onChange={(e)=>updateStyle({weight:+e.target.value})} />
          </label>
          <ResultsList features={features} selected={selected} toggle={toggle} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button className="btn-primary" onClick={()=>downloadWithMeta('kml')}>Download KML</button>
            <button className="btn-primary" onClick={()=>downloadWithMeta('shp')}>Download SHP</button>
          </div>
        </>
      )}
    </div>
  );
}
