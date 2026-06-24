// src/features/datasets/AddDatasetMembersPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
  ArrowLeft,
  Loader2,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  Users,
  Shield,
} from 'lucide-react';
import { FormStepper, type Step } from '@/shared/components/FormStepper';
import notificationService from '@/shared/services/notification/notification.service';
import { datasetService } from './services/datasetService';
import { projectService } from '@/features/projects/services/projectService';

// ── Types ──────────────────────────────────────────────────────────
interface DatasetInfo {
  id: string;
  project_id: string;
  name: string;
}

interface ProjectMember {
  id: string;
  user_id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

type AddMemberStep = 1 | 2;
const TOTAL_STEPS = 2;

const STEPS: Step[] = [
  { number: 1, label: 'Select Members' },
  { number: 2, label: 'Assign Roles' },
];

// ── Helpers ─────────────────────────────────────────────────────────
const getInitials = (username: string) => username.slice(0, 2).toUpperCase();

// ── Page Component ──────────────────────────────────────────────────
const AddDatasetMembersPage = () => {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['datasets', 'common']);

  // Data state
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step state
  const [step, setStep] = useState<AddMemberStep>(1);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [roleAssignments, setRoleAssignments] = useState<Map<string, 'viewer' | 'annotator'>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch dataset + project members ────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Get dataset details to find project_id
      const dsResponse = await datasetService.getDatasetById(datasetId);
      const dsData = dsResponse?.data || dsResponse;
      if (!dsData?.id || !dsData?.project_id) {
        throw new Error('Dataset not found.');
      }
      setDataset(dsData);

