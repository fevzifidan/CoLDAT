// frontend/src/features/tasks/components/MemberSelectionStep.tsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  AlertCircle,
  UserPlus,
  User as UserIcon,
  UserCheck,
  CheckCircle2,
  Plus,
  X,
  Trash2,
} from 'lucide-react';
import notificationService from '@/shared/services/notification/notification.service';
import { datasetMemberService } from '@/features/datasets/services/datasetMemberService';
import { userLookupService } from '@/features/tasks/services/userLookupService';

export interface DatasetMember {
  user_id: string;
  username: string;
  role: 'annotator' | 'viewer' | 'admin';
}

interface MemberSelectionStepProps {
  datasetId: string;
  onSelect: (member: DatasetMember) => void;
  selectedMember: DatasetMember | null;
}

const MemberSelectionStep = ({ datasetId, onSelect, selectedMember }: MemberSelectionStepProps) => {
  const { t } = useTranslation(['tasks']);

  const [members, setMembers] = useState<DatasetMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add member dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addRole, setAddRole] = useState<'annotator' | 'viewer'>('annotator');
  const [addLoading, setAddLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ id: string; username: string } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Remove member
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await datasetMemberService.getMembers(datasetId);
      const data: DatasetMember[] = response?.data ?? response?.results ?? response ?? [];
      setMembers(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load members.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    if (datasetId) fetchMembers();
  }, [datasetId, fetchMembers]);

  // --- Lookup user before adding ---
  const handleLookupUser = async () => {
    if (!addUsername.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const response: any = await userLookupService.lookup(addUsername.trim());
      const user = response?.data ?? response;
      if (user?.id && user?.username) {
        setLookupResult({ id: user.id, username: user.username });
        setLookupError(null);
      } else {
        setLookupResult(null);
        setLookupError(t('tasks:create.member_lookup_not_found', 'User not found.'));
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setLookupError(t('tasks:create.member_lookup_not_found', 'User not found.'));
      } else {
        setLookupError(t('tasks:create.member_lookup_error', 'Failed to look up user.'));
      }
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // --- Add member ---
  const handleAddMember = async () => {
    if (!lookupResult) return;
    setAddLoading(true);
    try {
      await datasetMemberService.addMember(datasetId, {
        username: lookupResult.username,
        role: addRole,
      });
      notificationService.success(
        t('tasks:create.member_add_success', 'Member added successfully.')
      );
      setAddDialogOpen(false);
      setAddUsername('');
      setAddRole('annotator');
      setLookupResult(null);
      setLookupError(null);
      // Refresh the member list
      fetchMembers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add member.';
      notificationService.error(msg);
    } finally {
      setAddLoading(false);
    }
  };

  // --- Remove member ---
  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm(t('tasks:create.member_remove_confirm', 'Remove this member from the dataset?'))) return;
    setRemovingUserId(userId);
    try {
      await datasetMemberService.removeMember(datasetId, userId);
      notificationService.success(
        t('tasks:create.member_remove_success', 'Member removed successfully.')
      );
      fetchMembers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove member.';
      notificationService.error(msg);
    } finally {
      setRemovingUserId(null);
    }
  };

  const selectedUserId = selectedMember?.user_id;

  // --- Render ---
  return (
    <div className="space-y-4">
      {/* Header with Add Member button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('tasks:create.member_list_description', 'Select a member from this dataset or add a new one.')}
        </p>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => setAddDialogOpen(true)}
          >
            <UserPlus size={14} />
            {t('tasks:create.member_add_button', 'Add Member')}
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t('tasks:create.member_add_title', 'Add Member to Dataset')}
              </DialogTitle>
              <DialogDescription>
                {t('tasks:create.member_add_description', 'Look up an existing user by username and assign a role.')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Username lookup */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t('tasks:create.member_add_username_label', 'Username')}
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('tasks:create.member_add_username_placeholder', 'e.g. johndoe')}
                    value={addUsername}
                    onChange={(e) => {
                      setAddUsername(e.target.value);
                      setLookupResult(null);
                      setLookupError(null);
                    }}
                    className="flex-1 bg-background"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookupUser();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleLookupUser}
                    disabled={!addUsername.trim() || lookupLoading}
                    className="shrink-0"
                  >
                    {lookupLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      t('tasks:create.member_lookup_button', 'Lookup')
                    )}
                  </Button>
                </div>

                {/* Lookup result */}
                {lookupLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" />
                    {t('common:status.loading', 'Loading...')}
                  </div>
                )}
                {lookupResult && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg">
                    <CheckCircle2 size={14} />
                    {t('tasks:create.member_lookup_found', 'User found:')} @{lookupResult.username}
                  </div>
                )}
                {lookupError && (
                  <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 p-2 rounded-lg">
                    <AlertCircle size={14} />
                    {lookupError}
                  </div>
                )}
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t('tasks:create.member_add_role_label', 'Role')}
                </label>
                <Select value={addRole} onValueChange={(v) => setAddRole(v as 'annotator' | 'viewer')}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annotator">
                      {t('tasks:create.role.annotator', 'Annotator')}
                    </SelectItem>
                    <SelectItem value="viewer">
                      {t('tasks:create.role.viewer', 'Viewer')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(false)}>
                {t('common:actions.cancel', 'Cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleAddMember}
                disabled={!lookupResult || addLoading}
              >
                {addLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1" />
                    {t('common:status.saving', 'Saving...')}
                  </>
                ) : (
                  t('tasks:create.member_add_confirm', 'Add Member')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <AlertCircle size={24} className="text-destructive" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchMembers}>
            {t('tasks:error_try_again', 'Try Again')}
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && members.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <UserIcon size={32} className="text-muted-foreground/40" />
          <p className="text-sm">
            {t('tasks:create.member_list_empty', 'No members in this dataset yet.')}
          </p>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setAddDialogOpen(true)}>
            <Plus size={14} />
            {t('tasks:create.member_add_button', 'Add Member')}
          </Button>
        </div>
      )}

      {/* Members Table */}
      {!loading && members.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('tasks:create.member_table.user', 'User')}
                </TableHead>
                <TableHead className="w-28">
                  {t('tasks:create.member_table.role', 'Role')}
                </TableHead>
                <TableHead className="w-[90px] text-right sr-only">
                  {t('tasks:create.member_table.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isSelected = selectedUserId === member.user_id;
                const isRemoving = removingUserId === member.user_id;
                return (
                  <TableRow key={member.user_id} className={isSelected ? 'bg-primary/5' : undefined}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {member.username[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">@{member.username}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {member.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                                            <Badge
                        variant="outline"
                                                className={`text-[10px] uppercase ${
                          member.role === 'admin'
                            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                            : member.role === 'annotator'
                            ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/20 dark:text-sky-400'
                            : 'border-muted-foreground/20'
                        }`}
                      >
                        {member.role === 'admin'
                          ? t('tasks:create.member_role_admin', 'Admin')
                          : member.role === 'annotator'
                          ? t('tasks:create.role.annotator', 'Annotator')
                          : t('tasks:create.role.viewer', 'Viewer')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant={isSelected ? 'secondary' : 'outline'}
                          onClick={() => onSelect(member)}
                          className="h-8 min-w-[68px] text-xs"
                                                    disabled={member.role === 'admin'}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 size={12} className="mr-1" />
                              {t('tasks:create.user_table.selected', 'Selected')}
                            </>
                          ) : (
                            t('tasks:create.user_table.select', 'Select')
                          )}
                        </Button>
                                                {member.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveMember(member.user_id)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MemberSelectionStep;
