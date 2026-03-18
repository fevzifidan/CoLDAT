import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Languages,
  SquareDashedMousePointer 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // i18n importu eklendi

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Annotate", url: "/projects", icon: SquareDashedMousePointer },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { i18n } = useTranslation(); // i18n hook'u tanımlandı

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('tr') ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon"
      style={{ "--sidebar-width": "260px" } as React.CSSProperties}
    >
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold italic px-4 py-6">
            COLDAT
          </SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  onClick={() => navigate(item.url)}
                  className="py-6 transition-all duration-200"
                >
                  <item.icon className="shrink-0" size={20} />
                  <span className="truncate font-medium ml-2">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2 bg-background/50">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Dil değiştirme butonu güncellendi */}
            <SidebarMenuButton 
              tooltip="Language" 
              className="py-6"
              onClick={toggleLanguage}
            >
              <Languages size={20} className="shrink-0" />
              <span className="ml-2 font-medium uppercase">
                {i18n.language.startsWith('tr') ? 'TR' : 'EN'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Logout" 
              className="py-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => navigate('/register')}
            >
              <LogOut size={20} className="shrink-0" />
              <span className="ml-2 font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}