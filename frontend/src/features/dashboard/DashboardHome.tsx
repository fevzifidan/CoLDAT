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
  const { t } = useTranslation(['pages']);

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
      setError(err?.response?.data?.message || "Failed to sync ecosystem metrics with backend.");
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
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium tracking-wide">Synchronizing dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[50vh] flex items-center justify-center p-4">
        <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/40 dark:bg-rose-950/10 dark:border-rose-900/30 text-center space-y-3 max-w-sm shadow-sm">
          <AlertCircle size={28} className="mx-auto text-rose-500 animate-pulse" />
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchDashboardData} className="text-xs h-8 bg-white dark:bg-slate-950">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="text-left space-y-1 ml-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('pages:dashboard.title', 'Overview')}
        </h1>
        <p className="text-sm text-muted-foreground dark:text-slate-400 font-medium italic opacity-70">
          {t('pages:dashboard.description', 'Welcome back! Here is a quick summary of your ecosystem.')}
        </p>
      </div>

      {/* RECENT TASKS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('pages:dashboard.sections.recent_tasks', 'Recent Tasks')}
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400 italic">
              {t('pages:dashboard.sections.tasks_description', 'Active annotation jobs assigned to you.')}
            </p>
          </div>
          {recentTasks.length > 0 && (
            <Button 
              variant="ghost" size="sm" 
              onClick={() => navigate('/tasks')} 
              className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 uppercase tracking-wider"
            >
              {t('pages:dashboard.show_more', 'Show More')}
            </Button>
          )}
        </div>

        {recentTasks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 dark:[&_h3]:!text-white dark:[&_h4]:!text-white">
            {recentTasks.map((task) => (
              <ProjectCard key={task.id} project={task} cardType="task" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] bg-slate-50/20 dark:bg-slate-900/20 shadow-inner">
            <div className="bg-white dark:bg-slate-950 p-3 rounded-full shadow-sm mb-3 border dark:border-slate-800">
               <span className="text-xl text-slate-300 dark:text-slate-600 font-serif font-bold">!</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold text-center px-4 max-w-xs">
              {t('pages:dashboard.no_assigned_tasks', 'No tasks assigned to you at the moment.')}
            </p>
          </div>
        )}
      </section>

      {/* RECENT DATASETS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('pages:dashboard.sections.recent_datasets', 'Recent Datasets')}
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400 italic">Datasets linked with your primary active workspace.</p>
          </div>
          {recentDatasets.length > 0 && (
            <Button 
              variant="ghost" size="sm" 
              onClick={() => navigate('/datasets')} 
              className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 uppercase tracking-wider"
            >
              {t('pages:dashboard.show_more', 'Show More')}
            </Button>
          )}
        </div>
        
        {recentDatasets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 dark:[&_h3]:!text-white dark:[&_h4]:!text-white">
            {recentDatasets.map((dataset) => (
              <ProjectCard key={dataset.id} project={dataset} cardType="dataset" />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            No datasets found for the primary project directory.
          </div>
        )}
      </section>

      {/* RECENT PROJECTS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('pages:dashboard.sections.recent_projects', 'Recent Projects')}
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400 italic">Enterprise project structures you have validation clearances for.</p>
          </div>
          {recentProjects.length > 0 && (
            <Button 
              variant="ghost" size="sm" 
              onClick={() => navigate('/projects')} 
              className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 uppercase tracking-wider"
            >
              {t('pages:dashboard.show_more', 'Show More')}
            </Button>
          )}
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 dark:[&_h3]:!text-white dark:[&_h4]:!text-white">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} cardType="project" />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            No projects registers found in this workspace context.
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardHome;