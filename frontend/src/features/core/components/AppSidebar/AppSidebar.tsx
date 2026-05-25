// src/features/core/components/AppSidebar/AppSidebar.tsx
import { LogOut, Languages, Monitor, Moon, Sun, PanelLeftClose, User } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { SIDEBAR_ITEMS } from "./SidebarConfig";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(["sidebar", "common"]);
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('tr') ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  // 🎯 DÜZELTME: Profil sayfasının aktiflik kontrolü
  const isProfileActive = location.pathname === "/profile";

  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon"
      className="border-r shadow-sm"
    >
      {/* Header Bölümü */}
      <SidebarHeader className="h-14 flex flex-row items-center justify-between border-b px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center overflow-hidden transition-all duration-500 ease-in-out">
         <div className="flex items-center whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out max-w-[200px] opacity-100 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="text-primary font-bold italic text-lg tracking-tight pl-2">COLDAT</span>
         </div>
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-muted-foreground hover:text-foreground shrink-0 ml-auto group-data-[collapsible=icon]:ml-0 hover:bg-transparent bg-transparent border-none"
         >
            <PanelLeftClose size={20} className="transition-transform duration-500 ease-in-out group-data-[state=collapsed]:rotate-180" />
         </Button>
      </SidebarHeader>

      {/* Menü İçeriği */}
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu className="mt-2 gap-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = location.pathname === item.url || 
                               (item.url !== "/" && location.pathname.startsWith(item.url));
              
              const translatedTitle = t(`sidebar:${item.title}`, item.title);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={translatedTitle} 
                    onClick={() => navigate(item.url)}
                    isActive={isActive}
                    className={cn(
                      "transition-all duration-500 hover:bg-accent hover:text-accent-foreground",
                      "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold",
                      item.isPlaceholder && "opacity-80"
                    )}
                  >
                    <item.icon className="shrink-0" size={20} />
                    <span className="truncate ml-2">
                      {translatedTitle}
                      {item.isPlaceholder && (
                        <span className="ml-2 text-[10px] italic opacity-60">(Soon)</span>
                      )}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Bölümü */}
      <SidebarFooter className="border-t p-2 bg-background/50 backdrop-blur-sm">
        <SidebarMenu className="gap-2">
          
          {/* 🎯 YENİ EKLEME: Hesap Ayarları Butonu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip={t("sidebar:account_settings", "Hesap Ayarları")}
              onClick={() => navigate('/profile')}
              isActive={isProfileActive}
              className={cn(
                "transition-all duration-500 hover:bg-accent hover:text-accent-foreground",
                "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
              )}
            >
              <User size={20} className={cn("shrink-0", isProfileActive ? "text-primary" : "text-muted-foreground")} />
              <span className="ml-2 font-medium">{t("sidebar:account_settings", "Hesap Ayarları")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={t("common:theme.appearance", "Appearance")}>
                  <Monitor size={20} className="shrink-0 text-muted-foreground" />
                  <span className="ml-2 font-medium text-muted-foreground">{t("common:theme.appearance", "Appearance")}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44" side="right" align="end">
                <DropdownMenuLabel>{t("common:theme.appearance", "Appearance")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light" className="cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>{t("common:theme.light", "Light")}</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>{t("common:theme.dark", "Dark")}</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" className="cursor-pointer">
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>{t("common:theme.system", "System")}</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip={i18n.language.startsWith('tr') ? 'English' : 'Türkçe'} 
              onClick={toggleLanguage}
            >
              <Languages size={20} className="shrink-0 text-muted-foreground" />
              <span className="ml-2 font-medium uppercase text-muted-foreground">
                {i18n.language.startsWith('tr') ? 'Türkçe' : 'English'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip={t("common:logout", "Logout")} 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => navigate('/login')}
            >
              <LogOut size={20} className="shrink-0" />
              <span className="ml-2 font-medium">{t("common:logout", "Logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}