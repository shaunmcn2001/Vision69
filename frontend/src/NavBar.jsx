import {
  MagnifyingGlassIcon, HomeIcon, UserGroupIcon,
  BriefcaseIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function NavBar({ onToggleSearch }) {
  const Btn = ({ children, active, onClick }) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition
        ${active
          ? 'bg-blue-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400'
          : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
    >
      {children}
    </button>
  );

  return (
    <aside className="flex flex-col items-center w-16 h-screen py-8 space-y-8
                      border-r bg-white dark:bg-gray-900 dark:border-gray-700">
      <a href="#home">
        <img src="/logo.svg" alt="logo" className="h-6 w-auto" />
      </a>

      <Btn onClick={onToggleSearch} active>
        <MagnifyingGlassIcon className="w-6 h-6" />
      </Btn>

      <Btn><HomeIcon className="w-6 h-6" /></Btn>
      <Btn><UserGroupIcon className="w-6 h-6" /></Btn>
      <Btn><BriefcaseIcon className="w-6 h-6" /></Btn>
      <Btn><Cog6ToothIcon className="w-6 h-6" /></Btn>
    </aside>
  );
}
