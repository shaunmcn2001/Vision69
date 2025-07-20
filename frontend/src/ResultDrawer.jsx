import { XMarkIcon } from '@heroicons/react/24/solid';

export default function ResultDrawer({ open, onClose, children }) {
  return (
    <div
      className={`fixed inset-y-0 left-16 w-64 sm:w-72 z-50
                  bg-white dark:bg-gray-900 border-r dark:border-gray-700
                  transition-transform duration-300
                  ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">Results</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">{children}</div>
    </div>
  );
}
