export default function MapToolbar({ className = "" }) {
  return (
    <div className={`glass panel-shadow rounded-md p-2 flex items-center gap-2 ${className}`}>
      <button className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">Zoom +</button>
      <button className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">Zoom −</button>
      <div className="w-px h-5 bg-gray-700 mx-1" />
      <button className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">Draw</button>
      <button className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">Measure</button>
    </div>
  );
}
