// SidebarConfig.ts
import { 
  LayoutDashboard, 
  FolderKanban, 
  Database, 
  CheckSquare, 
  Key 
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  {
    title: "dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "projects",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "datasets",
    url: "/datasets",
    icon: Database,
  },
  {
    title: "tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "api_keys",
    url: "#",
    icon: Key,
    isPlaceholder: true
  }
];