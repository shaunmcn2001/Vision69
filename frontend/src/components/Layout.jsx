import { useState } from 'react';
import MapView from './MapView';
import { API_BASE } from '../api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bulk, setBulk] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const handleSearch = async () => {
    const lines = bulk
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) return;
    setError('');
    try {
      const r = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: lines }),
      });
      if (!r.ok) throw new Error('Search failed');
      const data = await r.json();
      setResults(data.features || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch results');
    }
  };

  const handleDownload = async () => {
    if (!results.length) return;
    setError('');
    try {
      const r = await fetch(`${API_BASE}/api/download/kml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: results }),
      });
      if (!r.ok) throw new Error('Download failed');
      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parcels.kml';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to download KML');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static z-30 w-64 bg-gray-50 dark:bg-gray-800 transition-transform duration-300 flex-shrink-0`}
      >
        <div className="h-12 flex items-center px-4 text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
          Vision
        </div>
        <nav className="p-4 space-y-2">
          <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleSearch}>
            Search Parcels
          </button>
          <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleDownload}>
            Export to KML
          </button>
          <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setResults([])}>
            Reset Map
          </button>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64">
        {/* Navbar */}
        <nav className="h-12 bg-gray-800 text-white flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-md hover:bg-gray-700 md:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-semibold">Vision</span>
          </div>
          <div></div>
        </nav>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Search and results */}
          <div className="md:w-80 p-4 space-y-4 overflow-y-auto bg-white dark:bg-gray-900">
            <textarea
              className="w-full h-24 p-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={'QLD 3RP123456\nNSW 4/DP765432'}
            />
            <button
              className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2"
              onClick={handleSearch}
            >
              Search
            </button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {results.length > 0 && (
              <div className="space-y-2">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-2 py-1">
                        Lot
                      </th>
                      <th scope="col" className="px-2 py-1">
                        Plan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((f, i) => {
                      const p = f.properties || {};
                      return (
                        <tr key={i} className="border-b dark:border-gray-700">
                          <td className="px-2 py-1">{p.lot ?? p.lotnumber ?? ''}</td>
                          <td className="px-2 py-1">{p.plan ?? p.planlabel ?? ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button
                  className="w-full text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-4 py-2"
                  onClick={handleDownload}
                >
                  Download KML
                </button>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 overflow-hidden">
            <MapView />
          </div>
        </div>
      </div>
    </div>
  );
}

