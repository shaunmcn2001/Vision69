/** Compact selectable results table */
export default function ResultsList({ features, selected, toggle }) {
  return (
    <div className="mt-3">
      <h3 className="font-semibold mb-1">Results ({features.length})</h3>
      <div className="max-h-64 overflow-auto border border-gray-700">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-700 text-gray-100">
              <th className="px-2 py-1">Select</th>
              <th className="px-2 py-1">Lot</th>
              <th className="px-2 py-1">Plan</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => {
              const p = f.properties || {};
              const lot = p.lot ?? p.lotnumber ?? '';
              const plan = p.plan ?? p.planlabel ?? '';
              return (
                <tr key={i} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={!!selected[i]}
                      onChange={() => toggle(i)}
                    />
                  </td>
                  <td className="px-2 py-1">{lot}</td>
                  <td className="px-2 py-1">{plan}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
