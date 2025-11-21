import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentMode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: ViewMode.CHAT, label: 'PyChat', icon: '⚡' },
    { mode: ViewMode.VIDEO, label: 'Veo Video', icon: '🎥' },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
          P
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden md:block">
          PyChat
        </span>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${currentMode === item.mode 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:translate-x-1'
              }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-medium hidden md:block">{item.label}</span>
            {currentMode === item.mode && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] hidden md:block" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center md:text-left">
          <p className="hidden md:block">Powered by</p>
          <p className="font-semibold text-slate-400 hidden md:block">Gemini 3 Pro & Veo</p>
          <p className="md:hidden">v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;