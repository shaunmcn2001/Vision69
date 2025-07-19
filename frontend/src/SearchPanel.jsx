import { useState } from 'react';
import ResultsList from './ResultsList.jsx';
import { API_BASE } from './api.js';

export default function SearchPanel({ onResults, features, selected, toggle, download }) {
  const [bulk, setBulk] = useState('');

  const handleSearch = async () => {
    const resp = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: bulk.split('\n') })
    });
    if (resp.ok) {
      const data = await resp.json();
      onResults(data.features || []);
    }
  };

  return (
    <div className="sidebar">
      <h2>Search Parcels</h2>
      <textarea
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        placeholder="Lot/Plan each line"
      />
      <button onClick={handleSearch}>Search</button>
      <ResultsList features={features} selected={selected} toggle={toggle} />
      {features.length > 0 && (
        <div className="downloads">
          <button onClick={() => download('kml')}>Download KML</button>
          <button onClick={() => download('shp')}>Download SHP</button>
        </div>
      )}
    </div>
  );
}
