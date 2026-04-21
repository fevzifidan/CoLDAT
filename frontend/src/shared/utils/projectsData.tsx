export interface Project {
  id: number;
  name: string;
  task: string;
  status: "In Progress" | "Completed" | "New";
  count: number;
  role: 'admin' | 'annotator' | 'viewer' | 'no assigned tasks';
}

export const projects: Project[] = [
  { 
    id: 1, 
    name: "Traffic Sign Detection", 
    task: "Object Detection", 
    status: "In Progress", 
    count: 1250,
    role: "no assigned tasks"
  },
  { 
    id: 2, 
    name: "Medical NLP Labeling", 
    task: "Entity Recognition", 
    status: "Completed", 
    count: 500,
    role: "annotator"
  },
  { 
    id: 3, 
    name: "Autonomous Vehicle Relations", 
    task: "Semantic Relation", 
    status: "New", 
    count: 0,
    role: "viewer"
  },
  { 
    id: 4, 
    name: "Autonomous Doom Relations", 
    task: "Semantic Relation", 
    status: "Completed", 
    count: 20,
    role: "admin"
  },
];