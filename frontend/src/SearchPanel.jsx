import { useState } from 'react';
import ResultsList   from './ResultsList.jsx';
import { API_BASE }  from './api.js';

export default function SearchPanel({
  onResults,
  features = [],
  selected = [],
  toggle,
  download,
  style,
  setStyle,
}) {
  const [bulk,       setBulk]       = useState('');
  const [folderName, setFolderName] = useState('Parcels');
  const [fileName,   setFileName]   = useState('parcels.kml');

  /* -------- execute search -------- */
  const handleSearch = async () => {
    const inputs = bulk
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (inputs.length === 0) return;

    const res = await fetch(`${API_BASE}/api/search`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ inputs }),
    });
    if (!res.ok) return alert('Search failed – check server logs.');
    const data = await res.json();
    onResults(data.features ?? []);
  };

  const updateStyle = (patch) => setStyle({ ...style, ...patch });
  const downloadWithMeta = (type) =>
    download(
      type,
      folderName,
      type === 'kml' ? fileName : fileName.replace(/\.kml$/i, '.zip'),
    );

  /* -------- render -------- */
  return (
    <div className="p-4 space-y-4 w-80 shrink-0">
      <h2 className="text-xl font-semibold">Search</h2>

      <textarea
        className="input-base h-24 resize-none"
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        placeholder="One LotPlan or DP per line"
      ></textarea>

      {/* 🔧 1 — close the button and add a label */}
      <button className="btn-primary w-full" onClick={handleSearch}>
        Search
      </button>

      {features.length > 0 && (
        <>
          <hr />

          {/* ---- export ---- */}
          <h3 className="font-medium">Export options</h3>
          <label className="block text-xs">
            KML folder name
            <input
              type="text"
              className="w-full border rounded p-1 mt-1"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </label>
          <label className="block text-xs mt-2">
            Download file name
            <input
              type="text"
              className="w-full border rounded p-1 mt-1"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </label>

          {/* ---- style ---- */}
          <hr className="my-2" />
          <h3 className="font-medium">Style</h3>
          <label className="block text-xs">
            Fill colour
            <input
              type="color"
              className="w-full h-8 p-0 border rounded mt-1"
              value={style.fillColor}
              onChange={(e) => updateStyle({ fillColor: e.target.value })}
            />
          </label>
          <label className="block text-xs mt-2">
            Fill opacity
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              className="w-full"
              value={style.fillOpacity}
              onChange={(e) =>
                updateStyle({ fillOpacity: Number(e.target.value) })
              }
            />
          </label>

          {/* ---- list & download ---- */}
          <ResultsList
            features={features}
            selected={selected}
            toggle={toggle}
          />

          <div className="flex gap-2 justify-between mt-4">
            {/* 🔧 2 — correct class name */}
            <button
              className="btn-secondary flex-1"
              onClick={() => downloadWithMeta('kml')}
            >
              Download KML
            </button>
            {/* 🔧 3 — correct class name */}
            <button
              className="btn-secondary flex-1"
              onClick={() => downloadWithMeta('shp')}
            >
              Download SHP
            </button>
          </div>
        </>
      )}
    </div>
  );
}
