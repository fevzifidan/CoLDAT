// src/features/core/layouts/DashboardLayout.tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/features/core/components/AppSidebar/AppSidebar"
import { Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation(['common']);

  return (
    // Ekranı sabitleyen dış iskelet
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-background antialiased">
      <SidebarProvider defaultOpen={false} className="h-full w-full items-stretch">
        
        {/* Sol Menü (Sidebar) */}
        <AppSidebar />
        
        {/* Sağ Ana Gövde */}
        <SidebarInset className="flex flex-col h-full min-w-0 flex-1 overflow-hidden bg-background">
          
          {/* Üst Bar (Navbar)
              z-10 seviyesine çekildi! Böylece sol taraftaki menü (z-40) katman olarak 
              bu barın her zaman üzerinde/önünde yer alacak, çakışma ve ezme yaşanmayacak.
          */}
          <header className="flex h-14 w-full shrink-0 items-center gap-3 border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-sm font-semibold tracking-tight text-foreground select-none">
              {t('common:workspace_title')}
            </h1>
          </header>
          
          {/* Sayfa İçerik Alanı */}
          <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-6 bg-background">
            {children || <Outlet />}
          </main>
          
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}