// @/features/tasks/components/TaskCard.tsx
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
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NEW":
      case "OPEN": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "IN_PROGRESS": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "APPROVAL_PENDING": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "COMPLETED":
      case "APPROVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "REJECTED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[180px] hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{task.name}</h3>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        
        <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <FileText size={13} />
            <span>{task.count ?? 0} Processed Files</span>
          </div>
          {/* null check koruması sağlandı */}
          {task.assignee_username && (
            <div className="flex items-center gap-1.5">
              <User size={13} />
              <span>Assignee: @{task.assignee_username}</span>
            </div>
          )}
        </div>
      </div>

      <Button 
        onClick={() => onViewDetail(task.id)}
        variant="secondary" 
        className="w-full h-8 text-xs font-medium gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      >
        <Eye size={14} /> Manage Task
      </Button>
    </div>
  );
};