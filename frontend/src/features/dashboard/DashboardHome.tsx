// src/features/dashboard/DashboardHome.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { projects } from '@/shared/utils/projectsData';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Gerçek senaryoda bunlar API'den filtreli gelecek
  const recentTasks = projects.filter(p => p.status).slice(0, 4); 
  const recentDatasets = projects.slice(0, 4);
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-left space-y-1 ml-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground font-medium italic opacity-70">{t('dashboard.description')}</p>
      </div>

      {/* RECENT TASKS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="text-left">
            {/* Başlık ve açıklama, görev olmasa dahi her zaman burada kalır */}
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.sections.recent_tasks')}</h2>
            <p className="text-xs text-muted-foreground italic">{t('dashboard.sections.tasks_description')}</p>
          </div>
          
          {/* Sadece liste doluysa "Daha Fazla" butonu gösterilir */}
          {recentTasks.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/tasks')} 
              className="text-red-600 font-bold text-[10px] hover:bg-red-50"
            >
              {t('dashboard.show_more')}
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
          /* Bilgi Mesajı Alanı */
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
            <p className="text-sm text-slate-400 font-medium italic text-center px-4">
              {t('dashboard.no_assigned_tasks')}
            </p>
          </div>
        )}
      </section>

      {/* RECENT DATASETS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.sections.recent_datasets')}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/datasets')} 
            className="text-red-600 font-bold text-[10px] hover:bg-red-50"
          >
            {t('dashboard.show_more')}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentDatasets.map((dataset) => (
            <ProjectCard key={dataset.id} project={dataset} cardType="dataset" />
          ))}
        </div>
      </section>

      {/* RECENT PROJECTS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.sections.recent_projects')}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/projects')} 
            className="text-red-600 font-bold text-[10px] hover:bg-red-50"
          >
            {t('dashboard.show_more')}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} cardType="project" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;