import React, { useRef } from 'react';

interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = `${before}${prefix}${selection}${suffix}${after}`;
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
                start + prefix.length,
                end + prefix.length
            );
        }
    }, 0);
  };

  const tools = [
    { icon: 'B', label: 'In đậm', action: () => insertFormat('**', '**'), style: 'font-bold' },
    { icon: 'I', label: 'In nghiêng', action: () => insertFormat('*', '*'), style: 'italic font-serif' },
    { icon: 'H1', label: 'Tiêu đề lớn', action: () => insertFormat('# ', ''), style: 'font-bold text-xs' },
    { icon: 'H2', label: 'Tiêu đề nhỏ', action: () => insertFormat('## ', ''), style: 'font-bold text-[10px]' },
    { icon: '•', label: 'Danh sách', action: () => insertFormat('- ', ''), style: 'text-lg leading-none' },
    { icon: 'link', label: 'Liên kết', action: () => insertFormat('[', '](url)'), style: 'text-[10px]' },
    { icon: 'code', label: 'Code', action: () => insertFormat('`', '`'), style: 'font-mono text-[10px]' },
  ];

  return (
    <div className="flex flex-col border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
         {tools.map((tool, index) => (
             <button
                key={index}
                onClick={tool.action}
                title={tool.label}
                className={`w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex-shrink-0 ${tool.style}`}
             >
                {tool.icon}
             </button>
         ))}
      </div>

      {/* Editor Area */}
      <textarea 
        ref={textareaRef}
        className="w-full h-40 bg-transparent p-3 text-sm text-slate-200 focus:outline-none resize-none font-mono leading-relaxed custom-scrollbar"
        placeholder="Viết ghi chú... (Hỗ trợ Markdown)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      
      <div className="px-2 py-1 bg-slate-800/30 text-[10px] text-slate-500 text-right">
        Markdown Supported
      </div>
    </div>
  );
};

export default NoteEditor;