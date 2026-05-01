import { useState } from 'react';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { projects } from '@/shared/utils/projectsData';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const TasksPage = () => {
  const { t } = useTranslation();
  const taskProjects = projects.filter(p => p.status); // Taskları filtrele
  
  // Pagination State
  const [displayLimit, setDisplayLimit] = useState(2);
  const visibleTasks = taskProjects.slice(0, displayLimit);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900">{t('dashboard.sections.recent_tasks')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleTasks.map(item => (
          <ProjectCard key={item.id} project={item} cardType="task" />
        ))}
      </div>

      {displayLimit < taskProjects.length && (
        <div className="flex justify-center mt-8">
<Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline">
  {t('status.load_more')} 
</Button>
        </div>
      )}
    </div>
  );
};
export default TasksPage;