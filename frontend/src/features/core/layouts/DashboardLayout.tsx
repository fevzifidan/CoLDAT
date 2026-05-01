import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/features/core/components/AppSidebar/AppSidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold tracking-tight text-foreground">CoLDAT Workspace</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
