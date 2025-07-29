import { useState } from 'react';
import ResultsList from './ResultsList.jsx';
import { API_BASE } from './api.js';

/**
 * The search panel provides an interface for parcel lookup and style
 * configuration. Users can paste multiple lot/plan identifiers into the
 * textarea separated by new lines. The panel also exposes controls to
 * choose which features to export and how they should be styled on the map.
 *
 * Props:
 *   onResults: callback invoked with an array of features when search completes
 *   features: array of current features
 *   selected: object mapping feature index to a boolean selected state
 *   toggle: function called with an index when a result checkbox is toggled
 *   download: function accepting (type, folderName, fileName) to initiate download
 *   style: current style object { fill, outline, opacity, weight }
 *   setStyle: function to update the style
 *   onClose: called to close the panel
 */
export default function SearchPanel({ onResults, features, selected, toggle, download, style, setStyle, onClose }) {
  const [bulk, setBulk] = useState('');
  const [folderName, setFolderName] = useState('Parcels');
  const [fileName, setFileName] = useState('parcels.kml');

  const handleSearch = async () => {
    const lines = bulk
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) return;
    try {
      const r = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: lines }),
      });
      if (!r.ok) return;
      const data = await r.json();
      onResults(data.features || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStyle = (p) => setStyle({ ...style, ...p });
  const downloadWithMeta = (t) => {
    const fname = t === 'kml' ? fileName : fileName.replace(/\.kml$/i, '.zip');
    download(t, folderName, fname);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Search</h2>
        <button className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <textarea
        className="input-base w-full h-24"
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        placeholder="QLD 3RP123456\nNSW 4/DP765432"
      ></textarea>
      <button className="btn-primary w-full" onClick={handleSearch}>
        Search
      </button>
      {features.length > 0 && (
        <>
          <ResultsList features={features} selected={selected} toggle={toggle} />
          {/* Export section */}
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">Export</h3>
            <label className="text-sm">Folder name</label>
            <input
              className="input-base w-full"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <label className="text-sm">File name</label>
            <input
              className="input-base w-full"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1" onClick={() => downloadWithMeta('kml')}>
                Download KML
              </button>
              <button className="btn-secondary flex-1" onClick={() => downloadWithMeta('shp')}>
                Download SHP
              </button>
            </div>
          </div>
          {/* Style section */}
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">Style</h3>
            <label className="text-sm">Fill</label>
            <input
              type="color"
              className="w-full h-8"
              value={style.fill}
              onChange={(e) => updateStyle({ fill: e.target.value })}
            />
            <label className="text-sm">Outline</label>
            <input
              type="color"
              className="w-full h-8"
              value={style.outline}
              onChange={(e) => updateStyle({ outline: e.target.value })}
            />
            <label className="text-sm">Opacity ({style.opacity.toFixed(2)})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={style.opacity}
              onChange={(e) => updateStyle({ opacity: +e.target.value })}
            />
            <label className="text-sm">Outline weight</label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={style.weight}
              onChange={(e) => updateStyle({ weight: +e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  );
}