import { useState } from 'react';
import Map from '../Map.jsx';
import Sidebar from './Sidebar.jsx';
import SearchPanel from './SearchPanel.jsx';
import Topbar from './Topbar.jsx';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <div className="flex-grow">
        <Map sidebarOpen={sidebarOpen} searchOpen={searchOpen} />
      </div>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed left-0 top-0 h-screen z-30"
      />

      {searchOpen && (
        <SearchPanel
          onClose={() => setSearchOpen(false)}
          className="fixed right-0 top-0 h-screen md:w-[420px] w-full bg-white z-20 shadow-lg"
        />
      )}

      <Topbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleSearch={() => setSearchOpen(!searchOpen)}
        className="absolute top-0 left-0 right-0 z-40"
      />
    </div>
  );
}
