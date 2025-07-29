import { useState } from 'react';
import ResultsList from './ResultsList.jsx';
import { API_BASE } from './api.js';

export default function SearchPanel({ onResults, features, selected, toggle, style, setStyle, onDownload }) {
  const [bulk, setBulk] = useState('');
  const [folderName, setFolderName] = useState('Parcels');
  const [fileName, setFileName] = useState('parcels.kml');

  const handleSearch = async () => {
    const lines = bulk.split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) return;
    const r = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: lines })
    });
    if (!r.ok) return;
    const data = await r.json();
    onResults(data.features || []);
  };

  const updateStyle = (p) => setStyle({ ...style, ...p });
  const downloadWithMeta = (t) => onDownload(t, folderName, t === 'kml' ? fileName : fileName.replace(/\.kml$/i, '.zip'));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-gray-300">Bulk lot/plan input</label>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={6}
          placeholder="QLD 3RP123456\nNSW 4/DP765432\n169-173, 203 // DP753311"
          className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-100 placeholder-gray-500"
        />
        <button onClick={handleSearch} className="mt-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700">Run search</button>
      </div>

      <div>
        <div className="text-sm text-gray-300 mb-2">Export</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1 text-gray-400">Folder name</label>
            <input className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={folderName} onChange={(e)=>setFolderName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-400">File name</label>
            <input className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={fileName} onChange={(e)=>setFileName(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={()=>downloadWithMeta('kml')} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700">Download KML</button>
          <button onClick={()=>downloadWithMeta('shp')} className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700">Download SHP</button>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-300 mb-2">Style</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1 text-gray-400">Fill</label>
            <input type="color" value={style.fill} onChange={(e)=>updateStyle({fill:e.target.value})} className="w-full h-9 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-400">Outline</label>
            <input type="color" value={style.outline} onChange={(e)=>updateStyle({outline:e.target.value})} className="w-full h-9 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-400">Opacity</label>
            <input type="range" min="0" max="1" step="0.01" value={style.opacity} onChange={(e)=>updateStyle({opacity:+e.target.value})} className="w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-400">Outline weight</label>
            <input type="range" min="1" max="6" step="1" value={style.weight} onChange={(e)=>updateStyle({weight:+e.target.value})} className="w-full" />
          </div>
        </div>
      </div>

      <ResultsList features={features} selected={selected} toggle={toggle} />
    </div>
  );
}
