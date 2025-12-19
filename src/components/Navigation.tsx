import React from 'react';
import { AppMode } from '../types';
import { Search, Image, MessageSquare } from 'lucide-react';

interface NavigationProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.SEARCH, icon: <Search size={20} />, label: 'Search' },
    { mode: AppMode.IMAGE, icon: <Image size={20} />, label: 'Create' },
    { mode: AppMode.CHAT, icon: <MessageSquare size={20} />, label: 'Chat' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 md:relative md:border-t-0 md:bg-transparent md:backdrop-blur-none">
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="flex justify-around md:justify-center md:gap-8 py-3 md:py-6">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentMode === item.mode
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;