import logo from './assets/logo.svg?url';

export default function NavBar({ onToggle }) {
  return (
    <nav className="bg-gray-900 text-white flex items-center justify-between px-4 h-12">
      <div className="flex items-center space-x-2">
        <img src={logo} alt="Vision" className="h-8 w-8" />
        <span className="font-semibold">Vision</span>
      </div>
      <button className="btn-secondary" onClick={onToggle} title="Settings">⚙️</button>
    </nav>
  );
}
