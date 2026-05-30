import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

// Bileşen ve Servis Entegrasyonları
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { projectService } from '@/features/projects/services/projectService'; // Proje servisiniz
import { taskService } from '@/features/tasks/services/taskService';       // Görev servisiniz
import { datasetService } from '@/features/datasets/services/datasetService';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);

  // --- API STATE YÖNETİMİ ---
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [datasetsList, setDatasetsList] = useState<any[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING ---
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Projeleri ve Taskları eş zamanlı olarak çağırıyoruz (Performans için Parallel Fetch)
      const [projectsData, tasksData] = await Promise.all([
        projectService.getAllProjects(),
        taskService.getTasks()
      ]);

      // --- Proje Verisi Ayrıştırma ---
      const activeProjects = projectsData?.results || projectsData?.data || projectsData || [];
      setProjectsList(activeProjects);

      // --- Görev Verisi Ayrıştırma ---
      const activeTasks = tasksData?.results || tasksData?.data || tasksData || [];
      setTasksList(activeTasks);

      // 2. Projeler geldikten sonra, eğer en az bir proje varsa onun datasetlerini çekiyoruz
      if (activeProjects.length > 0) {
        const firstProjectId = activeProjects[0].id;
        // Servisinizdeki isimlendirmeye göre örn: getProjectDatasets(id) çağrısı
// projectService yerine zaten elinde olan ve projectId kabul eden datasetService'i çağırıyoruz
const datasetsData = await datasetService.getAllDatasets(firstProjectId);
const activeDatasets = datasetsData?.results || datasetsData?.data || datasetsData || [];
setDatasetsList(activeDatasets);
      } else {
        setDatasetsList([]);
      }

    } catch (err: any) {
      console.error("Dashboard loading error:", err);
      setError(err?.response?.data?.message || t('dashboard:fetch_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- VERİ LİMİTLEME VE KART UYUMLULUK MAPPING İŞLEMLERİ ---
  // API'den dönen nesneleri ProjectCard'ın beklediği esnek yapıya normalize ediyoruz

  const recentTasks = tasksList.slice(0, 4).map(t => ({
    id: t.id,
    name: t.name || `Task #${t.id.slice(0, 8)}`,
    status: t.status || "OPEN",
    description: `Contains ${t.image_count ?? 0} master assets.`
  }));

  const recentDatasets = datasetsList.slice(0, 4).map(d => ({
    id: d.id,
    name: d.name || "Unnamed Dataset",
    status: d.status || "",
    description: d.description || "Project dataset repository."
  }));

  const recentProjects = projectsList.slice(0, 4).map(p => ({
    id: p.id,
    name: p.name || "Standard Project",
    status: p.status || "",
    description: p.description || "Ecosystem managed project workspace."
  }));

  // --- ASENKRON DURUM EKRANLARI ---
    if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium tracking-wide">{t('dashboard:loading_text')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[50vh] flex items-center justify-center p-4">
        <div className="p-5 rounded-2xl border border-destructive/20 bg-destructive/5 text-center space-y-3 max-w-sm shadow-sm">
          <AlertCircle size={28} className="mx-auto text-destructive animate-pulse" />
          <p className="text-xs text-destructive font-medium leading-relaxed">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchDashboardData} className="text-xs h-8">
            {t('dashboard:retry_button')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-left space-y-1 ml-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {t('dashboard:title')}
        </h1>
        <p className="text-sm text-muted-foreground font-medium italic opacity-70">
          {t('dashboard:description')}
        </p>
      </div>

      {/* RECENT TASKS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="text-left">
            <h2 className="text-xl font-bold text-foreground">
              {t('dashboard:sections.recent_tasks')}
            </h2>
            <p className="text-xs text-muted-foreground italic">
              {t('dashboard:sections.tasks_description')}
            </p>
          </div>
          {recentTasks.length > 0 && (
            <Button 
              variant="ghost" size="sm" 
              onClick={() => navigate('/tasks')} 
              className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
            >
              {t('dashboard:show_more')}
            </Button>
          )}
        </div>

        {recentTasks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentTasks.map((task) => (
              <ProjectCard key={task.id} project={task} cardType="task" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-[2rem] bg-muted/20 shadow-inner">
            <div className="bg-card p-3 rounded-full shadow-sm mb-3 border border-border">
               <span className="text-xl text-muted-foreground font-serif font-bold">!</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold text-center px-4 max-w-xs">
              {t('dashboard:no_assigned_tasks')}
            </p>
          </div>
        )}
      </section>

      {/* RECENT DATASETS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t('dashboard:sections.recent_datasets')}
            </h2>
            <p className="text-xs text-muted-foreground italic">{t('dashboard:sections.datasets_description')}</p>
          </div>
          {recentDatasets.length > 0 && (
            <Button 
              variant="ghost" size="sm" 
              onClick={() => navigate('/datasets')} 
              className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
            >
              {t('dashboard:show_more')}
            </Button>
          )}
        </div>
        
        {recentDatasets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentDatasets.map((dataset) => (
              <ProjectCard key={dataset.id} project={dataset} cardType="dataset" />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
            {t('dashboard:sections.datasets_empty')}
          </div>
        )}
      </section>

      {/* RECENT PROJECTS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t('dashboard:sections.recent_projects')}
            </h2>
            <p className="text-xs text-muted-foreground italic">{t('dashboard:sections.projects_description')}</p>
          </div>
          {recentProjects.length > 0 && (
            <Button 
              variant="ghost" size="sm" 
              onClick={() => navigate('/projects')} 
              className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
            >
              {t('dashboard:show_more')}
            </Button>
          )}
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} cardType="project" />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
            {t('dashboard:sections.projects_empty')}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardHome;