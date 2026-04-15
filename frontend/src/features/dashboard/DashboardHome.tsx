import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects } from '@/shared/utils/projectsData';

const getBadgeVariant = (status: string) => {
  if (status === "Completed") return "default";
  if (status === "In Progress") return "secondary";
  return "outline";
};

const getStatusLabel = (status: string, t: any) => {
  const keyMap: Record<string, string> = {
    "Completed": "dashboard.status.completed",
    "In Progress": "dashboard.status.in_progress",
    "New": "dashboard.status.new"
  };
  return t(keyMap[status] || status);
};

const getTaskLabel = (task: string, t: any) => {
  const keyMap: Record<string, string> = {
    "Object Detection": "dashboard.tasks.object_detection",
    "Entity Recognition": "dashboard.tasks.entity_recognition",
    "Semantic Relation": "dashboard.tasks.semantic_relation"
  };
  return t(keyMap[task] || task);
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.description')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-all border-t-2 border-t-primary/20">
            <CardHeader className="pb-3 text-left">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-bold leading-tight">{project.name}</CardTitle>
                <Badge variant={getBadgeVariant(project.status) as any}>
                  {getStatusLabel(project.status, t)}
                </Badge>
              </div>
              <CardDescription>{getTaskLabel(project.task, t)}</CardDescription>
            </CardHeader>
            <CardContent className="text-left py-4">
              <div className="text-4xl font-extrabold tracking-tighter">{project.count}</div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                {t('dashboard.processed_files')}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full text-xs font-semibold"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {t('dashboard.open_project')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
