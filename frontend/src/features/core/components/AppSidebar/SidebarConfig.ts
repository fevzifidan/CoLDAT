// src/features/core/components/SidebarConfig.ts
import { 
  LayoutDashboard, 
  FolderKanban, 
  Database, 
  CheckSquare, 
  Key,
  Sparkles // Yapay zeka ve sentetik veri için Sparkles ikonunu ekledik
} from "lucide-react";
// LucideIcon'u "import type" ile çağırarak hatayı gideriyoruz
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isPlaceholder?: boolean;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
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
    title: "synthetic_data", // Çeviri (i18n) anahtarı
    url: "/synthetic",       // Sayfanın yönlendirileceği url patika adresi
    icon: Sparkles,          // Sol menüde görünecek ikon
  },
  {
    title: "api_keys",
    url: "/api-keys",
    icon: Key,
    isPlaceholder: false 
  }
];