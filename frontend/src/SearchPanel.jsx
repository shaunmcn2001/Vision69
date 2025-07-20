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
}) {
  const [bulk, setBulk] = useState('');
  const [folderName, setFolderName] = useState('Parcels');
  const [fileName, setFileName] = useState('parcels.kml');

  const handleSearch = async () => {
    const lines = bulk
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) return;

    const resp = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: lines }),
    });

    if (!resp.ok) return;
    const data = await resp.json();
    onResults(data.features || []);
  };

  const updateStyle = (patch) => setStyle({ ...style, ...patch });

  /*  ↓↓↓ modified download: pass folderName & fileName ↓↓↓  */
  const downloadWithMeta = (type) =>
    download(type, folderName, type === 'kml' ? fileName : fileName.replace(/\.kml$/i, '.zip'));

  return (
    <div className="sidebar">
      <h2>Search</h2>
      <textarea
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        placeholder="QLD: 3RP123456&#10;NSW: 4/DP765432 or 4/1/DP765432"
      />
      <button className="primary" onClick={handleSearch}>
        Search
      </button>

      {features.length > 0 && (
        <>
          <hr />
          <h3>Export options</h3>
          <label>
            KML folder name
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </label>
          <label>
            Download file name
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </label>

          <hr />
          <h3>Style</h3>
          {/* … unchanged colour / opacity controls … */}

          <ResultsList
            features={features}
            selected={selected}
            toggle={toggle}
          />

          <div className="downloads">
            <button onClick={() => downloadWithMeta('kml')}>Download&nbsp;KML</button>
            <button onClick={() => downloadWithMeta('shp')}>Download&nbsp;SHP</button>
          </div>
        </>
      )}
    </div>
  );
}
