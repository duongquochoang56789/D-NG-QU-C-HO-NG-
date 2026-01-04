import React from 'react';
import { GraphConfig } from '../types';

interface GraphSettingsPanelProps {
  config: GraphConfig;
  onChange: (newConfig: GraphConfig) => void;
  onClose: () => void;
}

const GraphSettingsPanel: React.FC<GraphSettingsPanelProps> = ({ config, onChange, onClose }) => {
  
  const handleChange = (key: keyof GraphConfig, value: number) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="absolute top-20 right-6 w-72 glass-panel rounded-xl shadow-2xl border border-slate-700/50 z-40 flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30 rounded-t-xl">
        <h3 className="font-semibold text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="text-accentSecondary">⚙</span> Cấu hình đồ thị
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
      </div>
      
      <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        
        {/* Lực (Forces) Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase">Lực vật lý</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Lực đẩy (Repel)</label>
              <span className="text-slate-500">{config.repelForce}</span>
            </div>
            <input 
              type="range" 
              min="50" max="1000" step="10"
              value={config.repelForce}
              onChange={(e) => handleChange('repelForce', Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accentPrimary hover:bg-slate-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Lực hút tâm (Center)</label>
              <span className="text-slate-500">{config.centerForce.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.01"
              value={config.centerForce}
              onChange={(e) => handleChange('centerForce', Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accentPrimary hover:bg-slate-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Độ dài liên kết</label>
              <span className="text-slate-500">{config.linkDistance}</span>
            </div>
            <input 
              type="range" 
              min="20" max="300" step="5"
              value={config.linkDistance}
              onChange={(e) => handleChange('linkDistance', Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accentPrimary hover:bg-slate-600"
            />
          </div>
        </div>

        <div className="h-px bg-slate-700/50"></div>

        {/* Hiển thị (Display) Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase">Hiển thị</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Kích thước Node</label>
              <span className="text-slate-500">x{config.nodeSize.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0.5" max="3" step="0.1"
              value={config.nodeSize}
              onChange={(e) => handleChange('nodeSize', Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accentSecondary hover:bg-slate-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Cỡ chữ</label>
              <span className="text-slate-500">{config.fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="8" max="24" step="1"
              value={config.fontSize}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accentSecondary hover:bg-slate-600"
            />
          </div>
        </div>

        <div className="pt-2 text-[10px] text-slate-600 italic text-center">
            Điều chỉnh thông số để tối ưu hóa hiển thị
        </div>

      </div>
    </div>
  );
};

export default GraphSettingsPanel;