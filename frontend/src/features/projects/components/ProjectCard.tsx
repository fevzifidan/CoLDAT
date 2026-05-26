import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Settings,
  Eye,
  Database
} from "lucide-react";

interface CardProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  count?: number;
  role?: string;
  created_at?: string;
  dataset_id?: string;
  datasets?: any[];
}

interface ProjectCardProps {
  project: CardProject;
  cardType: 'task' | 'dataset' | 'project';
  onStatusChange?: () => void;
}

export const ProjectCard = ({
  project,
  cardType,
  onStatusChange
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['pages']);

  const rawRole = project.role?.toLowerCase() || 'viewer';

  const handleManageNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();

    const paths = {
      task: `/tasks/${project.id}`,
      dataset: `/datasets/${project.id}`,
      project: `/projects/${project.id}`
    };

    navigate(paths[cardType]);
  };

  const handleDatasetNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}/datasets`);
  };

  const getButtonConfig = () => {
    if (rawRole === 'admin') {
      return {
        text: t('pages:dashboard.buttons.manage', 'MANAGE'),
        icon: <Settings className="ml-1 w-3 h-3" />
      };
    }

    if (cardType === 'task') {
      return {
        text: t('pages:dashboard.buttons.start_labeling', 'START LABELING'),
        icon: <ArrowUpRight className="ml-1 w-3 h-3" />
      };
    }

    return {
      text: t('pages:dashboard.buttons.open', 'OPEN PROJECT'),
      icon: <Eye className="ml-1 w-3 h-3" />
    };
  };

  const buttonConfig = getButtonConfig();

  const getStatusStyles = (status: string | undefined) => {
    const normalized = status?.toLowerCase() || 'new';

    if (
      normalized === 'in progress' ||
      normalized === 'in_progress'
    ) {
      return 'border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/40';
    }

    if (normalized === 'completed') {
      return 'border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-amber-900/40';
    }

    return 'border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/40';
  };

  const currentStatus = project.status
    ? String(project.status)
    : 'New';

  const statusKey = currentStatus
    .toLowerCase()
    .replace(/ /g, '_');

  const roleKey = rawRole.replace(/ /g, '_');

  return (
    <Card className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 border border-slate-100 dark:border-slate-800">
      <CardHeader className="pb-2 text-left p-5">
        <div className="flex justify-between items-start mb-1">
          {cardType === 'task' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                if (onStatusChange) {
                  onStatusChange();
                }
              }}
              className={`text-[9px] font-bold uppercase rounded-lg border px-2 py-0.5 transition-colors cursor-pointer select-none ${getStatusStyles(project.status)}`}
              title="Click to cycle status"
            >
              ⚡ {t(`pages:dashboard.status.${statusKey}`, currentStatus)}
            </button>
          ) : (
            <Badge
              variant="secondary"
              className="text-[8px] opacity-70 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 uppercase px-2 py-0"
            >
              {t(
                `pages:dashboard.roles.${roleKey}`,
                project.role || 'Viewer'
              )}
            </Badge>
          )}
        </div>

        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight transition-colors">
          {project.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-left px-5 py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            {project.count ?? 0}
          </span>

          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest italic">
            {t('pages:dashboard.files', 'PROCESSED FILES')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-2 gap-2">
        {cardType === 'project' && rawRole === 'admin' ? (
          <>
            <Button
              className="flex-1 rounded-xl h-9 font-bold text-[10px] transition-all border-none bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-[#e10613] dark:hover:bg-[#e10613] hover:text-white dark:hover:text-white cursor-pointer"
              onClick={handleManageNavigate}
            >
              {buttonConfig.text}
              {buttonConfig.icon}
            </Button>

            <Button
              className="flex-1 rounded-xl h-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white border-none font-bold text-[10px] transition-all gap-1 cursor-pointer"
              onClick={handleDatasetNavigate}
            >
              <Database size={12} />
              {t('pages:dashboard.buttons.dataset', 'DATASET')}
            </Button>
          </>
        ) : (
          <Button
            className="w-full rounded-xl h-9 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-[#e10613] dark:hover:bg-[#e10613] hover:text-white dark:hover:text-white border-none font-bold text-[10px] transition-all cursor-pointer"
            onClick={handleManageNavigate}
          >
            {buttonConfig.text}
            {buttonConfig.icon}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};