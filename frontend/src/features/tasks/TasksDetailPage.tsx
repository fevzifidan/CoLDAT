import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  ArrowLeft, 
  UserPlus, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Plus, 
  Trash2, 
  AlertCircle,
  Clock,
  Loader2,
  MessageSquareX,
  PenLine,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FileText,
  CalendarDays,
  Flag
} from "lucide-react";

import { RoleProvider, usePermission } from '@/context/PermissionContext';
import { Guard } from '@/shared/components/Guard';
import { useConfirm } from '@/shared/services/confirmation/useConfirm';
import { useAppStore } from '@/store';
import { type BackendRole } from '@/shared/roles';
import { taskService } from '@/features/tasks/services/taskService';
import notificationService from '@/shared/services/notification/notification.service';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import type { PaginatedResponse } from '@/shared/hooks/useCursorPagination';

interface TasksDetailPageProps {
  taskId: string;
  onBack?: () => void;
}

// Backend'den dönecek response'ın iç yapısı
interface TaskDetailData {
  id: string;
  name?: string;
  description?: string;
  priority?: string;
  deadline?: string | null;
  dataset_id: string;
  assignee_id?: string;
  role?: string;
  status: string;
  rejection_note?: string | null;
  image_count?: number;
}

/**
 * GET /tasks/{taskId}/images endpoint'inden dönen image objesi
 * CoLDAT API Design.yaml Image schema'sı ile birebir uyumludur.
 */
interface TaskImage {
  id: string;
  image_id: string;
  filename: string;
  mime_type: string;
  status: string;
  embedding_status: string | null;
}

/** Sayfa başına gösterilecek asset sayısı (API limit değeri ile aynı) */
const ASSETS_PAGE_LIMIT = 50;

