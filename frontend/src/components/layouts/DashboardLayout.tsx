import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function DashboardLayout() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden bg-[#fcfcfc]">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* HEADER: Kesinlikle Sabit ve En Üstte */}
          <header className="sticky top-0 z-[100] flex h-16 shrink-0 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-500 hover:text-red-600 transition-colors" />
              <Separator orientation="vertical" className="h-4 bg-slate-200" />
              <div className="flex items-center gap-2 select-none">
                <span className="text-xs font-black text-red-600 uppercase tracking-widest italic">CoLDAT</span>
                <span className="text-[10px] font-bold text-slate-300">/</span>
                <h1 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dashboard</h1>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage}
              className="h-8 rounded-xl font-bold text-[10px] text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-100 bg-white shadow-sm gap-2"
            >
              <Globe className="w-3 h-3" />
              <span>{i18n.language === 'tr' ? 'TR / EN' : 'EN / TR'}</span>
            </Button>
          </header>

          {/* ANA İÇERİK: Sadece burası kayacak */}
          <main className="flex-1 overflow-y-auto pt-6 pl-[80px] pr-6 pb-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}