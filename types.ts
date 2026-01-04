// SimulationNodeDatum is from d3, but we define our shape extending it loosely for now
export interface GraphNode {
  id: string;
  label: string;
  group: string; // e.g., 'concept', 'root', 'detail'
  description?: string;
  notes?: string; // User's personal notes
  val?: number; // Size/Importance
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relation?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphConfig {
  repelForce: number;   // Lực đẩy giữa các node
  linkDistance: number; // Độ dài liên kết
  centerForce: number;  // Lực hút về tâm
  nodeSize: number;     // Kích thước node
  fontSize: number;     // Kích thước chữ
}

export interface AiResponse {
  nodes: {
    id: string;
    label: string;
    type: string;
    description: string;
  }[];
  links: {
    source: string;
    target: string;
    relation: string;
  }[];
}