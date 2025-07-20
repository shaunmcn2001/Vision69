/**
 * Compact selectable results table.
 * Falls back to lotnumber/planlabel when lot/plan absent (NSW vs QLD).
 */
export default function ResultsList({ features, selected, toggle }) {
  return (
    <div className="results">
      <h3>Results ({features.length})</h3>
      <div className="results-table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Lot</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => {
              const p = f.properties || {};
              const lot = p.lot ?? p.lotnumber ?? '';
              const plan = p.plan ?? p.planlabel ?? '';
              return (
                <tr key={i}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected[i]}
                      onChange={() => toggle(i)}
                    />
                  </td>
                  <td>{lot}</td>
                  <td>{plan}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
