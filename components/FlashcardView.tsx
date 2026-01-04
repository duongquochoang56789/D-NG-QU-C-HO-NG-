import React, { useState } from 'react';
import { GraphNode } from '../types';

interface FlashcardViewProps {
  nodes: GraphNode[];
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ nodes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <span className="text-4xl mb-4">⚡</span>
        <p>Chưa có thẻ ghi nhớ. Hãy tạo bản đồ kiến thức trước.</p>
      </div>
    );
  }

  const currentNode = nodes[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % nodes.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + nodes.length) % nodes.length);
    }, 200);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
        <div className="absolute top-8 right-8 text-slate-500 font-mono">
            {currentIndex + 1} / {nodes.length}
        </div>

        <div 
            className="w-full max-w-xl aspect-[3/2] perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front Side */}
                <div className="absolute w-full h-full backface-hidden glass-panel rounded-3xl border-2 border-slate-700/50 flex flex-col items-center justify-center p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-bgPanel">
                    <span className="text-sm text-accentPrimary uppercase tracking-widest font-bold mb-4">Khái niệm</span>
                    <h2 className="text-4xl font-bold text-white text-center">{currentNode.label}</h2>
                    <p className="mt-8 text-slate-500 text-sm animate-pulse">Nhấn để lật</p>
                </div>

                {/* Back Side */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 glass-panel rounded-3xl border-2 border-accentPrimary/30 flex flex-col items-center justify-center p-10 shadow-[0_0_50px_rgba(99,102,241,0.1)] bg-bgDark">
                    <span className="text-sm text-accentSecondary uppercase tracking-widest font-bold mb-4">Định nghĩa</span>
                    <p className="text-xl text-slate-200 text-center leading-relaxed">{currentNode.description}</p>
                    {currentNode.notes && (
                        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 w-full">
                            <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Ghi chú:</span>
                            <p className="text-sm text-slate-300 italic">{currentNode.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex gap-6 mt-12">
            <button 
                onClick={handlePrev}
                className="px-6 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
            >
                ← Trước
            </button>
            <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-6 py-3 rounded-xl bg-accentPrimary/20 text-accentPrimary hover:bg-accentPrimary/30 transition-colors font-medium"
            >
                Lật thẻ
            </button>
            <button 
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
            >
                Tiếp →
            </button>
        </div>
        
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
    </div>
  );
};

export default FlashcardView;