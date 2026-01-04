import React from 'react';
import { GraphNode } from '../types';

interface ResourcesViewProps {
  nodes: GraphNode[];
}

const ResourcesView: React.FC<ResourcesViewProps> = ({ nodes }) => {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <span className="text-4xl mb-4">❖</span>
        <p>Chưa có tài nguyên. Hãy tạo bản đồ kiến thức trước.</p>
      </div>
    );
  }

  // Group nodes by type
  const groupedNodes = nodes.reduce((acc, node) => {
    const group = node.group || 'others';
    if (!acc[group]) acc[group] = [];
    acc[group].push(node);
    return acc;
  }, {} as Record<string, GraphNode[]>);

  return (
    <div className="h-full overflow-y-auto p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Tài Nguyên Tri Thức</h2>
      <p className="text-slate-400 mb-8">Danh sách tổng hợp tất cả các khái niệm bạn đã khám phá.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedNodes).map(([group, groupNodes]: [string, GraphNode[]]) => (
          <div key={group} className="col-span-full mb-4">
             <h3 className="text-xl font-semibold text-accentSecondary uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                {group === 'root' ? 'Chủ đề chính' : group === 'concept' ? 'Khái niệm' : group}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupNodes.map(node => (
                    <div key={node.id} className="glass-panel p-5 rounded-xl hover:bg-slate-800/50 transition-colors border border-slate-700/50">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white text-lg">{node.label}</h4>
                            {node.notes && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">Có ghi chú</span>}
                        </div>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-3">{node.description}</p>
                        {node.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Ghi chú của bạn:</p>
                                <p className="text-slate-300 text-sm italic">"{node.notes}"</p>
                            </div>
                        )}
                    </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesView;