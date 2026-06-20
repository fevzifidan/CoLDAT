import { usePermission } from '@/context/PermissionContext';
import { useAuth } from '@/context/AuthContext';

interface Task {
  id: string;
  assignee_id?: string | null;
  assignee_username?: string | null;
  status?: string;
  role?: string;
}

/**
 * 🔐 useTaskPermissions
 *
 * ABAC (Attribute-Based Access Control) ile task bazlı yetki kontrolleri.
 * "Kullanıcılar sadece kendilerine atanan task'ları görebilir" kuralını uygular.
 *
 * KULLANIM:
 *   const { canViewTask, canAnnotateTask } = useTaskPermissions();
 *   const visibleTasks = tasks.filter(task => canViewTask(task));
 */
export const useTaskPermissions = () => {
  const { hasPermission, role: contextRole } = usePermission();
  const { user } = useAuth();

  // KURAL 3: Task görüntüleme — ABAC
  // Admin tüm task'ları görebilir
  // Annotator/Viewer sadece kendine atananları görebilir
  const canViewTask = (task: Task): boolean => {
    if (hasPermission('task:view-all')) return true;

    if (
      hasPermission('task:view-assigned') &&
      (task.assignee_id === user?.id || task.assignee_username === user?.username)
    ) {
      return true;
    }

    return false;
  };

  // Kullanıcının task'teki rolüne göre annotate edebilme
  const canAnnotateTask = (task: Task): boolean => {
    return (
      contextRole === 'annotator' &&
      (task.assignee_id === user?.id || task.assignee_username === user?.username)
    );
  };

  // Kullanıcının task'teki rolüne göre sadece görüntüleyebilme
  const canViewOnlyTask = (task: Task): boolean => {
    return (
      contextRole === 'viewer' &&
      (task.assignee_id === user?.id || task.assignee_username === user?.username)
    );
  };

  return {
    canViewTask,
    canAnnotateTask,
    canViewOnlyTask,
    canCreateTask: hasPermission('task:create'),
    canSubmitApproval: hasPermission('task:submit-approval'),
    canApproveReject: hasPermission('task:approve-reject'),
    canReassign: hasPermission('task:reassign'),
    canDeleteTask: hasPermission('task:delete'),
    canAddAsset: hasPermission('task:add-asset'),
  };
};
