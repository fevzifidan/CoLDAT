import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { projects } from '@/shared/utils/projectsData';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 1. Tasklar: Sadece içinde 'status' olanları filtrele
  const recentTasks = projects.filter(p => p.status && p.status.trim() !== ""); 
  
  // 2. Datasetler & Projeler: Status fark etmeksizin göster (Card içinde status otomatik gizlenecek)
  const recentDatasets = projects.slice(0, 4);
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="text-left space-y-1 ml-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm text-muted-foreground dark:text-slate-400 font-medium italic opacity-70">
          {t('dashboard.description')}
        </p>
      </div>

      {/* RECENT TASKS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('dashboard.sections.recent_tasks')}
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400 italic">
              {t('dashboard.sections.tasks_description')}
            </p>
          </div>
          {recentTasks.length > 0 && (
            <Button 
              variant="ghost" size="sm" 
              onClick={() => navigate('/tasks')} 
              className="text-red-600 dark:text-rose-400 font-bold text-[10px] hover:bg-red-50 dark:hover:bg-rose-950/20 uppercase tracking-wider"
            >
              {t('dashboard.show_more')}
            </Button>
          )}
        </div>

        {recentTasks.length > 0 ? (
          /* dark:[&_h3]:!text-white vb. seçiciler ile alt kartlardaki başlık renklerini garantiye alıyoruz */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 dark:[&_h3]:!text-white dark:[&_h4]:!text-white">
            {recentTasks.map((task) => (
              <ProjectCard key={task.id} project={task} cardType="task" />
            ))}
          </div>
        ) : (
          /* Empty State Dark Mode Düzenlemesi */
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/20 dark:bg-slate-900/20 shadow-inner">
            <div className="bg-white dark:bg-slate-950 p-4 rounded-full shadow-sm mb-4 border dark:border-slate-800">
               <span className="text-2xl text-slate-300 dark:text-slate-600 font-serif font-bold">!</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold text-center px-4 max-w-xs">
              {t('dashboard.no_assigned_tasks')}
            </p>
          </div>
        )}
      </section>

      {/* RECENT DATASETS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.sections.recent_datasets')}
          </h2>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => navigate('/datasets')} 
            className="text-red-600 dark:text-rose-400 font-bold text-[10px] hover:bg-red-50 dark:hover:bg-rose-950/20 uppercase tracking-wider"
          >
            {t('dashboard.show_more')}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 dark:[&_h3]:!text-white dark:[&_h4]:!text-white">
          {recentDatasets.map((dataset) => (
            <ProjectCard key={dataset.id} project={dataset} cardType="dataset" />
          ))}
        </div>
      </section>

      {/* RECENT PROJECTS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.sections.recent_projects')}
          </h2>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => navigate('/projects')} 
            className="text-red-600 dark:text-rose-400 font-bold text-[10px] hover:bg-red-50 dark:hover:bg-rose-950/20 uppercase tracking-wider"
          >
            {t('dashboard.show_more')}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 dark:[&_h3]:!text-white dark:[&_h4]:!text-white">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} cardType="project" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;