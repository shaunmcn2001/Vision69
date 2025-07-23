import logo from '../assets/logo.svg?url';

export default function Topbar({ onToggleSidebar, onToggleSearch, className = '' }) {
  return (
    <nav className={`bg-gray-800 text-white flex items-center px-4 h-12 ${className}`}>
      <button
        type="button"
        className="p-2 sm:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" />
        </svg>
      </button>
      <img src={logo} alt="Vision" className="h-8 w-8 mx-2" />
      <span className="font-semibold flex-1">Vision</span>
      <button className="btn-secondary" onClick={onToggleSearch} type="button">
        Search
      </button>
    </nav>
  );
}
