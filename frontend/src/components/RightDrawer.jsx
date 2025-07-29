import { useEffect } from 'react';

export default function RightDrawer({ open, title, onClose, width = 420, children }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 49 }}
      />
      <aside
        className="fixed top-0 right-0 h-screen bg-gray-950 text-white border-l border-gray-800 shadow-xl transition-transform"
        style={{
          width,
          transform: open ? 'translateX(0)' : `translateX(${width}px)`,
          zIndex: 50
        }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700">Close</button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100vh-56px)]">{children}</div>
      </aside>
    </>
  );
}
