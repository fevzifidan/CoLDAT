import { 
  LayoutDashboard, 
  Settings,
  SquareDashedMousePointer 
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { title: "dashboard", url: "/", icon: LayoutDashboard },
  { title: "annotate", url: "/projects", icon: SquareDashedMousePointer },
  { title: "settings", url: "/settings", icon: Settings },
];
