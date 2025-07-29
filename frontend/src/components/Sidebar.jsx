/**
 * Sidebar provides navigation actions for the application. It displays a title
 * and buttons to open the search panel, download parcel data and reset the map.
 *
 * Props:
 *   openSearch: function to call when the search button is pressed.
 *   download: function accepting (type, folderName, fileName) used to
 *     download KML or SHP outputs.
 *   resetMap: function to clear all current parcels from the map.
 */
export default function Sidebar({ openSearch, download, resetMap }) {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Vision</h1>
      <button className="btn-primary w-full" onClick={openSearch}>
        Search Parcels
      </button>
      <button
        className="btn-secondary w-full"
        onClick={() => download('kml', 'Parcels', 'parcels.kml')}
      >
        Download KML
      </button>
      <button
        className="btn-secondary w-full"
        onClick={() => download('shp', 'Parcels', 'parcels.zip')}
      >
        Download SHP
      </button>
      <button className="btn-secondary w-full" onClick={resetMap}>
        Reset Map
      </button>
    </div>
  );
}