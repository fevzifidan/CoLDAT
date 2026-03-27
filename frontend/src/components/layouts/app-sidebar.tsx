import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, FolderKanban, Settings, LogOut, Database } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Datasets", url: "/datasets", icon: Database },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Varsa auth temizleme işlemlerini buraya ekleyebilirsin
    // localStorage.removeItem('token'); 
    navigate("/login");
  };

  return (
    <Sidebar 
      collapsible="icon" 
      // z-index'i yükselterek clipping'i önledik
      className="z-[110] border-r border-slate-100 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.02)]"
    >
      {/* Header yüksekliğini Dashboard Header ile eşitledik (h-16) */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-slate-50 overflow-hidden">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-200">
            <span className="text-white font-black text-lg italic">C</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden leading-none">
            <span className="font-black tracking-tighter text-slate-900 text-sm">
              CoLDAT <span className="text-red-600 text-[9px] align-top ml-0.5">V3</span>
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    className={`h-11 rounded-xl transition-all duration-200 ${
                      location.pathname === item.url 
                        ? "bg-red-50 text-red-600 shadow-sm" 
                        : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 shrink-0 ${location.pathname === item.url ? "text-red-600" : ""}`} />
                      <span className="font-bold text-xs tracking-tight">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Logout Kısmı - Artık Çalışıyor */}
      <div className="mt-auto p-3 border-t border-slate-50 bg-white/50">
        <SidebarMenuButton 
          onClick={handleLogout}
          className="h-11 w-full rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-xs">Logout</span>
        </SidebarMenuButton>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}