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
import { Eye, FileText, User, PenLine, ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import { usePermission } from '@/context/PermissionContext';

// Status badge renklerini belirleyen yardımcı fonksiyon
const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'assigned':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'in_progress':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'submitted':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case 'approved':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'rejected':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// Priority renk bilgisi
const getPriorityColor = (priority: string | undefined): string => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-amber-500';
    case 'medium':
      return 'bg-blue-500';
    case 'low':
      return 'bg-emerald-500';
    default:
      return 'bg-muted-foreground/30';
  }
};

interface TaskItem {
  id: string;
  name: string;
  status: string;
  priority?: string;
  count?: number;
  assignee_username?: string | null;
  role?: string;
}

interface TaskCardProps {
  task: TaskItem;
  onViewDetail: (id: string) => void;
  onAnnotate?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TaskCard = ({ task, onViewDetail, onAnnotate, onView, onDelete }: TaskCardProps) => {
  const { t } = useTranslation(['tasks']);
    const { hasPermission } = usePermission();

  const canViewAll = hasPermission('task:view-all');
  const canAnnotate = hasPermission('task:submit-approval');
  const canViewAssigned = hasPermission('task:view-assigned');
  const canDelete = hasPermission('task:delete');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(task.id);
  };

  const priorityColor = getPriorityColor(task.priority);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between h-[180px] hover:shadow-md transition-shadow relative group overflow-hidden">
      {/* Priority renkli üst şerit */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${priorityColor}`} />

      <div className="space-y-2 p-5 pt-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-card-foreground line-clamp-1">{task.name}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            {/* Sadece admin (task:delete yetkisi olan) delete butonunu görebilir */}
            {canDelete && onDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 border border-destructive/20 shadow-sm"
                title="Revoke Task"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
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

            <div className="flex gap-2 px-5 pb-5">
        {/* Ana aksiyon butonu: herkes için Task Details */}
        <Button
          onClick={() => onViewDetail(task.id)}
          variant="secondary"
          className="flex-1 h-8 text-xs font-medium gap-1.5"
        >
          <Eye size={14} /> {t('tasks:card.details', 'Task Details')}
        </Button>

        {/* Dropdown menü — tüm roller görebilir */}
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
            {onAnnotate && (
              <DropdownMenuItem onClick={() => onAnnotate(task.id)} className="cursor-pointer gap-2 text-xs font-medium">
                <PenLine size={14} />
                {t('tasks:card.annotate', 'Annotate')}
                <span className="ml-auto text-[10px] text-muted-foreground">Annotator</span>
              </DropdownMenuItem>
            )}
            {onView && (
              <DropdownMenuItem onClick={() => onView(task.id)} className="cursor-pointer gap-2 text-xs font-medium">
                <ExternalLink size={14} />
                {t('tasks:card.view', 'View')}
                <span className="ml-auto text-[10px] text-muted-foreground">Read-only</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};