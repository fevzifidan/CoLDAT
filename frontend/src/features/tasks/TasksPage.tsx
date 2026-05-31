import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, X, Plus, Loader2, AlertCircle } from "lucide-react";

// Bileşen ve Servis Entegrasyonları
import { TaskCard } from '@/features/tasks/components/TaskCard';
import TasksDetailPage from './TasksDetailPage';
import { taskService } from '@/features/tasks/services/taskService';

// Backend TaskSerializer şemasına tam uyumlu tip tanımı
interface TaskItem {
  id: string;
  dataset_id: string;
  project_id: string;
  assignee_id?: string | null;
  assignee_username?: string | null;
  created_by_id: string;
  created_by_username: string;
  status: string;
  note?: string;
  image_count: number;
  created_at: string;
  updated_at: string;
}

const TasksPage = () => {
  const { t } = useTranslation(['tasks', 'common']);
  
  // --- API STATE YÖNETİMİ ---
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- UI VE FİLTRE STATE'LERİ ---
  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(4);

  // --- MODAL VE DETAY STATE'LERİ ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // --- TASK CREATE PAYLOAD STATE'LERİ (TaskCreateSerializer Uyumu) ---
  const [formData, setFormData] = useState({
    dataset_id: '',
    assignee_id: '',
    image_ids_raw: '', // Kullanıcı arayüzde virgülle ayırıp girebilsin diye düz metin tutuyoruz
    note: ''
  });

  // --- DATA FETCHING (GET /tasks/) ---
// --- DATA FETCHING (GET /tasks/) ---
const fetchTasks = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const data = await taskService.getTasks();
    
    // 💡 EĞER backend pagination kullanıyorsa veriler 'results' içindedir.
    // Her iki ihtimali de (sayfalamalı veya sayfalamasız) koruma altına alıyoruz:
    if (data && Array.isArray(data)) {
      setTasks(data);
    } else if (data && data.results && Array.isArray(data.results)) {
      setTasks(data.results);
    } else {
      setTasks([]);
    }
  } catch (err: any) {
    console.error("Error loading tasks:", err);
    setError(err?.response?.data?.message || "Failed to fetch tasks from server.");
  } finally {
    setIsLoading(false);
  }
};

  // Sayfa ilk açıldığında verileri getir
  useEffect(() => {
    fetchTasks();
  }, []);

  // --- API EVENT HANDLERS (POST /tasks/) ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // UUID dizisini temizleyip dizi formatına getiriyoruz
    const imageIdsArray = formData.image_ids_raw
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (!formData.dataset_id.trim() || !formData.assignee_id.trim() || imageIdsArray.length === 0) {
      alert("Dataset ID, Assignee ID and at least one Image ID are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // TaskCreateSerializer şemasının tam olarak beklediği nesne yapısı
      const payload = {
        dataset_id: formData.dataset_id.trim(),
        assignee_id: formData.assignee_id.trim(),
        image_ids: imageIdsArray,
        note: formData.note.trim() || undefined
      };
      
      await taskService.createTask(payload);
      
      // Formu sıfırla ve modalı kapat
      setFormData({ dataset_id: '', assignee_id: '', image_ids_raw: '', note: '' });
      setIsCreateModalOpen(false);
      
      // Listeyi tazelemek için backend'den tekrar çekiyoruz
      await fetchTasks();
    } catch (err: any) {
      console.error("Error payload structure details:", err?.response?.data);
      alert(JSON.stringify(err?.response?.data) || "Task creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- API EVENT HANDLERS (DELETE /tasks/{id}/) ---
  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Kart tıklama tetiklenmesin diye durduruyoruz
    if (!window.confirm("Are you sure you want to revoke/delete this task?")) return;

    try {
      await taskService.deleteTask(id);
      // Başarılı silme sonrası arayüzü local filtreleme ile hızlıca güncelle
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete task.");
    }
  };

  // --- GÖREV DETAYDAN GERİ DÖNÜŞ PANELİ ---
  if (selectedTaskId) {
    return (
      <TasksDetailPage 
        taskId={selectedTaskId} 
        onBack={() => {
          setSelectedTaskId(null);
          fetchTasks(); // Detay sayfasındaki değişiklikleri yansıtmak için listeyi yeniliyoruz
        }} 
      />
    );
  }

  // --- CLIENT-SIDE FILTERS ---
  const filteredTasks = tasks.filter(task => {
    // Backend verisinde 'name' alanı olmadığı için arama kriterini id, dataset_id veya kullanıcı adına eşliyoruz
    const searchTarget = `${task.id} ${task.dataset_id} ${task.assignee_username || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
    
    // API'den gelen statüleri normalize ediyoruz (örn: OPEN, COMPLETED)
    const taskStatus = task.status?.toUpperCase().replace(/_/g, ' ');
    const matchesProgress = progressFilter === "ALL" || taskStatus === progressFilter;
    
    return matchesSearch && matchesProgress;
  });

  const visibleTasks = filteredTasks.slice(0, displayLimit);

  return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      
      {/* Üst Yönetim Alanı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-border">
        <h1 className="text-2xl font-extrabold text-foreground">
          {t('tasks:title', 'Tasks Workspace')}
        </h1>
        
                <div className="flex flex-wrap items-center gap-3">
          {/* Arama Kutusu */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("tasks:search_placeholder", "Search by ID, Dataset or Assignee...")} 
              className="pl-9 h-9 bg-card border-border" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Yeni Görev Oluştur Butonu */}
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 h-9 font-medium shadow-sm gap-1.5 text-primary-foreground"
          >
            <Plus size={16} />
                        {t('tasks:create_new', 'Create New Task')}
          </Button>

          {/* Statü Filtresi */}
          <div>
            <select
              value={progressFilter}
              onChange={(e) => {
                setProgressFilter(e.target.value);
                setDisplayLimit(4);
              }}
              className="flex h-9 w-44 rounded-md border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer text-muted-foreground font-medium focus:outline-none"
            >
                            <option value="ALL">✨ {t('tasks:filter.all_progress', 'All Statuses')}</option>
              <option value="OPEN">🆕 {t('tasks:filter.status.open', 'OPEN')}</option>
              <option value="IN PROGRESS">⚡ {t('tasks:filter.status.in_progress', 'IN PROGRESS')}</option>
              <option value="APPROVAL PENDING">⏳ {t('tasks:filter.status.pending', 'PENDING')}</option>
              <option value="APPROVED">✅ {t('tasks:filter.status.approved', 'APPROVED')}</option>
              <option value="REJECTED">❌ {t('tasks:filter.status.rejected', 'REJECTED')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- ASENKRON DURUM KONTROLLERİ --- */}
      {isLoading ? (
        <div className="h-48 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium">{t('tasks:loading', 'Fetching active workspace tasks...')}</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center space-y-2 max-w-md mx-auto">
          <AlertCircle size={24} className="mx-auto text-destructive" />
          <p className="text-xs text-destructive font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchTasks} className="text-xs h-8">{t('tasks:error_try_again', 'Try Again')}</Button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
          {t('tasks:empty_list', 'No tasks match your filter criteria or data repository is empty.')}
        </div>
      ) : (
        /* Görev Kartları Grid Yapısı */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleTasks.map(item => (
            <div key={item.id} className="relative group transition-transform hover:scale-[1.01]">
              <TaskCard 
                task={{
                  ...item,
                  // Serializer'da 'name' alanı bulunmadığı için ID'den benzersiz kısa bir maskeleme üretiyoruz
                  name: `Task #${item.id.slice(0, 8)}`,
                  // TaskSerializer'dan doğrudan dönen image_count yapısını bağlıyoruz
                  count: item.image_count || 0
                }} 
                onViewDetail={(id) => setSelectedTaskId(id)} 
              />
              
                            {/* Kart Üstü Hızlı Silme / Revoke Aksiyonu */}
              <button
                onClick={(e) => handleDeleteTask(item.id, e)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 border border-destructive/20 shadow-sm z-10"
                title={t('tasks:detail.revoke_button', 'Revoke Task')}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Daha Fazla Yükle Butonu */}
      {!isLoading && displayLimit < filteredTasks.length && (
        <div className="flex justify-center mt-8">
                    <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline">
            {t('tasks:show_more', 'Load More')} 
          </Button>
        </div>
      )}

      {/* ================= CREATE TASK MODAL (TaskCreateSerializer Uyumlu) ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
              <h3 className="font-bold text-lg text-foreground">{t('tasks:modal.create_title', 'Create New Task')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="p-4 space-y-4 text-sm">
                
                {/* Dataset ID Field */}
                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('tasks:modal.dataset_id_label', 'Dataset UUID *')}
                  </label>
                  <Input
                    required
                    disabled={isSubmitting}
                    value={formData.dataset_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataset_id: e.target.value }))}
                    placeholder={t('tasks:modal.dataset_id_placeholder', "e.g. 123e4567-e88b-12d3-a456-426614174000")}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Assignee ID Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('tasks:modal.assignee_id_label', 'Assignee User UUID *')}
                  </label>
                  <Input
                    required
                    disabled={isSubmitting}
                    value={formData.assignee_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignee_id: e.target.value }))}
                    placeholder={t('tasks:modal.assignee_id_placeholder', "e.g. 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Image IDs Dizi Giriş Alanı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('tasks:modal.image_ids_label', 'Image UUIDs (Comma separated) *')}
                  </label>
                  <Input
                    required
                    disabled={isSubmitting}
                    value={formData.image_ids_raw}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_ids_raw: e.target.value }))}
                    placeholder={t('tasks:modal.image_ids_placeholder', 'id1, id2, id3...')}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Opsiyonel Not Alanı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('tasks:modal.note_label', 'Task Note (Optional)')}
                  </label>
                  <Input
                    disabled={isSubmitting}
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder={t('tasks:modal.note_placeholder', 'Add batch context instructions...')}
                    className="bg-background border-border text-foreground"
                  />
                </div>

              </div>

              <div className="p-3 border-t border-border bg-muted flex justify-end gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  {t('common:actions.cancel', 'Cancel')}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSubmitting ? t('tasks:modal.creating', 'Creating...') : t('tasks:modal.create', 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TasksPage;