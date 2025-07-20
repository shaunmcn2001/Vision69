import { useState } from 'react';
import ResultsList from './ResultsList.jsx';
import { API_BASE } from './api.js';

/**
 * Sidebar controls:
 * - bulk textarea input
 * - single Search button
 * - style (colour pickers, opacity, weight)
 * - results table w/ checkboxes
 * - download KML / SHP
 */
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

    if (!resp.ok) {
      console.error('Search failed', resp.status);
      return;
    }
    const data = await resp.json();
    onResults(data.features || []);
  };

  const updateStyle = (patch) => setStyle({ ...style, ...patch });

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
          <h3>Style</h3>
          <label className="inline">
            Fill&nbsp;
            <input
              type="color"
              value={style.fill}
              onChange={(e) => updateStyle({ fill: e.target.value })}
            />
          </label>
          <label className="inline">
            Outline&nbsp;
            <input
              type="color"
              value={style.outline}
              onChange={(e) => updateStyle({ outline: e.target.value })}
            />
          </label>
          <label>
            Opacity&nbsp;
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={style.opacity}
              onChange={(e) =>
                updateStyle({ opacity: parseFloat(e.target.value) })
              }
            />
            <span className="range-val">{style.opacity.toFixed(2)}</span>
          </label>
          <label>
            Outline weight&nbsp;
            <input
              type="number"
              min={0}
              max={10}
              value={style.weight}
              onChange={(e) =>
                updateStyle({ weight: Number(e.target.value) })
              }
            />
          </label>

          <hr />
          <ResultsList
            features={features}
            selected={selected}
            toggle={toggle}
          />

          <div className="downloads">
            <button onClick={() => download('kml')}>Download KML</button>
            <button onClick={() => download('shp')}>Download SHP</button>
          </div>
        </>
      )}
    </div>
  );
}
