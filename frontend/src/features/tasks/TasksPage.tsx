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
  const { t } = useTranslation(['pages', 'common']);
  
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative text-slate-900 dark:text-slate-100">
      
      {/* Üst Yönetim Alanı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('pages:tasks.title', 'Tasks Workspace')}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Arama Kutusu */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              placeholder={t("pages:tasks.search_placeholder", "Search by ID, Dataset or Assignee...")} 
              className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Yeni Görev Oluştur Butonu */}
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 h-9 font-medium shadow-sm gap-1.5 text-white"
          >
            <Plus size={16} />
            {t('pages:tasks.create_new', 'Create New Task')}
          </Button>

          {/* Statü Filtresi */}
          <div>
            <select
              value={progressFilter}
              onChange={(e) => {
                setProgressFilter(e.target.value);
                setDisplayLimit(4);
              }}
              className="flex h-9 w-44 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="ALL">✨ {t('pages:tasks.filter.all_progress', 'All Progress')}</option>
              <option value="OPEN">🆕 {t('pages:tasks.filter.status.open', 'OPEN')}</option>
              <option value="IN PROGRESS">⚡ {t('pages:tasks.filter.status.in_progress', 'IN PROGRESS')}</option>
              <option value="APPROVAL PENDING">⏳ {t('pages:tasks.filter.status.pending', 'PENDING')}</option>
              <option value="APPROVED">✅ {t('pages:tasks.filter.status.approved', 'APPROVED')}</option>
              <option value="REJECTED">❌ REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- ASENKRON DURUM KONTROLLERİ --- */}
      {isLoading ? (
        <div className="h-48 w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
          <p className="text-xs font-medium">Fetching active workspace tasks...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 dark:bg-rose-950/10 dark:border-rose-900/40 text-center space-y-2 max-w-md mx-auto">
          <AlertCircle size={24} className="mx-auto text-rose-500" />
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchTasks} className="text-xs h-8">Try Again</Button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed dark:border-slate-800 rounded-xl text-slate-400 text-xs">
          No tasks match your filter criteria or data repository is empty.
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
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 shadow-sm z-10"
                title={t('pages:trash.permanent_delete', 'Delete')}
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
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="dark:border-slate-800 dark:bg-slate-950">
            {t('pages:dashboard.show_more', 'Load More')} 
          </Button>
        </div>
      )}

      {/* ================= CREATE TASK MODAL (TaskCreateSerializer Uyumlu) ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('pages:tasks.create_new', 'Create New Task')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="p-4 space-y-4 text-sm">
                
                {/* Dataset ID Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Dataset UUID *
                  </label>
                  <Input
                    required
                    disabled={isSubmitting}
                    value={formData.dataset_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataset_id: e.target.value }))}
                    placeholder="e.g. 123e4567-e88b-12d3-a456-426614174000"
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Assignee ID Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Assignee User UUID *
                  </label>
                  <Input
                    required
                    disabled={isSubmitting}
                    value={formData.assignee_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignee_id: e.target.value }))}
                    placeholder="e.g. 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Image IDs Dizi Giriş Alanı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Image UUIDs (Comma separated) *
                  </label>
                  <Input
                    required
                    disabled={isSubmitting}
                    value={formData.image_ids_raw}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_ids_raw: e.target.value }))}
                    placeholder="id1, id2, id3..."
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Opsiyonel Not Alanı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Task Note (Optional)
                  </label>
                  <Input
                    disabled={isSubmitting}
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Add batch context instructions..."
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

              </div>

              <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  {t('pages:actions.cancel', 'Cancel')}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {isSubmitting ? "Creating..." : t('pages:actions.create', 'Create')}
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