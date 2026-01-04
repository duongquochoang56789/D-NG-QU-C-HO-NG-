import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink, GraphConfig } from '../types';

interface KnowledgeGraphProps {
  data: GraphData;
  config: GraphConfig;
  onNodeClick: (node: GraphNode) => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, config, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Refs for D3 objects to access them across effects/callbacks
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const nodeRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);
  const linkRef = useRef<d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const gSelectionRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  
  // Hover State
  const [hoveredNode, setHoveredNode] = useState<{ node: GraphNode, x: number, y: number } | null>(null);

  // Define colors based on groups
  const colorScale = d3.scaleOrdinal<string>()
    .domain(['root', 'concept', 'person', 'tool', 'history'])
    .range(['#ef4444', '#06b6d4', '#a855f7', '#10b981', '#f59e0b']);

  // Handle zooming to a specific node
  const handleZoomToNode = useCallback((node: GraphNode) => {
    if (!svgSelectionRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Target scale (zoom level)
    const scale = 1.5;
    
    // Calculate translate to center the node
    // We want the node at (width/2, height/2)
    // The transform is: translate(tx, ty) scale(k)
    // The node's position in screen coordinates is: x * k + tx, y * k + ty
    // So: width/2 = x * k + tx  =>  tx = width/2 - x * k
    const x = node.x || 0;
    const y = node.y || 0;
    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-x, -y);

    svgSelectionRef.current.transition()
      .duration(750) // Smooth 750ms transition
      .call(zoomBehaviorRef.current.transform, transform);
  }, []);

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svgSelectionRef.current = svg;
    svg.selectAll("*").remove(); // Clear previous render

    // Group for zoom
    const g = svg.append("g");
    gSelectionRef.current = g;

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial Simulation setup
    const simulation = d3.forceSimulation<GraphNode, GraphLink>(data.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id((d) => d.id).distance(config.linkDistance))
      .force("charge", d3.forceManyBody().strength(-config.repelForce))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(config.centerForce))
      .force("collide", d3.forceCollide().radius((d) => (d.group === 'root' ? 30 : 20) * config.nodeSize));

    simulationRef.current = simulation;

    // Draw Links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5);
    linkRef.current = link;

    // Draw Nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        handleZoomToNode(d); // Fly to node
        onNodeClick(d);
      })
      .on("mouseenter", (event, d) => {
        // Show tooltip on hover
        const containerRect = containerRef.current?.getBoundingClientRect();
        if(containerRect) {
            setHoveredNode({
                node: d,
                x: event.clientX - containerRect.left,
                y: event.clientY - containerRect.top
            });
        }
        
        // Highlight effect
        d3.select(event.currentTarget).select("circle")
          .transition().duration(200)
          .attr("stroke", "white")
          .attr("stroke-width", 4)
          .attr("filter", "drop-shadow(0 0 8px rgba(255,255,255,0.5))"); // Add glow
      })
      .on("mouseleave", (event, d) => {
        setHoveredNode(null);
        
        // Remove highlight
        d3.select(event.currentTarget).select("circle")
          .transition().duration(200)
          .attr("stroke", colorScale(d.group))
          .attr("stroke-width", 3)
          .attr("filter", null);
      });
    
    nodeRef.current = node;

    // Node Circles
    node.append("circle")
      .attr("r", (d) => (d.group === 'root' ? 25 : 15) * config.nodeSize)
      .attr("fill", (d) => d.group === 'root' ? '#ef4444' : '#1e293b')
      .attr("stroke", (d) => colorScale(d.group))
      .attr("stroke-width", 3)
      .attr("cursor", "pointer");

    // Node Labels
    const text = node.append("text")
      .text((d) => d.label)
      .attr("x", 0)
      .attr("y", (d) => (d.group === 'root' ? 38 : 30) * config.nodeSize)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .attr("font-size", `${config.fontSize}px`)
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)");

    // Icons
    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", (d) => d.group === 'root' ? 'white' : colorScale(d.group))
      .attr("font-size", (d) => `${(d.group === 'root' ? 20 : 12) * config.nodeSize}px`)
      .style("pointer-events", "none")
      .text((d) => {
        switch(d.group) {
          case 'person': return '👤';
          case 'tool': return '🛠️';
          case 'root': return '★';
          default: return '';
        }
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]); // Dependencies

  // Effect to handle CONFIG changes
  useEffect(() => {
    if (!simulationRef.current || !nodeRef.current) return;
    const simulation = simulationRef.current;
    
    simulation.force("charge", d3.forceManyBody().strength(-config.repelForce));
    simulation.force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id((d) => d.id).distance(config.linkDistance));
    simulation.force("collide", d3.forceCollide().radius((d) => ((d as GraphNode).group === 'root' ? 30 : 20) * config.nodeSize));

    nodeRef.current.selectAll("circle")
       .transition().duration(300)
       .attr("r", (d) => ((d as GraphNode).group === 'root' ? 25 : 15) * config.nodeSize);
    
    nodeRef.current.selectAll("text")
        .transition().duration(300)
        .attr("y", function(this: SVGTextElement, d) {
             const isIcon = this.getAttribute("dy") === ".35em";
             if (isIcon) return 0;
             return ((d as GraphNode).group === 'root' ? 38 : 30) * config.nodeSize;
        })
        .attr("font-size", function(this: SVGTextElement, d) {
             const isIcon = this.getAttribute("dy") === ".35em";
             if (isIcon) return `${((d as GraphNode).group === 'root' ? 20 : 12) * config.nodeSize}px`;
             return `${config.fontSize}px`;
        });

    simulation.alpha(0.3).restart();
  }, [config]);

  // Handle Resize
  useEffect(() => {
      if (!containerRef.current || !simulationRef.current) return;
      const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
              const { width, height } = entry.contentRect;
              simulationRef.current?.force("center", d3.forceCenter(width / 2, height / 2).strength(config.centerForce));
              simulationRef.current?.alpha(0.3).restart();
          }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
  }, [config.centerForce]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent cursor-grab active:cursor-grabbing">
        <svg ref={svgRef} className="w-full h-full block" />
        
        {data.nodes.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none animate-pulse">
                <p>Bắt đầu bằng cách nhập một chủ đề để tạo bản đồ kiến thức</p>
             </div>
        )}

        {/* Hover Preview Tooltip */}
        {hoveredNode && (
            <div 
                className="absolute z-50 pointer-events-none glass-panel p-3 rounded-lg border border-slate-600/50 shadow-2xl max-w-[250px] animate-in fade-in duration-150"
                style={{
                    left: hoveredNode.x + 15, 
                    top: hoveredNode.y + 15,
                }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                         hoveredNode.node.group === 'root' ? 'bg-red-500' : 
                         hoveredNode.node.group === 'concept' ? 'bg-cyan-500' : 'bg-purple-500'
                    }`}></span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{hoveredNode.node.group}</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{hoveredNode.node.label}</h4>
                {/* Note: In hover, we keep static text for instant readability, using typewriter in main detail panel */}
                <p className="text-slate-400 text-xs line-clamp-3">{hoveredNode.node.description}</p>
            </div>
        )}
    </div>
  );
};

export default KnowledgeGraph;