// src/features/projects/tabs/ProjectTasksTab.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SelectFilter } from '@/shared/components/SelectFilter';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Loader2, ListTodo, AlertCircle } from 'lucide-react';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import { taskService } from '@/features/tasks/services/taskService';
import { RoleProvider } from '@/context/PermissionContext';
import { type BackendRole } from '@/shared/roles';
import { useConfirm } from '@/shared/services/confirmation/useConfirm';
import notificationService from '@/shared/services/notification/notification.service';

interface TaskItem {
  id: string;
  name: string;
  status: string;
  count?: number;
  assignee_username?: string | null;
  role?: string;
}

interface ProjectTasksTabProps {
  projectId: string;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses', icon: <ListTodo className="h-3.5 w-3.5" /> },
  { value: 'assigned', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
    { value: 'approval_pending', label: 'Pending Approval' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export const ProjectTasksTab = ({ projectId }: ProjectTasksTabProps) => {
  const { t } = useTranslation(['pages', 'common', 'tasks']);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // --- API EVENT HANDLERS (DELETE /tasks/{id}/) ---
  const handleDeleteTask = async (id: string) => {
    const confirmed = await confirm({
      title: t('tasks:detail.confirm_delete', 'Revoke Task'),
      message: t('tasks:detail.confirm_delete_message', 'Are you sure you want to revoke/delete this task assignment?'),
      confirmText: t('common:actions.confirm', 'Yes, Revoke'),
      cancelText: t('common:actions.cancel', 'Cancel'),
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await taskService.deleteTask(id);
      notificationService.success(t('tasks:detail.delete_success', 'Task has been revoked successfully.'));
      reset();
    } catch (err: any) {
      notificationService.error(err?.response?.data?.message || t('tasks:detail.delete_error', 'Failed to delete task.'));
    }
  };

  const {
    items: tasks,
    loading,
    hasNext,
    loadMore,
    error,
    reset,
  } = useCursorPagination<TaskItem>({
    fetchFn: async (cursor, limit) => {
      const response = await taskService.getProjectTasks(projectId, {
        limit,
        after: cursor ?? undefined,
      });
      const data = response?.data ?? response ?? [];
      return {
        data: Array.isArray(data) ? data : [],
        next_cursor: response?.next_cursor ?? null,
      };
    },
    limit: 12,
    enabled: !!projectId,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <AlertCircle size={28} className="text-destructive" />
        <p className="text-sm text-destructive font-medium">
          {t('common:status.error', 'Failed to load tasks.')}
        </p>
        <Button size="sm" variant="outline" onClick={reset}>
          {t('common:status.retry', 'Retry')}
        </Button>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        {t('common:status.loading', 'Loading tasks...')}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <ListTodo size={40} className="text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground font-medium">
          {t('tasks:empty_state', 'No tasks found for this project.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
                    <RoleProvider key={task.id} role={(task.role?.toLowerCase() as BackendRole) ?? null}>
            <TaskCard
              task={task}
              onViewDetail={(id) => navigate(`/tasks/${id}`)}
              onAnnotate={(id) => navigate(`/annotate/${id}`)}
              onView={(id) => navigate(`/view/${id}`)}
              onDelete={handleDeleteTask}
            />
          </RoleProvider>
        ))}
      </div>

      {hasNext && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={loadMore}
            variant="outline"
            disabled={loading}
            className="px-8 rounded-xl"
          >
            {loading
              ? t('common:status.loading', 'Loading...')
              : t('common:actions.load_more', 'Load More')}
          </Button>
        </div>
      )}
    </div>
  );
};

