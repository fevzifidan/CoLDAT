export interface Project {
  id: number;
  name: string;
  task: string;
  status?: "In Progress" | "Completed" | "New";
  count: number;
  role?: 'admin' | 'annotator' | 'viewer';
  type: 'project' | 'dataset';
}

export const projects: Project[] = [
  { 
    id: 1, 
    name: "Traffic Sign Detection", 
    task: "Object Detection", 
    status: "In Progress", 
    count: 1250,
    role: "annotator",
    type: "project" // Bu bir projedir
  },
  { 
    id: 2, 
    name: "Medical NLP Labeling", 
    task: "Entity Recognition", 
    status: "Completed", 
    count: 500,
    role: "annotator",
    type: "project"
  },
  { 
    id: 3, 
    name: "Autonomous Vehicle Relations", 
    task: "Semantic Relation", 
    status: "New", 
    count: 0,
    role: "viewer",
    type: "project"
  },
  { 
    id: 4, 
    name: "Autonomous Doom Relations", 
    task: "Semantic Relation", 
    status: "Completed", 
    count: 20,
    role: "admin",
    type: "project"
  },
  {
    id: 5,
    name: "Medical NLP Analysis",
    task: "Entity Recognition",
    count: 850,
    role: "admin",
    type: "dataset"
  },
];