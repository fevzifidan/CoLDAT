import { projects } from '@/shared/utils/projectsData';
import { ProjectCard } from './components/ProjectCard';

const DashboardHome = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-left space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-muted-foreground font-medium italic opacity-70">CoLDAT project progress</p>
      </div>

      {/* Grid: Artık sadece ProjectCard çağırıyoruz */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;