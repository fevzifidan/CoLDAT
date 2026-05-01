import { useState } from 'react';
import { ProjectCard } from './components/ProjectCard';
import { projects } from '@/shared/utils/projectsData';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const ProjectsPage = () => {
  const { t } = useTranslation();
  const onlyProjects = projects.filter(p => p.type === 'project'); // Projeleri filtrele
  
  const [displayLimit, setDisplayLimit] = useState(2);
  const visibleProjects = onlyProjects.slice(0, displayLimit);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900">{t('dashboard.sections.recent_projects')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} cardType="project" />
        ))}
      </div>

      {displayLimit < onlyProjects.length && (
        <div className="flex justify-center mt-8">
<Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline">
  {t('status.load_more')} 
</Button>
        </div>
      )}
    </div>
  );
};
export default ProjectsPage;