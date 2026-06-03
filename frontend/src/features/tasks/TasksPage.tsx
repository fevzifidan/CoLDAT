import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Plus, Loader2, AlertCircle, Layers, CircleDot, Play, Clock, CheckCircle2, XCircle } from "lucide-react";
import { SelectFilter, type SelectFilterOption } from '@/shared/components/SelectFilter';

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
  role?: string;
}

const TasksPage = () => {
  const { t } = useTranslation(['tasks', 'common']);
  const navigate = useNavigate();
  
  // --- API STATE YÖNETİMİ ---
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- UI VE FİLTRE STATE'LERİ ---
  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(4);

  // --- DETAY STATE'İ ---
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

// --- DATA FETCHING (GET /tasks/) ---
// API spec: { data: Task[], next_cursor: string | null }
const fetchTasks = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const data = await taskService.getTasks();
    
    // API spec response format: { data: Task[], next_cursor: string | null }
    if (data && Array.isArray(data)) {
      setTasks(data);
    } else if (data && data.data && Array.isArray(data.data)) {
      setTasks(data.data);
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
    
        // API'den gelen statüler (lowercase: assigned, in_progress, submitted, approved, rejected)
        const taskStatus = task.status?.toLowerCase() ?? "";
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

                    {/* Yeni Görev Oluştur Butonu - CreateTaskPage sayfasına yönlendirir */}
          <Button 
            onClick={() => navigate('/tasks/new')}
            className="bg-primary hover:bg-primary/90 h-9 font-medium shadow-sm gap-1.5 text-primary-foreground"
          >
            <Plus size={16} />
                        {t('tasks:create_new', 'Create New Task')}
          </Button>

                                        {/* Statü Filtresi */}
                                        <SelectFilter
                      value={progressFilter}
                      onChange={(v) => {
                        setProgressFilter(v);
                        setDisplayLimit(4);
                      }}
                      triggerClassName="w-44"
                      options={[
                        { value: 'ALL', label: t('tasks:filter.all_progress', 'All Statuses'), icon: <Layers className="h-3.5 w-3.5" /> },
                        { value: 'assigned', label: t('tasks:filter.status.assigned', 'ASSIGNED'), icon: <CircleDot className="h-3.5 w-3.5" /> },
                        { value: 'in_progress', label: t('tasks:filter.status.in_progress', 'IN PROGRESS'), icon: <Play className="h-3.5 w-3.5" /> },
                        { value: 'submitted', label: t('tasks:filter.status.submitted', 'SUBMITTED'), icon: <Clock className="h-3.5 w-3.5" /> },
                        { value: 'approved', label: t('tasks:filter.status.approved', 'APPROVED'), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                        { value: 'rejected', label: t('tasks:filter.status.rejected', 'REJECTED'), icon: <XCircle className="h-3.5 w-3.5" /> },
                      ]}
                    />
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
                onAnnotate={(id) => navigate(`/annotate/${id}`)}
                onView={(id) => navigate(`/view/${id}`)}
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

          </div>
  );
};

export default TasksPage;