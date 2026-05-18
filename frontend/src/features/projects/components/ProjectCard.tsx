import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Settings, Eye } from "lucide-react";
import type { Project } from '@/shared/utils/projectsData';

interface ProjectCardProps {
  project: Project;
  cardType: 'task' | 'dataset' | 'project';
  onStatusChange?: () => void;
}

export const ProjectCard = ({ project, cardType, onStatusChange }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const rawRole = project.role?.toLowerCase() || 'viewer';

  const handleNavigate = () => {
    const paths = {
      task: `/tasks/${project.id}`,
      dataset: `/datasets/${project.id}`,
      project: `/projects/${project.id}`
    };
    navigate(paths[cardType]);
  };

  const getButtonConfig = () => {
    if (rawRole === 'admin') return { text: t('dashboard.buttons.manage'), icon: <Settings className="ml-1 w-3 h-3" /> };
    if (cardType === 'task') return { text: t('dashboard.buttons.start_labeling'), icon: <ArrowUpRight className="ml-1 w-3 h-3" /> };
    return { text: t('dashboard.buttons.open'), icon: <Eye className="ml-1 w-3 h-3" /> };
  };

  const buttonConfig = getButtonConfig();

  const getStatusStyles = (status: string | undefined) => {
    const normalized = status?.toLowerCase() || 'new';
    if (normalized === 'in progress') {
      return 'border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/40';
    }
    if (normalized === 'completed') {
      return 'border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40';
    }
    return 'border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/40';
  };

  return (
    <Card className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 border border-slate-100 dark:border-slate-800">
      <CardHeader className="pb-2 text-left p-5">
        <div className="flex justify-between items-start mb-1">
          {cardType === 'task' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) onStatusChange();
              }}
              className={`text-[9px] font-bold uppercase rounded-lg border px-2 py-0.5 transition-colors cursor-pointer select-none ${getStatusStyles(project.status)}`}
              title="Click to cycle status"
            >
              ⚡ {t(`dashboard.status.${project.status?.toLowerCase().replace(" ", "_")}`)}
            </button>
          ) : (
            <Badge variant="secondary" className="text-[8px] opacity-70 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 uppercase px-2 py-0">
              {t(`dashboard.roles.${rawRole.replace(/ /g, '_')}`)}
            </Badge>
          )}
        </div>

        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
          {project.name}
        </CardTitle>
        
        <CardDescription className="text-[11px] font-medium leading-none mt-1 uppercase tracking-tight text-slate-400 dark:text-slate-500">
          {t(`dashboard.tasks.${project.task?.toLowerCase().replace(" ", "_")}`)}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-left px-5 py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{project.count}</span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest italic">
            {t('dashboard.files')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-2">
        <Button 
          className="w-full rounded-xl h-9 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-[#e10613] dark:hover:bg-[#e10613] hover:text-white dark:hover:text-white border-none font-bold text-[10px] transition-all" 
          onClick={handleNavigate}
        >
          {buttonConfig.text}
          {buttonConfig.icon}
        </Button>
      </CardFooter>
    </Card>
  );
};