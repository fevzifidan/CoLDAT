import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Loader2
} from "lucide-react";

// taskService bağımlılığını ekliyoruz
import { taskService } from '@/features/tasks/services/taskService';

interface TasksDetailPageProps {
  taskId: string;
  onBack?: () => void;
}

// Backend'den dönecek nesnenin iç yapısı için esnek interface
interface TaskDetailData {
  id: string;
  name: string;
  dataset_id: string;
  dataset_name?: string;
  assignee_id?: string;
  assignee_username?: string;
  status: string;
  total_assets: number;
  role?: string; // Giriş yapan kullanıcının rolü ('admin' vb.)
  images: Array<{ id: string; name: string; status: string }>;
}


const TasksDetailPage = ({ taskId, onBack }: TasksDetailPageProps) => {
  const { t } = useTranslation(['tasks', 'common']);
  
  // --- STATE YÖNETİMİ ---
  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Buton kitleme kontrolü
  
  // Modal ve Form State'leri
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [newAssignee, setNewAssignee] = useState<string>("");
  
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState<boolean>(false);
  const [newAssetId, setNewAssetId] = useState<string>("");

  const [note, setNote] = useState<string>("");

  // --- DATA FETCHING (GET /tasks/{taskId}) ---
  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskService.getTaskById(taskId);
      
      // Backend rol verisini göndermiyorsa, admin kontrolü için fallback ekleyebilirsiniz
      setTask({
        ...data,
        role: data.role || "admin" // UI üzerindeki admin butonlarını test edebilmeniz için default admin bırakılmıştır
      });
    } catch (err: any) {
      console.error("Error fetching task details:", err);
      setError(err?.response?.data?.message || "Failed to load task details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde veya taskId değiştiğinde tetikle
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
      
      // Local state'i API'den gelen veriye göre ya da manuel senkronize et optimistik güncelleme:
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
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
      
      // Listeyi güncel tutmak için veriyi yeniden çekebiliriz veya state'e ekleyebiliriz
      await fetchTaskDetails(); 
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
    if (window.confirm(t('tasks:detail.confirm_delete', "Are you sure you want to revoke/delete this task assignment?"))) {
      try {
        setIsSubmitting(true);
        await taskService.deleteTask(taskId);
        if (onBack) onBack();
      } catch (err: any) {
        alert(err?.response?.data?.message || t('tasks:detail.delete_failed', 'Failed to delete task.'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

    // Badge renk dinamikleri
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN": return "bg-primary/10 text-primary border-primary/20";
      case "IN_PROGRESS": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "APPROVAL_PENDING": return "bg-muted text-muted-foreground border-border";
      case "APPROVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
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

  const isAdmin = task.role === "admin";

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
              <h1 className="text-2xl font-extrabold text-foreground">{task.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(task.status)}`}>
                {task.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('tasks:detail.dataset_id', 'Dataset ID:')} {task.dataset_id}</p>
          </div>
        </div>

        {/* Yönetici Hızlı Aksiyonları */}
        {isAdmin && (
          <Button 
            variant="outline" 
            disabled={isSubmitting}
            onClick={handleDeleteTask}
            className="h-9 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 gap-1.5 text-xs font-bold"
          >
                        <Trash2 size={14} />
            {t('tasks:detail.revoke_button', 'Revoke Task')}
          </Button>
        )}
      </div>

      {/* İki Sütunlu Grid Detay Alanı */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Sol Panel: Meta Bilgiler & İş Akışı Yönetimi */}
        <div className="md:col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm tracking-wide text-muted-foreground uppercase">{t('tasks:detail.info_section', 'Task Information')}</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="text-muted-foreground">{t('tasks:detail.assignee', 'Assignee:')}</span>
                <span className="font-semibold text-primary">
                  {task.assignee_username ? `@${task.assignee_username}` : t('tasks:detail.unassigned', 'Unassigned')}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="text-muted-foreground">{t('tasks:detail.total_assets', 'Total Assets:')}</span>
                <span className="font-bold">{task.total_assets}{t('tasks:detail.files_suffix', ' files')}</span>
              </div>
            </div>

            {/* Admin Atama Değiştirme Butonu */}
            {isAdmin && (
              <Button 
                onClick={() => setIsAssignModalOpen(true)}
                variant="outline" 
                className="w-full h-9 text-xs gap-2 font-medium"
              >
                <UserPlus size={14} /> {t('tasks:detail.reassign_button', 'Reassign Task')}
              </Button>
            )}
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
                onChange={(e) => setNote(e.target.value)}
                className="h-9 bg-muted border-border text-xs"
              />
            </div>

            <div className="grid gap-2">
              {/* Annotator Rolü için Gönderme Mekanizması */}
              {task.status === "IN_PROGRESS" && (
                <Button 
                  disabled={isSubmitting}
                  onClick={() => handleUpdateStatus("APPROVAL_PENDING")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-9 gap-1.5"
                >
                  <Send size={14} /> {t('tasks:detail.submit_for_approval', 'Submit for Approval')}
                </Button>
              )}

              {/* Admin Rolü için Onay/Red Mekanizmaları */}
              {isAdmin && task.status === "APPROVAL_PENDING" && (
                <div className="flex gap-2">
                  <Button 
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus("APPROVED")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 gap-1.5"
                  >
                    <CheckCircle2 size={14} /> {t('tasks:detail.approve', 'Approve')}
                  </Button>
                  <Button 
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus("REJECTED")}
                    variant="destructive"
                    className="flex-1 font-medium text-xs h-9 gap-1.5"
                  >
                    <XCircle size={14} /> {t('tasks:detail.reject', 'Reject')}
                  </Button>
                </div>
              )}

              {/* Reset mekanizması */}
              {(task.status === "APPROVED" || task.status === "REJECTED" || task.status === "OPEN") && (
                <Button 
                  disabled={isSubmitting}
                  onClick={() => handleUpdateStatus("IN_PROGRESS")}
                  variant="outline"
                  className="w-full text-xs h-9"
                >
                  <Clock size={14} className="mr-1.5" /> {t('tasks:detail.start_reopen', 'Start / Re-open Task')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel: Atanan Görseller / Asset Listesi */}
                <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-muted-foreground" />
              <h3 className="font-bold text-sm tracking-wide text-muted-foreground uppercase">{t('tasks:detail.assets_section', 'Assigned Assets')}</h3>
            </div>
            
            {/* Yeni Asset Ekleme Butonu */}
            {isAdmin && (task.status === "OPEN" || task.status === "IN_PROGRESS") && (
              <Button 
                onClick={() => setIsAddAssetModalOpen(true)}
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-medium gap-1"
              >
                <Plus size={14} /> {t('tasks:detail.add_asset_button', 'Add Asset')}
              </Button>
            )}
          </div>

          {/* Görsel Listesi */}
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            {task.images && task.images.length > 0 ? (
              task.images.map((img) => (
                <div key={img.id} className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[200px] sm:max-w-xs">{img.name || t('tasks:detail.asset_image_default', 'Asset Image')}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{t('tasks:detail.asset_id_prefix', 'ID: ')}{img.id}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    img.status === 'labeled' || img.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {img.status === 'labeled' || img.status === 'COMPLETED' 
                      ? t('tasks:detail.asset_status_labeled', 'labeled')
                      : (img.status || t('tasks:detail.asset_status_unlabeled', 'unlabeled'))}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t('tasks:detail.no_assets', 'No assets bound to this task yet.')}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ================= REASSIGN USER MODAL ================= */}
            {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t('tasks:modal.reassign_title', 'Reassign Task Assignee')}</h3>
            </div>
            <form onSubmit={handleReassignTask} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('tasks:modal.reassign_username_label', 'Target Username')}</label>
                <Input 
                  required
                  disabled={isSubmitting}
                  placeholder={t('tasks:modal.reassign_username_placeholder', 'e.g. janesmith (Must be annotator role)')}
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>{t('common:actions.cancel', 'Cancel')}</Button>
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
            <form onSubmit={handleAddAsset} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('tasks:modal.asset_id_label', 'Asset UUID / ID')}</label>
                <Input 
                  required
                  disabled={isSubmitting}
                  placeholder={t('tasks:modal.asset_id_placeholder', 'Enter unassigned asset string ID')}
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="bg-background text-sm"
                />
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg mt-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{t('tasks:modal.asset_warning', 'System checks if this asset is already linked to another task.')}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAssetModalOpen(false)}>{t('common:actions.cancel', 'Cancel')}</Button>
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