      // 2. Get project members, excluding users already in this dataset
      const membersResponse = await projectService.getProjectMembers(
        dsData.project_id,
        { exclude_dataset_members: datasetId }
      );
      const membersData: ProjectMember[] = membersResponse?.data ?? membersResponse?.results ?? membersResponse ?? [];
      setProjectMembers(Array.isArray(membersData) ? membersData : []);

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Step 1: Selection handlers ────────────────────────────────────
  const isAllSelected = projectMembers.length > 0 && selectedUserIds.size === projectMembers.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(projectMembers.map((m) => m.user_id)));
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const canGoToStep2 = selectedUserIds.size > 0;

  // ── Step 2: Role assignment + submit ──────────────────────────────
  const handleRoleChange = (userId: string, role: 'viewer' | 'annotator') => {
    setRoleAssignments((prev) => {
      const next = new Map(prev);
      next.set(userId, role);
      return next;
    });
  };

  const selectedMembers = projectMembers.filter((m) => selectedUserIds.has(m.user_id));

  // Initialize default roles for newly selected members
  useEffect(() => {
    setRoleAssignments((prev) => {
      const next = new Map(prev);
      let changed = false;
      for (const userId of selectedUserIds) {
        if (!next.has(userId)) {
          next.set(userId, 'viewer');
          changed = true;
        }
      }
      // Clean up removed selections
      for (const userId of next.keys()) {
        if (!selectedUserIds.has(userId)) {
          next.delete(userId);
          changed = true;
        }
      }
      return changed ? new Map(next) : prev;
    });
  }, [selectedUserIds]);

  const handleSubmit = async () => {
    if (!datasetId || selectedMembers.length === 0) return;

    setIsSubmitting(true);
    const results = await Promise.allSettled(
      selectedMembers.map((member) => {
        const role = roleAssignments.get(member.user_id) || 'viewer';
        return datasetService.addDatasetMember(datasetId, {
          username: member.username,
          role,
        });
      })
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed === 0) {
      notificationService.success(
        t('datasets:add_members_page.add_success', {
          count: succeeded,
          defaultValue: '{{count}} member(s) added successfully.',
        })
      );
      navigate(`/datasets/${datasetId}`);
    } else if (succeeded > 0) {
      notificationService.warning(
        t('datasets:add_members_page.add_partial', {
          succeeded,
          failed,
          defaultValue: '{{succeeded}} member(s) added, {{failed}} failed.',
        })
      );
      navigate(`/datasets/${datasetId}`);
    } else {
      notificationService.error(
        t('datasets:add_members_page.add_error', 'Failed to add members.')
      );
    }

    setIsSubmitting(false);
  };

  // ── Navigation ────────────────────────────────────────────────────
  const goToStep = (targetStep: AddMemberStep) => setStep(targetStep);
  const handleBack = () => navigate(`/datasets/${datasetId}`);

  // ── Loading State ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-3 border-b pb-4 border-border">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 shrink-0">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-3 border-b pb-4 border-border">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 shrink-0">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {t('datasets:add_members_page.title', 'Add Team Members')}
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 py-16">
          <AlertCircle size={32} className="text-destructive" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchData}>
              {t('common:actions.retry', 'Retry')}
            </Button>
            <Button size="sm" variant="outline" onClick={handleBack}>
              {t('common:actions.back', 'Go Back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dataset) return null;

  // ── Render Step 1: Select Members ─────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {t('datasets:add_members_page.step1_title', 'Select Members')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('datasets:add_members_page.step1_description', 'Choose team members from the project to add to this dataset.')}
        </p>
        {dataset && (
          <Badge variant="outline" className="mt-2 gap-1.5 text-xs px-3 py-1">
            <Users size={12} />
            {dataset.name}
          </Badge>
        )}
      </div>

      {projectMembers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Users size={32} className="text-muted-foreground/40" />
          <p className="text-sm">
            {t('datasets:add_members_page.no_members', 'No other members found in the project.')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('datasets:add_members_page.no_members_hint', 'Add members to the project first.')}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleAll}
                    aria-label={t('common:actions.select_all', 'Select all')}
                  />
                </TableHead>
                <TableHead>
                  {t('datasets:add_members_page.table.user', 'User')}
                </TableHead>
                <TableHead className="w-36">
                  {t('datasets:add_members_page.table.role_in_project', 'Role in Project')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectMembers.map((member) => {
                const isSelected = selectedUserIds.has(member.user_id);
                return (
                  <TableRow
                    key={member.user_id}
                    className={isSelected ? 'bg-primary/5' : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMember(member.user_id)}
                        aria-label={`Select ${member.username}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {getInitials(member.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {member.first_name
                              ? `${member.first_name} ${member.last_name || ''}`
                              : member.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{member.username}
                            {member.email && ` • ${member.email}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Shield size={10} />
                        {t('datasets:add_members_page.project_member', 'Project Member')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedUserIds.size > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {t('datasets:add_members_page.selected_count', {
            count: selectedUserIds.size,
            defaultValue: '{{count}} member(s) selected',
          })}
        </p>
      )}
    </div>
  );

  // ── Render Step 2: Assign Roles ───────────────────────────────────
  const renderStep2 = () => {
    if (selectedMembers.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-12">
          <AlertCircle size={24} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t('datasets:add_members_page.no_selection', 'No members selected. Please go back.')}
          </p>
          <Button variant="outline" size="sm" onClick={() => goToStep(1)}>
            {t('common:actions.back', 'Back')}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">
            {t('datasets:add_members_page.step2_title', 'Assign Roles')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('datasets:add_members_page.step2_description', 'Set the role for each selected member.')}
          </p>
          <Badge variant="outline" className="mt-2 gap-1.5 text-xs px-3 py-1">
            <CheckCircle2 size={12} />
            {t('datasets:add_members_page.selected_count', {
              count: selectedMembers.length,
              defaultValue: '{{count}} member(s) to add',
            })}
          </Badge>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('datasets:add_members_page.table.user', 'User')}
                </TableHead>
                <TableHead className="w-44">
                  {t('datasets:add_members_page.table.role', 'Role')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMembers.map((member) => {
                const currentRole = roleAssignments.get(member.user_id) || 'viewer';
                return (
                  <TableRow key={member.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {getInitials(member.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">@{member.username}</p>
                          {member.email && (
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentRole}
                        onValueChange={(val) => handleRoleChange(member.user_id, val as 'viewer' | 'annotator')}
                      >
                        <SelectTrigger className="w-full h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">
                            {t('datasets:roles.viewer', 'Viewer')}
                          </SelectItem>
                          <SelectItem value="annotator">
                            {t('datasets:roles.annotator', 'Annotator')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-9 w-9 shrink-0"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <UserPlus size={22} className="text-primary" />
            {t('datasets:add_members_page.title', 'Add Team Members')}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('datasets:add_members_page.subtitle', 'Select and assign roles to project members')}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <FormStepper steps={STEPS} currentStep={step} />

      {/* Step Content */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </CardContent>

        {/* Footer */}
        <CardFooter className="border-t border-border px-6 py-4 bg-muted/30 flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep(1)}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {t('common:actions.back', 'Back')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">
              {t('common:step_of', {
                current: step,
                total: TOTAL_STEPS,
                defaultValue: `Step ${step} of ${TOTAL_STEPS}`,
              })}
            </span>

            {step === 1 ? (
              <Button
                size="sm"
                onClick={() => goToStep(2)}
                disabled={!canGoToStep2}
                className="gap-1.5"
              >
                {t('common:actions.next', 'Next')}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={selectedMembers.length === 0 || isSubmitting}
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t('common:status.adding', 'Adding...')}
                  </>
                ) : (
                  t('datasets:add_members_page.add_members_button', 'Add Members')
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddDatasetMembersPage;
