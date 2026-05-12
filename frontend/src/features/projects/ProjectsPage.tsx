import { useState } from 'react';
import { projects } from '@/shared/utils/projectsData';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ProjectCard } from './components/ProjectCard';
import { useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onlyProjects = projects.filter(p => p.type === 'project'); 
  
  const [displayLimit, setDisplayLimit] = useState(4);
  const visibleProjects = onlyProjects.slice(0, displayLimit);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {t('dashboard.sections.recent_projects')}
        </h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Create New Project</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProjects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => navigate(`/projects/${project.id}`)}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <ProjectCard project={project} cardType="project" />
          </div>
        ))}
      </div>

      {displayLimit < onlyProjects.length && (
        <div className="flex justify-center mt-12">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="px-8">
            {t('status.load_more')} 
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;