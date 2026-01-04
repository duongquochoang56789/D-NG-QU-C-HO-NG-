import React from 'react';

const TopBar: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-bgPanel/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-white">Bản Đồ Kiến Thức</h1>
        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 border border-slate-700">Beta</span>
      </div>

      <div className="flex items-center space-x-4">
         <button className="px-4 py-1.5 rounded-full border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
            Góp ý
         </button>
         <button className="w-24 h-9 bg-accentPrimary hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all">
            Chia sẻ
         </button>
      </div>
    </header>
  );
};

export default TopBar;