export default function TopBar({ onOpenHelp }) {
  return (
    <header className="h-14 w-full bg-gray-950/95 border-b border-gray-800 flex items-center px-4 gap-4">
      {/* Left brand */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-600 grid place-items-center text-xs font-bold">V</div>
        <div className="font-semibold text-gray-100">Vision</div>
      </div>

      {/* Center title */}
      <div className="flex-1 text-center text-sm text-gray-300">
        Cartography • Parcels
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
          Make an appointment
        </button>
        <button onClick={onOpenHelp} className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm">
          ?
        </button>
      </div>
    </header>
  );
}
