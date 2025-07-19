export default function ResultsList({ features, selected, toggle }) {
  return (
    <div className="results">
      {features.map((f, i) => (
        <label key={i}>
          <input
            type="checkbox"
            checked={!!selected[i]}
            onChange={() => toggle(i)}
          />
          {f.properties.lot || f.properties.lotnumber}{' '}
          {f.properties.plan || f.properties.planlabel}
        </label>
      ))}
    </div>
  );
}
