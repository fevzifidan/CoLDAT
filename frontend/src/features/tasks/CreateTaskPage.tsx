// frontend/src/features/tasks/CreateTaskPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Database,
  ImageIcon,
} from 'lucide-react';
import { useConfirm } from '@/shared/services/confirmation/useConfirm';
import notificationService from '@/shared/services/notification/notification.service';
import { taskService } from '@/features/tasks/services/taskService';
import { datasetTaskService } from '@/features/datasets/services/datasetTaskService';
import DatasetSelectionStep, { type DatasetResult } from '@/features/tasks/components/DatasetSelectionStep';
import MemberSelectionStep, { type DatasetMember } from '@/features/tasks/components/MemberSelectionStep';
import RoleSelectionStep from '@/features/tasks/components/RoleSelectionStep';
import AssetSelectionStep from '@/features/tasks/components/AssetSelectionStep';

// --- Types ---
interface AnnotatorAssignment {
  asset_id: string;
  assignee_username: string;
}

type CreateStep = 1 | 2 | 3 | 4;

// --- Constants ---
const TOTAL_STEPS = 4;

const CreateTaskPage = () => {
  const { t } = useTranslation(['tasks', 'common']);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // --- Step & Form State ---
  const [step, setStep] = useState<CreateStep>(1);
  const [selectedDataset, setSelectedDataset] = useState<DatasetResult | null>(null);
  const [selectedMember, setSelectedMember] = useState<DatasetMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<'Annotator' | 'Viewer'>('Annotator');
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [assignedAssetMap, setAssignedAssetMap] = useState<Map<string, string>>(new Map());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // --- Conflict Map Loading ---
  const [conflictLoading, setConflictLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastDatasetIdRef = useRef<string | null>(null);

  // --- Mark form as dirty on any change ---
  useEffect(() => {
    if (selectedDataset || selectedMember || selectedAssetIds.size > 0 || note.trim()) {
      setIsDirty(true);
    }
  }, [selectedDataset, selectedMember, selectedAssetIds, note]);

  // --- Conflict Map Building (using /datasets/{datasetId}/annotator-assignments) ---
  const buildConflictMap = useCallback(async (datasetId: string, username: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setConflictLoading(true);
    const assignmentMap = new Map<string, string>();

    try {
      let cursor: string | null = null;
      let hasMore = true;

      while (hasMore && !controller.signal.aborted) {
        const response: any = await datasetTaskService.getAnnotatorAssignments(
          datasetId,
          { cursor: cursor ?? undefined, limit: 200 } as any
        );

        if (controller.signal.aborted) break;

        const data: AnnotatorAssignment[] = response?.data ?? response?.results ?? [];

        for (const item of data) {
          if (item.assignee_username !== username) {
            assignmentMap.set(item.asset_id, item.assignee_username);
          }
        }

        cursor = response?.next_cursor ?? null;
        hasMore = !!cursor;
      }

      if (!controller.signal.aborted) {
        setAssignedAssetMap(assignmentMap);
      }
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.error('Failed to build conflict map:', err);
        setAssignedAssetMap(new Map());
      }
    } finally {
      if (!controller.signal.aborted) {
        setConflictLoading(false);
      }
    }
  }, []);

  // --- Rebuild conflict map when dataset, user, or role changes ---
  useEffect(() => {
    if (!selectedDataset?.id || !selectedMember || selectedRole !== 'Annotator') {
      setAssignedAssetMap(new Map());
      lastDatasetIdRef.current = null;
      return;
    }

    if (selectedDataset.id === lastDatasetIdRef.current) return;
    lastDatasetIdRef.current = selectedDataset.id;

    buildConflictMap(selectedDataset.id, selectedMember.username);
  }, [selectedDataset?.id, selectedMember, selectedRole, buildConflictMap]);

  // --- Navigation Handlers ---
  const handleBackToTasks = async () => {
    if (isDirty) {
      const confirmed = await confirm({
        title: t('tasks:create.discard_changes_title'),
        description: t('tasks:create.discard_changes_desc'),
      });
      if (!confirmed) return;
    }
    navigate('/tasks');
  };

  const goToStep = (targetStep: CreateStep) => {
    setStep(targetStep);
  };

  // --- Step 1: Dataset Selection ---
  const handleDatasetSelect = (dataset: DatasetResult) => {
    if (selectedDataset?.id === dataset.id) return;
    setSelectedDataset(dataset);
    setSelectedMember(null);
    setSelectedRole('Annotator');
    setSelectedAssetIds(new Set());
    setAssignedAssetMap(new Map());
    setStep(2);
  };

  // --- Step 2: Member Selection ---
  const handleMemberSelect = (member: DatasetMember) => {
    if (selectedMember?.user_id === member.user_id) return;
    setSelectedMember(member);
    setSelectedAssetIds(new Set());
    setStep(3);
  };

  // --- Step 3: Role Selection + auto-advance ---
  const handleRoleChange = (role: 'Annotator' | 'Viewer') => {
    setSelectedRole(role);
    setSelectedAssetIds(new Set());
    setStep(4);
  };

  // --- Step 4: Asset Toggle ---
  const handleAssetToggle = (assetId: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  // --- Submission ---
  const handleSubmit = async () => {
    if (!selectedMember || !selectedDataset || selectedAssetIds.size === 0) return;

    setIsSubmitting(true);
    try {
            await taskService.createTask({
        dataset_id: selectedDataset.id,
        assignee_username: selectedMember.username,
        role: selectedRole,
        image_ids: Array.from(selectedAssetIds),
        note: note.trim() || undefined,
      });

      notificationService.success(t('tasks:create.success'));
      navigate('/tasks');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t('tasks:create.error');
      notificationService.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Validation per step ---
  const canContinue = (): boolean => {
    switch (step) {
      case 1: return !!selectedDataset;
      case 2: return !!selectedMember;
      case 3: return !!selectedRole;
      case 4: return selectedAssetIds.size > 0;
      default: return false;
    }
  };

  const canSubmit = selectedAssetIds.size > 0 && !isSubmitting;

  // --- Render helpers ---
  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2, 3, 4] as CreateStep[]).map((s) => {
        const isActive = s === step;
        const isCompleted = s < step;
        return (
          <div key={s} className="flex items-center gap-2">
            {s > 1 && <div className="h-px w-6 bg-border" />}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                    ? 'bg-primary/10 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={14} />
                ) : (
                  s
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s === 1
                  ? t('tasks:create.step1_title')
                  : s === 2
                  ? t('tasks:create.step2_title')
                  : s === 3
                  ? t('tasks:create.step3_title')
                  : t('tasks:create.step4_title')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{t('tasks:create.step1_title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('tasks:create.step1_description')}
              </p>
            </div>
            <DatasetSelectionStep
              onSelect={handleDatasetSelect}
              selectedDataset={selectedDataset}
            />
          </div>
        );

      case 2:
        if (!selectedDataset) {
          return (
            <div className="flex flex-col items-center gap-4 py-12">
              <AlertCircle size={24} className="text-destructive" />
              <p className="text-sm text-muted-foreground">
                {t('tasks:create.no_dataset_selected', 'No dataset selected. Please go back.')}
              </p>
              <Button variant="outline" size="sm" onClick={() => goToStep(1)}>
                {t('tasks:create.back')}
              </Button>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{t('tasks:create.step2_title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('tasks:create.step2_description')}
              </p>
              <Badge variant="outline" className="mt-2 gap-1.5 text-xs px-3 py-1">
                <Database size={12} />
                {selectedDataset.name}
              </Badge>
            </div>
            <MemberSelectionStep
              datasetId={selectedDataset.id}
              onSelect={handleMemberSelect}
              selectedMember={selectedMember}
            />
          </div>
        );

      case 3:
        if (!selectedMember) {
          return (
            <div className="flex flex-col items-center gap-4 py-12">
              <AlertCircle size={24} className="text-destructive" />
              <p className="text-sm text-muted-foreground">
                {t('tasks:create.no_member_selected', 'No member selected. Please go back.')}
              </p>
              <Button variant="outline" size="sm" onClick={() => goToStep(2)}>
                {t('tasks:create.back')}
              </Button>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{t('tasks:create.step3_title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('tasks:create.step3_description')}
              </p>
            </div>
            <RoleSelectionStep
              selectedMember={selectedMember}
              selectedRole={selectedRole}
              onRoleChange={handleRoleChange}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{t('tasks:create.step4_title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('tasks:create.step4_description')}
              </p>
              {/* Active filters badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1">
                  <Database size={12} />
                  {selectedDataset?.name}
                </Badge>
                {selectedMember && (
                  <Badge variant="secondary" className="gap-1.5 text-xs px-3 py-1">
                    @{selectedMember.username}
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1.5 text-xs px-3 py-1">
                  {selectedRole === 'Annotator'
                    ? t('tasks:create.role.annotator', 'Annotator')
                    : t('tasks:create.role.viewer', 'Viewer')}
                </Badge>
              </div>
            </div>

            {/* Conflict Loading Indicator */}
            {selectedRole === 'Annotator' && conflictLoading && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin shrink-0" />
                <span>{t('tasks:loading', 'Checking existing assignments...')}</span>
              </div>
            )}

            <AssetSelectionStep
              selectedRole={selectedRole}
              selectedUsername={selectedMember?.username ?? ''}
              datasetId={selectedDataset?.id ?? ''}
              selectedAssetIds={selectedAssetIds}
              onAssetToggle={handleAssetToggle}
              assignedAssetMap={assignedAssetMap}
            />

            {/* Note Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('tasks:create.note_label')}
              </label>
              <Textarea
                placeholder={t('tasks:create.note_placeholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px] bg-background resize-y"
                disabled={isSubmitting}
              />
            </div>

            {/* Selection Summary */}
            {selectedAssetIds.size > 0 && (
              <div className="flex items-center justify-end gap-2">
                <Badge variant="secondary" className="gap-1.5 text-xs px-3 py-1">
                  <ImageIcon size={12} />
                  {t('tasks:create.asset_table.selected_count', {
                    count: selectedAssetIds.size,
                    defaultValue: '{{count}} assets selected',
                  })}
                </Badge>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToTasks}
          className="h-9 w-9 shrink-0"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {t('tasks:create.title')}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('tasks:create.back_to_tasks')}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>

        {/* Footer Navigation */}
        <CardFooter className="border-t border-border px-6 py-4 bg-muted/30 flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep((step - 1) as CreateStep)}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {t('tasks:create.back')}
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

            {step < TOTAL_STEPS ? (
              <Button
                size="sm"
                onClick={() => goToStep((step + 1) as CreateStep)}
                disabled={!canContinue()}
                className="gap-1.5"
              >
                {t('tasks:create.continue')}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t('tasks:create.creating')}
                  </>
                ) : (
                  t('tasks:create.create_button')
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateTaskPage;
