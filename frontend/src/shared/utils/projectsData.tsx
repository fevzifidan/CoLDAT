export interface Project {
  id: string; // YAML standardı için string (UUID)
  name: string;
  description?: string; // YAML'da mevcut
  task: string;
  status: "Assigned" | "In Progress" | "Submitted" | "Approved" | "Rejected"; // YAML standardı için string
  count: number;
  role: 'admin' | 'annotator' | 'viewer'; // YAML: ProjectMember Role
  type: 'project' | 'dataset';
  created_at?: string; // YAML standardı
}

export const projects: Project[] = [
  { 
    id: "1", 
    name: "Traffic Sign Detection", 
    description: "Detection and classification of international traffic signs.",
    task: "Object Detection", 
    status: "In Progress", 
    count: 1250,
    role: "annotator",
    type: "project",
    created_at: "2024-01-10T10:00:00Z"
  },
  { 
    id: "2", 
    name: "Medical NLP Labeling", 
    description: "Entity recognition for medical prescriptions and reports.",
    task: "Entity Recognition", 
    status: "Approved", 
    count: 500,
    role: "annotator",
    type: "project",
    created_at: "2024-02-15T14:30:00Z"
  },
  { 
    id: "3", 
    name: "Autonomous Vehicle Relations", 
    description: "Analyzing semantic relations between vehicles and pedestrians.",
    task: "Semantic Relation", 
    status: "Assigned", 
    count: 0,
    role: "viewer",
    type: "project",
    created_at: "2024-03-01T09:15:00Z"
  },
  { 
    id: "4", 
    name: "Autonomous Doom Relations", 
    description: "Dataset for in-game object relationship mapping.",
    task: "Semantic Relation", 
    status: "Approved", 
    count: 20,
    role: "admin",
    type: "project",
    created_at: "2024-03-20T11:00:00Z"
  },
  {
    id: "5",
    name: "Medical NLP Analysis",
    description: "Detailed dataset for healthcare natural language processing.",
    task: "Entity Recognition",
    count: 850,
    role: "admin",
    type: "dataset",
    status: "Approved",
    created_at: "2024-04-05T16:45:00Z"
  },
];