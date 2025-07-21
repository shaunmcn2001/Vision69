import {
  MagnifyingGlassIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import logo from './assets/logo.svg';          // <-- put your SVG here

export default function NavBar({ onToggleSearch }) {
  const Btn = ({ children, onClick }) => (
    <button
      className="p-2 rounded hover:bg-gray-100 active:bg-gray-200"
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <header className="h-12 flex items-center justify-between border-b px-3 shrink-0">
      <img src={logo} alt="Vision" className="h-7" />

      <div className="flex items-center gap-2">
        <Btn onClick={onToggleSearch}>
          <MagnifyingGlassIcon className="h-6 w-6" />
        </Btn>
        <Btn>
          <Cog6ToothIcon className="h-6 w-6" />
        </Btn>
      </div>
    </header>
  );
}
