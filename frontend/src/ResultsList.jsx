export default function ResultsList({ features, selected, toggle }) {
  return (
    <div className="mt-3">
      <div className="text-sm text-gray-300 mb-2">Results ({features.length})</div>
      <div className="space-y-1">
        {features.map((f, i) => {
          const p = f.properties || {};
          const lot = p.lot ?? p.lotnumber ?? '';
          const plan = p.plan ?? p.planlabel ?? '';
          return (
            <label key={i} className="flex items-center gap-2 text-sm bg-gray-900/60 px-2 py-1 rounded">
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={!!selected[i]}
                onChange={() => toggle(i)}
              />
              <span className="truncate">{lot} {plan}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
