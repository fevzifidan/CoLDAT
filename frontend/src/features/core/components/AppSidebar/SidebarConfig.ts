// src/features/core/components/SidebarConfig.ts
import { 
  LayoutDashboard, 
  FolderKanban, 
  Database, 
  CheckSquare, 
  Key 
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  {
    title: "dashboard", // common.json -> dashboard.title için
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "projects", // common.json -> sidebar.projects için
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "datasets", // common.json -> sidebar.datasets için
    url: "/datasets",
    icon: Database,
  },
  {
    title: "tasks", // common.json -> sidebar.tasks için
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "api_keys", // common.json -> sidebar.api_keys için
    url: "#",
    icon: Key,
    isPlaceholder: true
  }
];