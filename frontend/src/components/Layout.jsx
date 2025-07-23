import { useState } from 'react';
import Map from '../Map.jsx';
import SearchPanel from '../SearchPanel.jsx';
import Sidebar from './Sidebar.jsx';
import { API_BASE } from '../api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState({});
  const [style, setStyle] = useState({
    fill: '#ff0000',
    outline: '#000000',
    opacity: 0.5,
    weight: 2,
  });

  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const handleResults = (list) => {
    setFeatures(list);
    setSelected({});
  };

  const toggleSelected = (idx) => {
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  };

  const download = async (type, folderName, fileName) => {
    const sel = features.filter((_, i) => selected[i]);
    const body = {
      features: sel.length ? sel : features,
      folderName,
      fileName,
    };
    const r = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return;
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        openSearch={() => setSearchOpen(true)}
        download={() => download('kml', 'Parcels', 'parcels.kml')}
        resetMap={() => setFeatures([])}
      />

      <div className="flex flex-col flex-1 p-4 sm:ml-64 relative">
        <nav className="h-12 bg-gray-800 text-white flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              onClick={toggleSidebar}
              aria-controls="logo-sidebar"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
              </svg>
            </button>
            <span className="font-semibold">Vision</span>
          </div>
          <div></div>
        </nav>

        <div className="flex-1 overflow-hidden">
          <Map features={features} style={style} onFeatureClick={toggleSelected} />
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 z-50 transform transition-transform duration-300 ${searchOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <SearchPanel
          onResults={handleResults}
          features={features}
          selected={selected}
          toggle={toggleSelected}
          download={download}
          style={style}
          setStyle={setStyle}
          onClose={() => setSearchOpen(false)}
        />
      </div>
    </div>
  );
}
