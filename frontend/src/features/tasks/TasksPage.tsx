import { useState } from 'react';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { projects as initialProjects } from '@/shared/utils/projectsData';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RotateCcw, X, Trash } from "lucide-react";

const TasksPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(4);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Görevlerin durum yönetimi state'i
  const [taskList, setTaskList] = useState(() =>
    initialProjects.map(p => ({ ...p, isDeleted: false, isPermanentlyDeleted: false }))
  );

  // 1. AKTİF GÖREVLER: Statüsü olan, silinmemiş ve kalıcı gizlenmemiş olanlar
  const activeTasks = taskList.filter(
    p => p.status && !p.isDeleted && !p.isPermanentlyDeleted
  );
  
  // 2. ÇÖPTEKİ GÖREVLER
  const archivedTasks = taskList.filter(
    p => p.status && p.isDeleted && !p.isPermanentlyDeleted
  );

  // Arama sorgusu + Progress filtrelemesi
  const filteredTasks = activeTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const taskStatus = task.status?.toUpperCase().replace(/_/g, ' ');
    const matchesProgress = progressFilter === "ALL" || taskStatus === progressFilter;

    return matchesSearch && matchesProgress;
  });

  const visibleTasks = filteredTasks.slice(0, displayLimit);

  // Aksiyonlar
  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, isDeleted: true } : t));
  };

  const handleRecoverTask = (id: string) => {
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, isDeleted: false } : t));
  };

  const handlePermanentDelete = (id: string) => {
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, isPermanentlyDeleted: true } : t));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">
          {t('tasks.title', 'Tasks')}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Arama Input */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t("search.placeholder", "Search...")} 
              className="pl-9 h-9 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Create New Task Butonu */}
          <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 font-medium shadow-sm">
            {t('tasks.create_new', 'Create New Task')}
          </Button>

          {/* Progress Filtresi */}
          <div>
            <select
              value={progressFilter}
              onChange={(e) => {
                setProgressFilter(e.target.value);
                setDisplayLimit(4);
              }}
              className="flex h-9 w-44 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-slate-700 font-medium"
            >
              <option value="ALL">✨ {t('filter.all_progress', 'All Progress')}</option>
              <option value="NEW">🆕 {t('filter.status.new', 'NEW')}</option>
              <option value="IN PROGRESS">⚡ {t('filter.status.in_progress', 'IN PROGRESS')}</option>
              <option value="COMPLETED">✅ {t('filter.status.completed', 'COMPLETED')}</option>
            </select>
          </div>

          {/* Trash Butonu */}
          <Button 
            variant="outline" 
            className="h-9 relative border-slate-300 hover:bg-slate-100 gap-2 font-medium"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-slate-600" />
            {archivedTasks.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedTasks.length}
              </span>
            )}
            {t('trash.title', 'Trash')}
          </Button>
        </div>
      </div>

      {/* Görev Kartları Grid Yapısı */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleTasks.map(item => (
          <div key={item.id} className="relative group transition-transform hover:scale-[1.01]">
            <ProjectCard project={item} cardType="task" />
            
            {/* Kart Hızlı Silme Butonu */}
            <button
              onClick={(e) => handleDeleteTask(item.id, e)}
              className="absolute bottom-4 right-4 p-2 rounded-lg bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 border border-rose-200 shadow-sm z-10"
              title="Move to Trash"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {displayLimit < filteredTasks.length && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline">
            {t('status.load_more', 'Load More')} 
          </Button>
        </div>
      )}

      {/* ================= TASKS TRASH MODAL ================= */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Trash2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-lg">{t('trash.modal_title', 'Trash Bin')}</h3>
              </div>
              <button onClick={() => setIsTrashOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200" />
                  <p className="text-sm">{t('trash.empty', 'Your trash is currently empty.')}</p>
                </div>
              ) : (
                archivedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{task.name}</h4>
                      <p className="text-xs text-slate-400 uppercase">Status: {task.status}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" variant="outline" onClick={() => handleRecoverTask(task.id)}
                        className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} /> {t('trash.recover', 'Recover')}
                      </Button>

                      <Button 
                        size="sm" variant="outline" onClick={() => handlePermanentDelete(task.id)}
                        className="h-8 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold gap-1.5"
                      >
                        <Trash2 size={13} /> {t('trash.permanent_delete', 'Delete')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="bg-slate-800 hover:bg-slate-900 text-xs font-medium">
                {t('actions.close', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;