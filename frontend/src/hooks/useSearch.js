export async function fetchParcels(query) {
  const base = import.meta.env.VITE_API_BASE || '';
  const r = await fetch(`${base}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!r.ok) throw new Error(`Server error ${r.status}`);
  return r.json();
}
