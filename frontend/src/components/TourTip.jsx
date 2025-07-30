export default function TourTip({ text = "Access the crop rotation in your territory.", onNext }) {
  return (
    <div className="glass panel-shadow rounded-lg p-3 text-sm text-gray-100 max-w-sm">
      <div className="font-semibold mb-1">Tip</div>
      <div className="text-gray-300 mb-2">{text}</div>
      <button onClick={onNext} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Next →</button>
    </div>
  );
}
