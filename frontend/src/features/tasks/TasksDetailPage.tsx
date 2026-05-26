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
  const { t } = useTranslation(['pages', 'common']);
  
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
      alert(err?.response?.data?.message || "Status update failed.");
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
      alert(err?.response?.data?.message || "Reassignment failed.");
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
      alert(err?.response?.data?.message || "Adding asset failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- API EVENT HANDLERS (DELETE /tasks/{taskId}) ---
  const handleDeleteTask = async () => {
    if (!task) return;
    if (window.confirm("Are you sure you want to revoke/delete this task assignment?")) {
      try {
        setIsSubmitting(true);
        await taskService.deleteTask(taskId);
        if (onBack) onBack();
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to delete task.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Badge renk dinamikleri
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN": return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200";
      case "IN_PROGRESS": return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200";
      case "APPROVAL_PENDING": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200";
      case "APPROVED": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200";
      case "REJECTED": return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // --- KORUMA VE YÜKLENİYOR EKRANLARI ---
  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading task details from server...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4 max-w-md mx-auto text-center">
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg">An Error Occurred</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error || "Task not found."}</p>
        </div>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft size={16} /> Back to Tasks Workspace
        </Button>
      </div>
    );
  }

  const isAdmin = task.role === "admin";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      
      {/* Üst Bar / Geri Dönüş ve Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9 border-slate-200 dark:border-slate-800">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{task.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(task.status)}`}>
                {task.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dataset ID: {task.dataset_id}</p>
          </div>
        </div>

        {/* Yönetici Hızlı Aksiyonları */}
        {isAdmin && (
          <Button 
            variant="outline" 
            disabled={isSubmitting}
            onClick={handleDeleteTask}
            className="h-9 border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 gap-1.5 text-xs font-bold"
          >
            <Trash2 size={14} />
            Revoke Task
          </Button>
        )}
      </div>

      {/* İki Sütunlu Grid Detay Alanı */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Sol Panel: Meta Bilgiler & İş Akışı Yönetimi */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm tracking-wide text-slate-400 uppercase">Task Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 dark:border-slate-900">
                <span className="text-slate-500">Assignee:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {task.assignee_username ? `@${task.assignee_username}` : "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-900">
                <span className="text-slate-500">Total Assets:</span>
                <span className="font-bold">{task.total_assets} files</span>
              </div>
            </div>

            {/* Admin Atama Değiştirme Butonu */}
            {isAdmin && (
              <Button 
                onClick={() => setIsAssignModalOpen(true)}
                variant="outline" 
                className="w-full h-9 text-xs gap-2 font-medium border-slate-200 dark:border-slate-800"
              >
                <UserPlus size={14} /> Reassign Task
              </Button>
            )}
          </div>

          {/* İş Akışı Durum Değiştirme Paneli */}
          <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm tracking-wide text-slate-400 uppercase">Workflow Actions</h3>
            
            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Process Note (Optional)</label>
              <Input 
                placeholder="Write a note for validation..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div className="grid gap-2">
              {/* Annotator Rolü için Gönderme Mekanizması */}
              {task.status === "IN_PROGRESS" && (
                <Button 
                  disabled={isSubmitting}
                  onClick={() => handleUpdateStatus("APPROVAL_PENDING")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 gap-1.5"
                >
                  <Send size={14} /> Submit for Approval
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
                    <CheckCircle2 size={14} /> Approve
                  </Button>
                  <Button 
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus("REJECTED")}
                    variant="destructive"
                    className="flex-1 font-medium text-xs h-9 gap-1.5"
                  >
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              )}

              {/* Reset mekanizması */}
              {(task.status === "APPROVED" || task.status === "REJECTED" || task.status === "OPEN") && (
                <Button 
                  disabled={isSubmitting}
                  onClick={() => handleUpdateStatus("IN_PROGRESS")}
                  variant="outline"
                  className="w-full text-xs h-9 dark:border-slate-800"
                >
                  <Clock size={14} className="mr-1.5" /> Start / Re-open Task
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel: Atanan Görseller / Asset Listesi */}
        <div className="md:col-span-2 bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-slate-400" />
              <h3 className="font-bold text-sm tracking-wide text-slate-400 uppercase">Assigned Assets</h3>
            </div>
            
            {/* Yeni Asset Ekleme Butonu */}
            {isAdmin && (task.status === "OPEN" || task.status === "IN_PROGRESS") && (
              <Button 
                onClick={() => setIsAddAssetModalOpen(true)}
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs font-medium gap-1"
              >
                <Plus size={14} /> Add Asset
              </Button>
            )}
          </div>

          {/* Görsel Listesi */}
          <div className="divide-y dark:divide-slate-900 border dark:border-slate-900 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            {task.images && task.images.length > 0 ? (
              task.images.map((img) => (
                <div key={img.id} className="flex items-center justify-between p-3 bg-slate-50/30 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <ImageIcon size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[200px] sm:max-w-xs">{img.name || `Asset Image`}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {img.id}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    img.status === 'labeled' || img.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                  }`}>
                    {img.status || 'unlabeled'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No assets bound to this task yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ================= REASSIGN USER MODAL ================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Reassign Task Assignee</h3>
            </div>
            <form onSubmit={handleReassignTask} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Target Username</label>
                <Input 
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. janesmith (Must be annotator role)"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="bg-white dark:bg-slate-950 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {isSubmitting ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD ASSET MODAL ================= */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Add New Asset to Task</h3>
            </div>
            <form onSubmit={handleAddAsset} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Asset UUID / ID</label>
                <Input 
                  required
                  disabled={isSubmitting}
                  placeholder="Enter unassigned asset string ID"
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="bg-white dark:bg-slate-950 text-sm"
                />
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg mt-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>System checks if this asset is already linked to another task.</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAssetModalOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {isSubmitting ? "Adding..." : "Add Asset"}
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