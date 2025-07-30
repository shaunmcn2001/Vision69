export default function LeftRail({ onOpenSearch, onOpenStyle, onOpenExport, onReset }) {
  return (
    <aside className="h-full w-16 bg-gray-950 border-r border-gray-800 text-white flex flex-col items-center py-3 gap-3">
      <div className="text-[10px] tracking-wide text-gray-400 select-none mt-1">MENU</div>

      <button onClick={onOpenSearch} title="Search"
        className="w-10 h-10 rounded bg-blue-600 hover:bg-blue-700 grid place-items-center text-sm">Q</button>
      <button onClick={onOpenStyle} title="Style"
        className="w-10 h-10 rounded bg-purple-600 hover:bg-purple-700 grid place-items-center text-sm">S</button>
      <button onClick={onOpenExport} title="Export"
        className="w-10 h-10 rounded bg-emerald-600 hover:bg-emerald-700 grid place-items-center text-sm">↓</button>

      <div className="mt-auto" />

      <button onClick={onReset} title="Reset"
        className="w-10 h-10 rounded bg-gray-800 hover:bg-gray-700 grid place-items-center text-base">⟲</button>
    </aside>
  );
}