// ──────────────────────────────────────────────────────────────
// Dış sarmalayıcı: state & handler'ları yönetir, RoleProvider'ı kurar.
// usePermission çağrısı RoleProvider children'ı olan iç bileşene bırakılır.
// ──────────────────────────────────────────────────────────────
const TasksDetailPage = ({ taskId, onBack }: TasksDetailPageProps) => {
  const { t } = useTranslation(['tasks', 'common']);
  const navigate = useNavigate();
  
  // --- STATE YÖNETİMİ ---
  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Modal ve Form State'leri
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [newAssignee, setNewAssignee] = useState<string>("");
  
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState<boolean>(false);
  const [newAssetId, setNewAssetId] = useState<string>("");

  const [note, setNote] = useState<string>("");

  // --- GÖRSEL LİSTESİ (GET /tasks/{taskId}/images) — Cursor-based pagination ---
    const fetchImagesAdapter = async (
    cursor: string | null | undefined,
    limit: number
  ): Promise<PaginatedResponse<TaskImage>> => {
    return await taskService.getTaskImages(taskId, { limit, after: cursor as any });
  };

  const {
    items: images,
    loading: imagesLoading,
    error: imagesError,
    hasNext,
    hasPrev,
    currentPage,
    goNext,
    goPrev,
    loadPage: refreshImages,
  } = useCursorPagination<TaskImage>({
    fetchFn: fetchImagesAdapter,
    limit: ASSETS_PAGE_LIMIT,
    enabled: !!taskId,
    mode: 'paginated',
  });

  // --- DATA FETCHING (GET /tasks/{taskId}) ---
  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskService.getTaskById(taskId);
      
      setTask({
        ...data,
        role: data.role || null
      });
    } catch (err: any) {
      console.error("Error fetching task details:", err);
      setError(err?.response?.data?.message || "Failed to load task details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  // --- API EVENT HANDLERS (PATCH /tasks/{taskId}/status) ---
  const handleUpdateStatus = async (newStatus: string) => {
    if (!task) return;
    try {
      setIsSubmitting(true);
      await taskService.updateTaskStatus(taskId, { status: newStatus, note: note });
      
      if (newStatus === "rejected" && note.trim()) {
        setTask(prev => prev ? { ...prev, status: newStatus, rejection_note: note } : null);
      } else {
        setTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
      setNote("");
    } catch (err: any) {
      alert(err?.response?.data?.message || t('tasks:detail.status_update_failed', 'Status update failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- API EVENT HANDLERS (PATCH /tasks/{taskId}/assign) ---
  const handleReassignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignee.trim() || !task) return;

    try {
      setIsSubmitting(true);
      await taskService.reassignTask(taskId, { assignee_username: newAssignee });
      
      setTask(prev => prev ? { ...prev, assignee_username: newAssignee } : null);
      setIsAssignModalOpen(false);
      setNewAssignee("");
    } catch (err: any) {
      alert(err?.response?.data?.message || t('tasks:detail.reassignment_failed', 'Reassignment failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- API EVENT HANDLERS (POST /tasks/{taskId}/images) ---
  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetId.trim() || !task) return;

    try {
      setIsSubmitting(true);
      await taskService.addAssetsToTask(taskId, { asset_ids: [newAssetId] });
      
      await fetchTaskDetails();
      await refreshImages(null, false);
      setIsAddAssetModalOpen(false);
      setNewAssetId("");
    } catch (err: any) {
      alert(err?.response?.data?.message || t('tasks:detail.add_asset_failed', 'Adding asset failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- API EVENT HANDLERS (DELETE /tasks/{taskId}) ---
    const handleDeleteTask = async () => {
    if (!task) return;
    const confirmed = window.confirm(t('tasks:detail.confirm_delete', "Are you sure you want to revoke/delete this task assignment?"));
    if (!confirmed) return;
    try {
      setIsSubmitting(true);
      await taskService.deleteTask(taskId);
      if (onBack) onBack();
    } catch (err: any) {
      alert(err?.response?.data?.message || t('tasks:detail.delete_failed', 'Failed to delete task.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Badge renk dinamikleri ---
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ASSIGNED": return "bg-primary/10 text-primary border-primary/20";
      case "IN_PROGRESS": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "APPROVAL_PENDING": return "bg-muted text-muted-foreground border-border";
      case "COMPLETED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "REJECTED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  // --- KORUMA VE YÜKLENİYOR EKRANLARI ---
  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">{t('tasks:detail.loading', 'Loading task details from server...')}</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4 max-w-md mx-auto text-center">
        <div className="p-3 bg-destructive/10 text-destructive rounded-full">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg">{t('tasks:detail.error_title', 'An Error Occurred')}</h3>
          <p className="text-sm text-muted-foreground">{error || t('tasks:detail.error_task_not_found', 'Task not found.')}</p>
        </div>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft size={16} /> {t('tasks:detail.back', 'Back to Tasks Workspace')}
        </Button>
      </div>
    );
  }

  // Backend'den gelen user_role bilgisini RoleProvider'a aktarıyoruz.
  // Örn: "admin" → tüm yönetici butonları (Approve/Reject, Reassign, Add Asset, Revoke) görünür.
  // Örn: "annotator" → sadece "Submit for Approval" butonu görünür.
  // Örn: null/undefined → hiçbir yönetici butonu görünmez (güvenli varsayılan).
  const taskRole = (task.role?.toLowerCase() as BackendRole) || null;

  // İç bileşene passthrough edilecek ortak değerler
  const innerCommon = {
    t, navigate, taskId, onBack, task, getStatusBadge,
    images, imagesLoading, imagesError, hasNext, hasPrev, currentPage,
    isSubmitting, isAssignModalOpen, newAssignee, isAddAssetModalOpen, newAssetId, note,
    onUpdateStatus: handleUpdateStatus,
    onReassignTask: handleReassignTask,
    onAddAsset: handleAddAsset,
    onDeleteTask: handleDeleteTask,
    onSetIsAssignModalOpen: setIsAssignModalOpen,
    onSetNewAssignee: setNewAssignee,
    onSetIsAddAssetModalOpen: setIsAddAssetModalOpen,
    onSetNewAssetId: setNewAssetId,
    onSetNote: setNote,
    onRefreshImages: refreshImages as any,
    goNext, goPrev,
  };

  return (
    <RoleProvider role={taskRole}>
      <TasksDetailPageInner {...innerCommon} />
    </RoleProvider>
  );
};

// ──────────────────────────────────────────────────────────────
// İç bileşen: RoleProvider children'ı → usePermission güvenle kullanılabilir.
// Asset yönlendirme handler'ları (hasPermission kullanan) burada tanımlanır.
// ──────────────────────────────────────────────────────────────
interface TasksDetailPageInnerProps {
  t: any;
  navigate: any;
  taskId: string;
  onBack?: () => void;
  task: TaskDetailData;
  getStatusBadge: (status: string) => string;
  images: TaskImage[];
  imagesLoading: boolean;
  imagesError: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  isSubmitting: boolean;
  isAssignModalOpen: boolean;
  newAssignee: string;
  isAddAssetModalOpen: boolean;
  newAssetId: string;
  note: string;
  onUpdateStatus: (newStatus: string) => Promise<void>;
  onReassignTask: (e: React.FormEvent) => Promise<void>;
  onAddAsset: (e: React.FormEvent) => Promise<void>;
  onDeleteTask: () => Promise<void>;
  onSetIsAssignModalOpen: (open: boolean) => void;
  onSetNewAssignee: (val: string) => void;
  onSetIsAddAssetModalOpen: (open: boolean) => void;
  onSetNewAssetId: (val: string) => void;
  onSetNote: (val: string) => void;
  onRefreshImages: (cursor?: string | null, useCache?: boolean) => void;
  goNext: () => void;
  goPrev: () => void;
}

const TasksDetailPageInner = ({
  t, navigate, taskId, onBack, task, getStatusBadge,
  images, imagesLoading, imagesError, hasNext, hasPrev, currentPage,
  isSubmitting, isAssignModalOpen, newAssignee, isAddAssetModalOpen, newAssetId, note,
  onUpdateStatus, onReassignTask, onAddAsset, onDeleteTask,
  onSetIsAssignModalOpen, onSetNewAssignee,
  onSetIsAddAssetModalOpen, onSetNewAssetId, onSetNote,
  onRefreshImages, goNext, goPrev,
}: TasksDetailPageInnerProps) => {
  
    const { hasPermission } = usePermission(); // ✅ Artık RoleProvider children'ı içinde
  const { confirm } = useConfirm();

  const handleAssetClick = (assetId: string) => {
    if (hasPermission('task:view-all')) {
      navigate(`/view/${taskId}/${assetId}`);
    } else if (task?.role === 'Annotator') {
      navigate(`/annotate/${taskId}/${assetId}`);
    } else {
      navigate(`/view/${taskId}/${assetId}`);
    }
  };

  const handleOpenInAnnotator = (assetId: string) => {
    navigate(`/annotate/${taskId}/${assetId}`);
  };

  const handleOpenInViewer = (assetId: string) => {
    navigate(`/view/${taskId}/${assetId}`);
  };

  const handleCopyAssetId = async (assetId: string) => {
    try {
      await navigator.clipboard.writeText(assetId);
      notificationService.success(t('tasks:detail.asset_id_copied', 'Asset ID copied to clipboard!'));
    } catch {
      notificationService.error(t('tasks:detail.asset_id_copy_failed', 'Failed to copy Asset ID.'));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Üst Bar / Geri Dönüş ve Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9">
            <ArrowLeft size={16} />
          </Button>
          <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-extrabold text-foreground truncate max-w-md">
                {task.name && task.name !== 'Untitled Task' ? task.name : `${t('tasks:detail.task_prefix', 'Task')} #${task.id.slice(0, 8)}`}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(task.status)}`}>
                {task.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('tasks:detail.dataset_id', 'Dataset ID:')} {task.dataset_id}
              {task.assignee_id && (
                <span className="ml-3 border-l border-border pl-3">@{task.assignee_id}</span>
              )}
            </p>
          </div>
        </div>

        {/* Yönetici Hızlı Aksiyonları */}
        <Guard permission="task:delete">
          <Button 
            variant="outline" 
            disabled={isSubmitting}
            onClick={onDeleteTask}
            className="h-9 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 gap-1.5 text-xs font-bold"
          >
            <Trash2 size={14} />
            {t('tasks:detail.revoke_button', 'Revoke Task')}
          </Button>
        </Guard>
      </div>

      {/* İki Sütunlu Grid Detay Alanı */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Sol Panel: Meta Bilgiler & İş Akışı Yönetimi */}
        <div className="md:col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm tracking-wide text-muted-foreground uppercase">{t('tasks:detail.info_section', 'Task Information')}</h3>
            
            <div className="space-y-3 text-sm">
              {/* Task Name */}
              {task.name && task.name !== 'Untitled Task' && (
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="text-muted-foreground">{t('tasks:detail.task_name', 'Name:')}</span>
                  <span className="font-semibold text-right max-w-[200px] truncate">{task.name}</span>
                </div>
              )}

              {/* Priority */}
              {task.priority && (
                <div className="flex justify-between border-b pb-2 border-border items-center">
                  <span className="text-muted-foreground">{t('tasks:detail.priority', 'Priority:')}</span>
                  <span className="flex items-center gap-1.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-amber-500' :
                      task.priority === 'medium' ? 'bg-blue-500' :
                      'bg-emerald-500'
                    }`} />
                    <span className="font-semibold capitalize">{task.priority}</span>
                  </span>
                </div>
              )}

              {/* Deadline */}
              {task.deadline && (
                <div className="flex justify-between border-b pb-2 border-border items-center">
                  <span className="text-muted-foreground">{t('tasks:detail.deadline', 'Deadline:')}</span>
                  <span className={`font-semibold text-xs ${new Date(task.deadline) < new Date() && task.status !== 'completed' ? 'text-destructive' : ''}`}>
                    <CalendarDays size={12} className="inline mr-1" />
                    {new Date(task.deadline).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {/* Assignee */}
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="text-muted-foreground">{t('tasks:detail.assignee', 'Assignee:')}</span>
                <span className="font-semibold text-primary">
                  {task.assignee_id ? `@${task.assignee_id}` : t('tasks:detail.unassigned', 'Unassigned')}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="text-muted-foreground">{t('tasks:detail.total_assets', 'Total Assets:')}</span>
                <span className="font-bold">{task.image_count || 0}{t('tasks:detail.files_suffix', ' files')}</span>
              </div>

              {/* Description */}
              {task.description && (
                <div className="pt-1">
                  <span className="text-xs text-muted-foreground font-medium block mb-1">
                    {t('tasks:detail.description', 'Description:')}
                  </span>
                  <p className="text-xs text-card-foreground/80 leading-relaxed bg-muted/50 rounded-lg p-2.5">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Rejection Note */}
              {task.status?.toLowerCase() === "rejected" && task.rejection_note && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-destructive">
                    <MessageSquareX size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {t('tasks:detail.rejection_reason', 'Rejection Reason')}
                    </span>
                  </div>
                  <p className="text-xs text-card-foreground/80 leading-relaxed">
                    {task.rejection_note}
                  </p>
                </div>
              )}
            </div>

            {/* Admin Atama Değiştirme Butonu */}
            <Guard permission="task:reassign">
              <Button 
                onClick={() => onSetIsAssignModalOpen(true)}
                variant="outline" 
                className="w-full h-9 text-xs gap-2 font-medium"
              >
                <UserPlus size={14} /> {t('tasks:detail.reassign_button', 'Reassign Task')}
              </Button>
            </Guard>
          </div>

          {/* İş Akışı Durum Değiştirme Paneli */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm tracking-wide text-muted-foreground uppercase">{t('tasks:detail.workflow_section', 'Workflow Actions')}</h3>
            
            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t('tasks:detail.note_label', 'Process Note (Optional)')}</label>
              <Input 
                placeholder={t('tasks:detail.note_placeholder', 'Write a note for validation...')} 
                value={note}
                onChange={(e) => onSetNote(e.target.value)}
                className="h-9 bg-muted border-border text-xs"
              />
            </div>

            <div className="grid gap-2">
              {/* Annotator Rolü için Gönderme Mekanizması */}
              {task.status?.toLowerCase() === "in_progress" && (
                <Button 
                  disabled={isSubmitting}
                  onClick={() => onUpdateStatus("approval_pending")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-9 gap-1.5"
                >
                  <Send size={14} /> {t('tasks:detail.submit_for_approval', 'Submit for Approval')}
                </Button>
              )}

              {/* Admin Rolü için Onay/Red Mekanizmaları */}
              <Guard permission="task:approve-reject">
                {task.status?.toLowerCase() === "approval_pending" && (
                  <div className="flex gap-2">
                    <Button 
                      disabled={isSubmitting}
                      onClick={() => onUpdateStatus("completed")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 gap-1.5"
                    >
                      <CheckCircle2 size={14} /> {t('tasks:detail.approve', 'Approve')}
                    </Button>
                    <Button 
                      disabled={isSubmitting}
                      onClick={() => onUpdateStatus("rejected")}
                      variant="destructive"
                      className="flex-1 font-medium text-xs h-9 gap-1.5"
                    >
                      <XCircle size={14} /> {t('tasks:detail.reject', 'Reject')}
                    </Button>
                  </div>
                )}
              </Guard>

              {/* Reset mekanizması */}
              {(["completed", "rejected", "assigned"] as string[]).includes(task.status?.toLowerCase() ?? "") && (
                <Button 
                  disabled={isSubmitting}
                  onClick={() => onUpdateStatus("in_progress")}
                  variant="outline"
                  className="w-full text-xs h-9"
                >
                  <Clock size={14} className="mr-1.5" /> {t('tasks:detail.start_reopen', 'Start / Re-open Task')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel: Atanan Görseller / Asset Listesi (Shadcn Table) */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-muted-foreground" />
              <h3 className="font-bold text-sm tracking-wide text-muted-foreground uppercase">{t('tasks:detail.assets_section', 'Assigned Assets')}</h3>
              {images.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                  {t('tasks:detail.page_info', 'Page {{page}}', { page: currentPage })}
                </span>
              )}
            </div>
            
            {/* Yeni Asset Ekleme Butonu */}
            <Guard permission="task:add-asset">
              {(["assigned", "in_progress"].includes(task.status?.toLowerCase() ?? "")) && (
                <Button 
                  onClick={() => onSetIsAddAssetModalOpen(true)}
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-medium gap-1"
                >
                  <Plus size={14} /> {t('tasks:detail.add_asset_button', 'Add Asset')}
                </Button>
              )}
            </Guard>
          </div>

          {/* Görsel Listesi — Shadcn Table + ContextMenu sağ tık, sol tık direkt yönlendirme */}
          {imagesLoading && images.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-xs">{t('tasks:detail.loading_images', 'Loading images...')}</span>
            </div>
          ) : imagesError ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
              <AlertCircle size={20} />
              <p className="text-xs">{imagesError}</p>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onRefreshImages(null, false)}>
                {t('tasks:detail.retry', 'Retry')}
              </Button>
            </div>
          ) : images.length > 0 ? (
            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] text-xs">{t('tasks:table.type', 'Type')}</TableHead>
                    <TableHead className="text-xs">{t('tasks:table.filename', 'Filename')}</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs">{t('tasks:table.mime_type', 'MIME Type')}</TableHead>
                    <TableHead className="text-xs">{t('tasks:table.status', 'Status')}</TableHead>
                    <TableHead className="hidden md:table-cell text-xs">{t('tasks:table.embedding', 'Embedding')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.map((img) => (
                                        <ContextMenu key={img.image_id}>
                      <ContextMenuTrigger asChild>
                        <TableRow
                          onClick={() => handleAssetClick(img.image_id)}
                          className="cursor-pointer [&:has([role=menuitem])]:bg-muted/50"
                        >
                          <TableCell className="py-2.5">
                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                              {img.mime_type?.startsWith('image/') ? (
                                <FileImage size={14} />
                              ) : (
                                <FileText size={14} />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 font-medium max-w-[180px] truncate">
                            <span className="text-sm">{img.filename || t('tasks:detail.untitled', 'Untitled')}</span>
                            <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                              {img.image_id}
                            </p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell py-2.5 text-xs text-muted-foreground">
                            {img.mime_type || '—'}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              img.status === 'UPLOADED' || img.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : img.status === 'PENDING'
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                  : img.status === 'FAILED' || img.status === 'VERIFICATION_FAILED'
                                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                                    : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {img.status || 'UNKNOWN'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-2.5">
                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              img.embedding_status === 'UPLOADED'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {img.embedding_status || '—'}
                            </span>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>

                      <ContextMenuContent className="w-56 rounded-xl">
                        <ContextMenuItem onClick={() => handleOpenInAnnotator(img.image_id)} className="cursor-pointer gap-2 text-xs font-medium">
                          <PenLine size={14} />
                          {t('tasks:detail.open_annotator', 'Open in Annotator')}
                          <ContextMenuShortcut>Annotator</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleOpenInViewer(img.image_id)} className="cursor-pointer gap-2 text-xs font-medium">
                          <ExternalLink size={14} />
                          {t('tasks:detail.open_viewer', 'Open in Viewer')}
                          <ContextMenuShortcut>Read-only</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => handleCopyAssetId(img.image_id)} className="cursor-pointer gap-2 text-xs font-medium">
                          <Copy size={14} />
                          {t('tasks:detail.copy_asset_id', 'Copy Asset ID')}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>

              {/* Sayfalama Butonları */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <span className="text-[11px] text-muted-foreground">
                  {images.length} {t('tasks:table.items', 'items')}
                  {!imagesLoading && !hasNext && currentPage > 0 && ` · ${t('tasks:table.last_page', 'last page')}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev || imagesLoading}
                    onClick={goPrev}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground min-w-[40px] text-center tabular-nums">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNext || imagesLoading}
                    onClick={goNext}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <ImageIcon size={24} className="opacity-40" />
              <p className="text-xs">{t('tasks:detail.no_assets', 'No assets bound to this task yet.')}</p>
            </div>
          )}
        </div>

      </div>

      {/* ================= REASSIGN USER MODAL ================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t('tasks:modal.reassign_title', 'Reassign Task Assignee')}</h3>
            </div>
            <form onSubmit={onReassignTask} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('tasks:modal.reassign_username_label', 'Target Username')}</label>
                <Input 
                  required
                  disabled={isSubmitting}
                  placeholder={t('tasks:modal.reassign_username_placeholder', 'e.g. janesmith (Must be annotator role)')}
                  value={newAssignee}
                  onChange={(e) => onSetNewAssignee(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onSetIsAssignModalOpen(false)}>{t('common:actions.cancel', 'Cancel')}</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSubmitting ? t('tasks:modal.assigning', 'Assigning...') : t('tasks:modal.assign', 'Assign')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD ASSET MODAL ================= */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t('tasks:modal.add_asset_title', 'Add New Asset to Task')}</h3>
            </div>
            <form onSubmit={onAddAsset} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('tasks:modal.asset_id_label', 'Asset UUID / ID')}</label>
                <Input 
                  required
                  disabled={isSubmitting}
                  placeholder={t('tasks:modal.asset_id_placeholder', 'Enter unassigned asset string ID')}
                  value={newAssetId}
                  onChange={(e) => onSetNewAssetId(e.target.value)}
                  className="bg-background text-sm"
                />
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg mt-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{t('tasks:modal.asset_warning', 'System checks if this asset is already linked to another task.')}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onSetIsAddAssetModalOpen(false)}>{t('common:actions.cancel', 'Cancel')}</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSubmitting ? t('tasks:modal.adding', 'Adding...') : t('tasks:modal.add', 'Add Asset')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TasksDetailPage;