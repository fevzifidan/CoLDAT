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
  Database,
  Calendar
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
  const { t, i18n } = useTranslation(['projects']);

  const rawRole = project.role?.toLowerCase() || 'viewer';

    const handleManageNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();

        // Task tipi için task detay sayfasına yönlendir (imageId gerekli olduğu için doğrudan annotation sayfasına gitme)
    if (cardType === 'task') {
      navigate(`/tasks/${project.id}`);
      return;
    }

    const paths = {
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
        text: t('projects:buttons.manage', 'MANAGE'),
        icon: <Settings className="ml-1 w-3 h-3" />
      };
    }

    if (cardType === 'task') {
      return {
        text: t('projects:buttons.start_labeling', 'START LABELING'),
        icon: <ArrowUpRight className="ml-1 w-3 h-3" />
      };
    }

    return {
      text: t('projects:buttons.open', 'OPEN PROJECT'),
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
      return 'border-amber-500/20 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20';
    }

    if (normalized === 'completed') {
      return 'border-emerald-500/20 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20';
    }

    return 'border-primary/20 text-primary bg-primary/10 hover:bg-primary/20';
  };

    const currentStatus = project.status
    ? String(project.status)
    : 'assigned';

  const statusKey = currentStatus
    .toLowerCase()
    .replace(/ /g, '_');

  const roleKey = rawRole.replace(/ /g, '_');

  return (
    <Card className="group relative overflow-hidden rounded-[2rem] bg-card shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 border border-border">
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
              ⚡ {t(`projects:status.${statusKey}`, currentStatus)}
            </button>
          ) : (
            <Badge
              variant="secondary"
              className="text-[8px] opacity-70 uppercase px-2 py-0"
            >
              {t(
                `projects:roles.${roleKey}`,
                project.role || 'Viewer'
              )}
            </Badge>
          )}
        </div>

                <CardTitle className="text-base font-bold text-card-foreground leading-tight transition-colors">
          {project.name}
        </CardTitle>
        {project.description && (
          <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-snug">
            {project.description}
          </p>
        )}
      </CardHeader>

            <CardContent className="text-left px-5 py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tighter text-card-foreground">
            {project.count ?? 0}
          </span>

          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest italic">
            {t('projects:files', 'PROCESSED FILES')}
          </span>
        </div>

        {project.created_at && (
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground border-t border-border/50 pt-2">
            <Calendar size={11} className="text-primary/60" />
            <span>
              {new Date(project.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-2 gap-2">
        {cardType === 'project' && rawRole === 'admin' ? (
          <>
            <Button
              className="flex-1 rounded-xl h-9 font-bold text-[10px] transition-all border-none bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer"
              onClick={handleManageNavigate}
            >
              {buttonConfig.text}
              {buttonConfig.icon}
            </Button>

            <Button
              className="flex-1 rounded-xl h-9 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-none font-bold text-[10px] transition-all gap-1 cursor-pointer"
              onClick={handleDatasetNavigate}
            >
              <Database size={12} />
              {t('projects:buttons.dataset', 'DATASET')}
            </Button>
          </>
        ) : (
          <Button
            className="w-full rounded-xl h-9 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground border-none font-bold text-[10px] transition-all cursor-pointer"
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