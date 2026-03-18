export interface Project {
  id: number;
  name: string;
  task: string;
  status: "In Progress" | "Completed" | "New";
  count: number;
}

export const projects: Project[] = [
  { 
    id: 1, 
    name: "Traffic Sign Detection", 
    task: "Object Detection", 
    status: "In Progress", 
    count: 1250 
  },
  { 
    id: 2, 
    name: "Medical NLP Labeling", 
    task: "Entity Recognition", 
    status: "Completed", 
    count: 500 
  },
  { 
    id: 3, 
    name: "Autonomous Vehicle Relations", 
    task: "Semantic Relation", 
    status: "New", 
    count: 0 
  },
];