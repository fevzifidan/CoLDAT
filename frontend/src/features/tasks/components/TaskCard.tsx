// @/features/tasks/components/TaskCard.tsx
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Eye, FileText, User } from "lucide-react";

// Tipi backend'den null gelebilecek şekilde güncelledik
interface TaskItem {
  id: string;
  name: string;
  status: string;
  count?: number; 
  assignee_username?: string | null; // 👈 Buraya '| null' eklendi
}

interface TaskCardProps {
  task: TaskItem;
  onViewDetail: (id: string) => void;
}

export const TaskCard = ({ task, onViewDetail }: TaskCardProps) => {
  const { t } = useTranslation(['tasks']);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NEW":
      case "OPEN": return "bg-primary/10 text-primary border-primary/20";
      case "IN_PROGRESS": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "APPROVAL_PENDING": return "bg-muted text-muted-foreground border-border";
      case "COMPLETED":
      case "APPROVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "REJECTED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

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
          {/* null check koruması sağlandı */}
          {task.assignee_username && (
            <div className="flex items-center gap-1.5">
              <User size={13} />
              <span>{t('tasks:card.assignee_prefix', 'Assignee: @')}{task.assignee_username}</span>
            </div>
          )}
        </div>
      </div>

      <Button 
        onClick={() => onViewDetail(task.id)}
        variant="secondary" 
        className="w-full h-8 text-xs font-medium gap-1.5"
      >
        <Eye size={14} /> {t('tasks:card.manage_task', 'Manage Task')}
      </Button>
    </div>
  );
};