import { useParams, useNavigate } from 'react-router-dom';
import { projects, type Project } from '@/shared/utils/projectsData'; 
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const AnnotationCanvas = () => (
  <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center border-2 border-primary/10">
    <span className="text-slate-500 font-mono text-sm">Konva Canvas Area</span>
  </div>
);

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const project = projects.find((p: Project) => p.id === Number(id));

  if (!project) return <div className="p-8 text-white">Project Not Found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Üst Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-slate-950">
        <div className="flex items-center gap-4 text-left">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <div>
            <h2 className="text-lg font-bold leading-none">{project.name}</h2>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{project.task}</p>
          </div>
          <Badge variant="secondary" className="ml-2">{project.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm">Save</Button>
          <Button size="sm" variant="destructive">Finish</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SOL: Canvas */}
        <main className="flex-1 bg-slate-100 p-4 flex items-center justify-center dark:bg-slate-900">
          <div className="w-full h-full shadow-2xl rounded-xl border bg-slate-800 overflow-hidden">
             <AnnotationCanvas />
          </div>
        </main>

        {/* SAĞ: Panel */}
        <aside className="w-80 border-l bg-white dark:bg-slate-950 flex flex-col text-left">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Tags</h3>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {["Car", "Pedestrian", "Traffic Light", "Sign"].map((label) => (
                <div 
                  key={label} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent transition-all"
                >
                  <span className="text-sm font-medium">{label}</span>
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-[10px] uppercase mb-1 text-muted-foreground">Image</h3>
            <p className="text-[10px] font-mono opacity-70">Image: traffic_scene_01.jpg</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
