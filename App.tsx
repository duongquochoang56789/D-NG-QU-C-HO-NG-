import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KnowledgeGraph from './components/KnowledgeGraph';
import ResourcesView from './components/ResourcesView';
import FlashcardView from './components/FlashcardView';
import GraphSettingsPanel from './components/GraphSettingsPanel';
import NoteEditor from './components/NoteEditor';
import Typewriter from './components/Typewriter'; // Import Typewriter
import { generateKnowledgeGraph, expandConcept } from './services/geminiService';
import { GraphData, GraphNode, GraphLink, GraphConfig } from './types';

function App() {
  const [currentView, setCurrentView] = useState('graph'); // 'dashboard', 'graph', 'resources', 'flashcards'
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [topicInput, setTopicInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Default Graph Configuration
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    repelForce: 400,
    linkDistance: 150,
    centerForce: 0.05,
    nodeSize: 1,
    fontSize: 12
  });

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Settings: Cmd+, or Ctrl+,
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }

      // Navigation: Alt + Number
      if (e.altKey) {
         if(e.key === '1') { e.preventDefault(); setCurrentView('dashboard'); }
         if(e.key === '2') { e.preventDefault(); setCurrentView('graph'); }
         if(e.key === '3') { e.preventDefault(); setCurrentView('resources'); }
         if(e.key === '4') { e.preventDefault(); setCurrentView('flashcards'); }
      }

      // Escape to close things
      if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else if (selectedNode) {
          setSelectedNode(null);
        } else {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, selectedNode]);

  // Helper to merge new data
  const mergeGraphData = (newData: { nodes: any[], links: any[] }) => {
    setGraphData(prev => {
        const nodeMap = new Map(prev.nodes.map(n => [n.id, n]));
        
        // Add new nodes
        newData.nodes.forEach(n => {
            if (!nodeMap.has(n.id)) {
                nodeMap.set(n.id, {
                    ...n,
                    group: n.type === 'concept' ? 'concept' : n.type === 'detail' ? 'history' : 'tool', // Simple mapping
                    val: 10,
                    x: Math.random() * 100, // Initialize pos to avoid 0,0 overlap
                    y: Math.random() * 100
                });
            }
        });

        // Add new links, avoiding duplicates
        const linkSet = new Set(prev.links.map(l => {
             const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
             const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
             return `${sourceId}-${targetId}`;
        }));

        const mergedLinks = [...prev.links];
        newData.links.forEach(l => {
            const key = `${l.source}-${l.target}`;
            if (!linkSet.has(key)) {
                mergedLinks.push(l);
            }
        });

        return {
            nodes: Array.from(nodeMap.values()),
            links: mergedLinks
        };
    });
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setSelectedNode(null);
    setCurrentView('graph'); // Switch to graph to see result

    try {
      const existingIds = graphData.nodes.map(n => n.id);
      const data = await generateKnowledgeGraph(topicInput, existingIds);
      
      // Ensure the root node is marked correctly
      const processedNodes = data.nodes.map((n, idx) => ({
          ...n,
          group: idx === 0 ? 'root' : n.type === 'concept' ? 'concept' : 'tool',
          val: idx === 0 ? 30 : 15
      }));
      
      mergeGraphData({ nodes: processedNodes, links: data.links });
      setTopicInput('');
    } catch (err) {
      setError("Không thể tạo bản đồ kiến thức. Vui lòng kiểm tra API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandNode = async () => {
      if (!selectedNode) return;
      setIsExpanding(true);
      try {
          const existingIds = graphData.nodes.map(n => n.id);
          const data = await expandConcept(selectedNode.label, existingIds);
          
          // Ensure new links connect to the selected node if not explicitly returned
          const newLinks = data.links.map(l => l);
          data.nodes.forEach(n => {
             // If this node doesn't have a link in the response, link it to the selected node
             const hasLink = newLinks.some(l => l.source === n.id || l.target === n.id);
             if(!hasLink) {
                 newLinks.push({ source: selectedNode.id, target: n.id, relation: 'mở rộng' });
             }
          });

          mergeGraphData({ nodes: data.nodes, links: newLinks });
      } catch (err) {
          console.error(err);
      } finally {
          setIsExpanding(false);
      }
  };

  const handleSaveNote = () => {
      if (!selectedNode) return;
      setGraphData(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, notes: noteInput } : n)
      }));
      // Update local selected node state as well
      setSelectedNode(prev => prev ? { ...prev, notes: noteInput } : null);
      setShowNoteEditor(false);
  };

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setNoteInput(node.notes || '');
    setShowNoteEditor(false);
  }, []);

  const renderContent = () => {
      // Wrap content in a div with animation key to trigger transitions
      return (
        <div key={currentView} className="h-full w-full view-transition">
           {(() => {
              switch(currentView) {
                  case 'resources':
                      return <ResourcesView nodes={graphData.nodes} />;
                  case 'flashcards':
                      return <FlashcardView nodes={graphData.nodes} />;
                  case 'dashboard':
                  case 'graph':
                  default:
                      return (
                        <KnowledgeGraph 
                            data={graphData} 
                            config={graphConfig}
                            onNodeClick={handleNodeClick} 
                        />
                      );
              }
           })()}
        </div>
      );
  };

  return (
    <div className="flex h-screen w-full bg-transparent text-slate-200 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <div className="flex-1 flex flex-col h-full relative">
        <TopBar />
        
        <main className="flex-1 relative overflow-hidden">
          {renderContent()}

          {/* Graph Overlays (Only visible in graph view) */}
          {currentView === 'graph' && (
            <>
               {/* Settings Button */}
                <div className="absolute top-6 right-6 z-40">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`glass-panel w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${showSettings ? 'bg-accentPrimary text-white rotate-90' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        title="Cấu hình đồ thị (Ctrl + ,)"
                    >
                        <span className="text-xl">⚙</span>
                    </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <GraphSettingsPanel 
                        config={graphConfig} 
                        onChange={setGraphConfig} 
                        onClose={() => setShowSettings(false)}
                    />
                )}
                
                {/* Floating Interaction Panel */}
                <div className="absolute top-6 left-6 w-80 z-30 flex flex-col gap-4 pointer-events-none">
                    {/* Search Box */}
                    <div className="glass-panel p-4 rounded-2xl shadow-2xl border border-slate-700/50 pointer-events-auto transition-transform hover:scale-[1.02] duration-300">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex justify-between">
                        <span>Thêm kiến thức</span>
                        <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">⌘K</span>
                    </h2>
                    <form onSubmit={handleAddTopic} className="relative">
                        <input 
                        ref={searchInputRef}
                        type="text" 
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        placeholder="Ví dụ: Lỗ đen..."
                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-accentPrimary focus:ring-1 focus:ring-accentPrimary transition-all placeholder-slate-500 text-sm"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-2 top-2 p-1.5 bg-accentPrimary text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50"
                        >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        )}
                        </button>
                    </form>
                    </div>

                    {/* Selected Node Details */}
                    {selectedNode && (
                    <div className="glass-panel p-5 rounded-2xl shadow-2xl border border-slate-700/50 animate-in fade-in slide-in-from-left-4 duration-300 pointer-events-auto max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                selectedNode.group === 'root' ? 'bg-red-500/20 text-red-400' :
                                selectedNode.group === 'concept' ? 'bg-cyan-500/20 text-cyan-400' :
                                'bg-purple-500/20 text-purple-400'
                            }`}>
                                {selectedNode.group}
                            </span>
                            <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white" title="Đóng (Esc)">✕</button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{selectedNode.label}</h3>
                        
                        {showNoteEditor ? (
                            <div className="mb-4 animate-in fade-in duration-300">
                                <NoteEditor 
                                    value={noteInput} 
                                    onChange={setNoteInput} 
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => setShowNoteEditor(false)} className="text-xs text-slate-400 hover:text-white px-2 py-1">Hủy</button>
                                    <button onClick={handleSaveNote} className="text-xs bg-accentPrimary text-white px-3 py-1 rounded">Lưu</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-slate-400 text-sm leading-relaxed mb-3 min-h-[40px]">
                                    {selectedNode.description ? (
                                         // Use Typewriter effect for the description
                                        <Typewriter text={selectedNode.description} speed={10} />
                                    ) : (
                                        "Chưa có mô tả cho khái niệm này."
                                    )}
                                </div>
                                {selectedNode.notes && (
                                    <div className="mb-4 p-2 bg-slate-800/50 rounded border-l-2 border-accentPrimary animate-in slide-in-from-left-2 duration-300">
                                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Ghi chú:</p>
                                        <div className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                                            {selectedNode.notes}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={handleExpandNode}
                                disabled={isExpanding}
                                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-xs font-medium text-white transition-colors flex justify-center items-center gap-2"
                            >
                                {isExpanding && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                Mở rộng
                            </button>
                            <button 
                                onClick={() => setShowNoteEditor(true)}
                                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-white transition-colors"
                            >
                                {selectedNode.notes ? 'Sửa ghi chú' : 'Ghi chú'}
                            </button>
                        </div>
                    </div>
                    )}
                </div>
            </>
          )}
          
        </main>
      </div>
    </div>
  );
}

export default App;