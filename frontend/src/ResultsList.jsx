/**
 * Render a selectable list of parcel search results. Each result displays
 * lot and plan identifiers extracted from the feature properties. Users can
 * select or deselect a parcel by clicking the checkbox. The `toggle` prop
 * should update the selection state maintained by the parent component.
 *
 * Props:
 *   features: array of GeoJSON features
 *   selected: object mapping feature indices to a boolean selected state
 *   toggle: function called with an index when a checkbox is toggled
 */
export default function ResultsList({ features, selected, toggle }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Results ({features.length})</h3>
      <div className="max-h-60 overflow-y-auto space-y-1">
        {features.map((f, i) => {
          const p = f.properties || {};
          const lot = p.lot ?? p.lotnumber ?? '';
          const plan = p.plan ?? p.planlabel ?? '';
          return (
            <label key={i} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={!!selected[i]}
                onChange={() => toggle(i)}
              />
              <span>
                {lot} {plan}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}