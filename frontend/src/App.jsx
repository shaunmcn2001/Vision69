import { useState, useMemo, useEffect } from 'react';
import NavBar from './NavBar.jsx';
import ResultDrawer from './ResultDrawer.jsx';
import ParcelMap from './ParcelMap.jsx';    // keep your map component
import SearchPanel from './SearchPanel.jsx';// existing search logic

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen dark:bg-gray-800">
      <NavBar onToggleSearch={() => setDrawerOpen(o => !o)} />

      <ResultDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SearchPanel onClose={() => setDrawerOpen(false)} />
      </ResultDrawer>

      <main className="flex-1">
        <ParcelMap />
      </main>
    </div>
  );
}
