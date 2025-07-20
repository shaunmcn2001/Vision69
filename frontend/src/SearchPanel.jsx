import { useState } from 'react';
import { API_BASE } from './api.js';

export default function SearchPanel({ onResults, features, selected, toggle, download }) {
  const [single, setSingle] = useState('');
  const [bulk, setBulk] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // ─── helpers ─────────────────────────────────────────────────────────────
  const parseBulkInput = (txt) =>
    txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

  const doSearch = async (inputs) => {
    if (!inputs.length) return;
    setLoading(true);
    setError('');

    try {
      const r = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      });
      if (!r.ok) throw new Error(`API error ${r.status}`);
      const json = await r.json();
      onResults(json.features || []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── handlers ────────────────────────────────────────────────────────────
  const handleSingle = (e) => setSingle(e.target.value);

  const submitSingle = (e) => {
    e.preventDefault();
    if (single.trim()) doSearch([single.trim()]);
  };

  const submitBulk = (e) => {
    e.preventDefault();
    const list = parseBulkInput(bulk);
    if (list.length) doSearch(list);
  };

  // ─── render ──────────────────────────────────────────────────────────────
  return (
    <div className="search-panel">
      {/* ───────── Single lot/plan ───────── */}
      <form onSubmit={submitSingle} className="form-block">
        <label htmlFor="singleInput">Lot / Plan</label>
        <input
          id="singleInput"
          name="lotplan-single"
          value={single}
          onChange={handleSingle}
          placeholder="e.g. 3RP123456  or  43/DP987654"
          autoComplete="off"
        />
        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>

      {/* ───────── Bulk list ───────── */}
      <form onSubmit={submitBulk} className="form-block">
        <label htmlFor="bulkInput">Bulk list (one per line)</label>
        <textarea
          id="bulkInput"
          name="lotplan-bulk"
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder="Lot-Plan on each line"
          rows={6}
        />
        <button type="submit" disabled={loading}>
          Search bulk
        </button>
      </form>

      {/* ───────── Download row ───────── */}
      {features.length > 0 && (
        <div className="download-row">
          <button onClick={() => download('kml')}>Download KML</button>
          <button onClick={() => download('shp')}>Download SHP</button>
        </div>
      )}

      {/* ───────── Results list ───────── */}
      {features.length > 0 && (
        <ul className="results-list">
          {features.map((f, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={!!selected[i]}
                  onChange={() => toggle(i)}
                />
                {f.properties.lot ? (
                  <>
                    {f.properties.lot}/{f.properties.plan}
                  </>
                ) : (
                  <>
                    {f.properties.lotnumber}
                    {f.properties.sectionnumber
                      ? `/${f.properties.sectionnumber}`
                      : ''}
                    /DP{f.properties.planlabel}
                  </>
                )}
              </label>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Searching…</p>}
    </div>
  );
}
