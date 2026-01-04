import React, { useState } from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: "◎", label: "Tổng quan", shortcut: "Alt+1" },
    { id: 'graph', icon: "☊", label: "Bản đồ tư duy", shortcut: "Alt+2" },
    { id: 'resources', icon: "❖", label: "Tài nguyên", shortcut: "Alt+3" },
    { id: 'flashcards', icon: "⚡", label: "Thẻ ghi nhớ", shortcut: "Alt+4" },
  ];

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex-shrink-0 border-r border-slate-800 bg-bgPanel flex flex-col h-full z-20 transition-all duration-300 ease-in-out ${
        isHovered ? 'w-64 shadow-2xl' : 'w-20'
      }`}
    >
      <div className={`h-16 flex items-center border-b border-slate-800 transition-all duration-300 ${isHovered ? 'px-6 justify-start' : 'justify-center px-0'}`}>
        <div className="w-8 h-8 flex-shrink-0 rounded bg-gradient-to-tr from-accentPrimary to-accentPurple flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
          F
        </div>
        <div className={`ml-3 font-bold text-xl tracking-tight text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isHovered ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
        }`}>
          Feynman Hub
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-2 md:px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={!isHovered ? `${item.label} (${item.shortcut})` : undefined}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative overflow-hidden whitespace-nowrap
              ${currentView === item.id 
                ? 'bg-accentPrimary/10 text-accentPrimary shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }
              ${isHovered ? 'justify-start' : 'justify-center'}
            `}
          >
            {currentView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accentPrimary rounded-r-full"></div>
            )}
            <span className="text-xl group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
            
            <span className={`ml-3 font-medium transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-10'
            }`}>
              {item.label}
            </span>
            
            <span className={`ml-auto text-[10px] text-slate-600 font-mono transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              {item.shortcut}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 overflow-hidden">
        <div className={`glass-panel p-3 rounded-xl border-slate-700/50 transition-all duration-300 flex items-center ${isHovered ? 'bg-slate-800/50' : 'bg-transparent border-0 justify-center'}`}>
           <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 overflow-hidden ring-2 ring-slate-700">
              <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Felix`} alt="User" />
           </div>
           <div className={`ml-3 transition-all duration-300 whitespace-nowrap overflow-hidden ${isHovered ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0'}`}>
              <div className="text-sm font-bold text-white">Người dùng</div>
              <div className="text-xs text-slate-400">Gói Pro</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;