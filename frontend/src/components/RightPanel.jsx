import { useState } from 'react';
import SearchPanel from '../SearchPanel.jsx';

function InsightsList() {
  const rows = [
    { title: 'Winter wheat', area: '3.5M ha', delta: '+12.4%' },
    { title: 'Maize', area: '2.1M ha', delta: '+14.2%' },
    { title: 'Sunflower', area: '795k ha', delta: '−2.3%' },
    { title: 'Total', area: '8.6M ha', delta: '−3.7%' },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r,i)=>(
        <div key={i} className="bg-gray-900/60 rounded px-3 py-2 flex items-center justify-between">
          <div className="text-sm text-gray-100">{r.title}</div>
          <div className="text-xs text-gray-400">{r.area}</div>
          <div className={`text-xs ${r.delta.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{r.delta}</div>
        </div>
      ))}
    </div>
  );
}

export default function RightPanel({
  open = true,
  onClose,
  features, selected, toggle,
  style, setStyle,
  onResults, onDownload
}) {
  const [tab, setTab] = useState('search'); // 'search' | 'insights'

  return (
    <aside
      className={`fixed right-0 top-14 h-[calc(100vh-56px)] w-[380px] glass panel-shadow border-l border-gray-800 transition-transform`}
      style={{ transform: open ? 'translateX(0)' : 'translateX(380px)', zIndex: 40 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <button onClick={()=>setTab('search')}
            className={`px-3 py-1 rounded text-sm ${tab==='search'?'bg-blue-600 text-white':'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>
            Query & Export
          </button>
          <button onClick={()=>setTab('insights')}
            className={`px-3 py-1 rounded text-sm ${tab==='insights'?'bg-blue-600 text-white':'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>
            Insights
          </button>
        </div>
        <button onClick={onClose} className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm">Close</button>
      </div>

      <div className="p-4 overflow-auto h-[calc(100%-56px)]">
        {tab === 'search' ? (
          <SearchPanel
            onResults={onResults}
            features={features}
            selected={selected}
            toggle={toggle}
            style={style}
            setStyle={setStyle}
            onDownload={onDownload}
          />
        ) : (
          <InsightsList />
        )}
      </div>
    </aside>
  );
}
