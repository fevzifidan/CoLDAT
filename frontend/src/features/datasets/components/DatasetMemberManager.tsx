import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Guard } from '@/shared/components/Guard';
import { usePermission } from '@/context/PermissionContext';
import { datasetService } from '@/features/datasets/services/datasetService';
import notificationService from '@/shared/services/notification/notification.service';

interface Member {
  id: string;
  user_id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  joined_at?: string;
}

interface DatasetMemberManagerProps {
  datasetId: string;
  currentUserRole?: string;
}

const ROLE_OPTIONS = [
  { value: 'annotator', labelKey: 'datasets:member_manager.role_annotator', defaultLabel: 'Annotator', color: 'text-blue-600' },
  { value: 'viewer', labelKey: 'datasets:member_manager.role_viewer', defaultLabel: 'Viewer', color: 'text-gray-600' },
];

const DatasetMemberManager = ({ datasetId, currentUserRole }: DatasetMemberManagerProps) => {
  const { t } = useTranslation(['datasets', 'common']);
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit role state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Delete confirm state
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await datasetService.getDatasetMembers(datasetId);
      const memberList = response?.data && Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
      setMembers(memberList as Member[]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load members.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRoleChange = async (memberId: string, newRoleValue: string) => {
    setEditingMemberId(memberId);
    try {
      await datasetService.updateDatasetMember(datasetId, memberId, { role: newRoleValue });
      notificationService.success(t('datasets:member_manager.role_updated', 'Role updated.'));
      loadMembers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'An error occurred.';
      notificationService.error(msg);
    } finally {
      setEditingMemberId(null);
    }
  };

    const handleRemoveMember = async () => {
    if (!deletingMemberId) return;
    setDeletingMember(true);
    try {
      await datasetService.removeDatasetMemberById(datasetId, deletingMemberId);
      notificationService.success(t('datasets:member_manager.remove_success', 'Member removed successfully.'));
      setDeletingMemberId(null);
      loadMembers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'An error occurred.';
      notificationService.error(msg);
    } finally {
      setDeletingMember(false);
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

    const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400';
      case 'annotator': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'viewer': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Users size={18} className="text-primary" />
            {t('datasets:member_manager.title', 'Team Members')}
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {t('datasets:member_manager.description', 'Manage who has access to this dataset')}
          </CardDescription>
        </div>
        <Guard permission="member:add">
          <Button
            size="sm"
            onClick={() => navigate(`/datasets/${datasetId}/add-members`)}
                        className="gap-1.5 h-8 text-xs"
          >
            <UserPlus size={13} />
            {t('datasets:member_manager.add_member', 'Add Member')}
          </Button>
        </Guard>
      </CardHeader>

      <CardContent className="space-y-1">
        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-sm text-destructive">
            <AlertCircle size={14} />
            <span>{error}</span>
            <Button size="sm" variant="ghost" className="ml-auto h-6 text-xs" onClick={loadMembers}>
              {t('common:actions.retry', 'Retry')}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-2 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && members.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Users size={28} className="text-muted-foreground/40" />
              <p className="text-sm font-medium">{t('datasets:member_manager.no_members', 'No members yet.')}</p>
              <Guard permission="member:add">
              <p className="text-xs text-muted-foreground">
                {t('datasets:member_manager.no_members_hint', 'Click "Add Member" to invite someone.')}
              </p>
            </Guard>
          </div>
        )}

        {/* Members List */}
        {!loading && !error && members.length > 0 && (
          <div className="divide-y divide-border">
            {members.map((member) => {
              const isEditing = editingMemberId === member.id;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-background">
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {getInitials(member.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.first_name
                        ? `${member.first_name} ${member.last_name || ''}`
                        : member.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{member.username}
                      {member.email && ` • ${member.email}`}
                    </p>
                  </div>

                  {hasPermission('member:update-role') ? (
                    (member.role === 'admin') ? (
                      <Badge
                        variant="secondary"
                        className={`text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}
                      >
                        {member.role}
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={member.role}
                          onValueChange={(val) => handleRoleChange(member.id, val)}
                          disabled={isEditing}
                        >
                          <SelectTrigger
                            className={`h-7 w-[110px] text-xs font-medium border-none bg-transparent hover:bg-muted/50 gap-1 ${getRoleBadgeColor(member.role)}`}
                          >
                            <Shield size={10} />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role.value} value={role.value} className="text-xs">
                                {t(role.labelKey, role.defaultLabel)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingMemberId(member.id)}
                          title={t('common:actions.remove', 'Remove')}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )
                  ) : (
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}
                    >
                      {member.role}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!deletingMemberId} onOpenChange={(open) => !open && setDeletingMemberId(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserMinus size={16} />
              {t('datasets:member_manager.remove_title', 'Remove Member')}
            </DialogTitle>
            <DialogDescription>
              {t('datasets:member_manager.remove_confirm', 'Are you sure you want to remove this member from the dataset? This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingMemberId(null)}
                        >
              {t('common:actions.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveMember}
              disabled={deletingMember}
              className="gap-1.5"
            >
              {deletingMember && <Loader2 size={14} className="animate-spin" />}
              {t('common:actions.remove', 'Remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DatasetMemberManager;