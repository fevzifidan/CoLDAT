// @/features/tasks/components/TaskCard.tsx
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, FileText, User, PenLine, ChevronDown, ExternalLink } from "lucide-react";
import { usePermission } from '@/context/PermissionContext';

// Tipi backend'den null gelebilecek şekilde güncelledik
interface TaskItem {
  id: string;
  name: string;
  status: string;
  count?: number; 
  assignee_username?: string | null;
  role?: string;
}

interface TaskCardProps {
  task: TaskItem;
  onViewDetail: (id: string) => void;
  onAnnotate?: (id: string) => void;
  onView?: (id: string) => void;
}

export const TaskCard = ({ task, onViewDetail, onAnnotate, onView }: TaskCardProps) => {
  const { t } = useTranslation(['tasks']);
  const { hasPermission } = usePermission();

  const canViewAll = hasPermission('task:view-all');
  const canAnnotate = hasPermission('task:submit-approval');
  const canViewAssigned = hasPermission('task:view-assigned');

  // RoleProvider'ın sağladığı role göre buton metnini belirle
  const isAdmin = canViewAll;
  const isAnnotator = !canViewAll && canAnnotate;
  const isViewer = !canViewAll && !canAnnotate && canViewAssigned;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between h-[180px] hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-card-foreground line-clamp-1">{task.name}</h3>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText size={13} />
            <span>{task.count ?? 0} {t('tasks:card.processed_files', 'Processed Files')}</span>
          </div>
                    {task.assignee_username && (
            <div className="flex items-center gap-1.5">
              <User size={13} />
              <span>{t('tasks:card.assignee_prefix', 'Assignee: @')}{task.assignee_username}</span>
              {task.role && (
                <span className="ml-auto bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  {task.role}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {/* Ana aksiyon butonu: rol bazlı direkt git */}
        <Button 
          onClick={() => {
            if (isViewer && onView) onView(task.id);
            else if (isAnnotator && onAnnotate) onAnnotate(task.id);
            else onViewDetail(task.id);
          }}
          variant="secondary" 
          className="flex-1 h-8 text-xs font-medium gap-1.5"
        >
          {isAnnotator ? (
            <><PenLine size={14} /> {t('tasks:card.annotate', 'Annotate')}</>
          ) : isViewer ? (
            <><Eye size={14} /> {t('tasks:card.view', 'View')}</>
          ) : (
            <><Eye size={14} /> {t('tasks:card.manage_task', 'Manage Task')}</>
          )}
        </Button>

        {/* Dropdown menü (Admin için ek seçenekler) */}
        {!isAnnotator && !isViewer && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 shrink-0">
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={() => onViewDetail(task.id)} className="cursor-pointer gap-2 text-xs font-medium">
                <Eye size={14} />
                {t('tasks:card.manage_task', 'Manage Task')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAnnotate?.(task.id)} disabled={!onAnnotate} className="cursor-pointer gap-2 text-xs font-medium">
                <PenLine size={14} />
                {t('tasks:card.annotate', 'Annotate')}
                <span className="ml-auto text-[10px] text-muted-foreground">Annotator</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView?.(task.id)} disabled={!onView} className="cursor-pointer gap-2 text-xs font-medium">
                <ExternalLink size={14} />
                {t('tasks:card.view', 'View')}
                <span className="ml-auto text-[10px] text-muted-foreground">Read-only</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};