import { useState } from 'react';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { projects as initialProjects } from '@/shared/utils/projectsData';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RotateCcw, X, Trash, Plus } from "lucide-react";

const TasksPage = () => {
  // Çoklu dil dosyası desteği için namespaces tanımlaması
  const { t } = useTranslation(['pages', 'common']);
  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(4);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // --- Yeni Görev Ekleme State'leri ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  // Görevlerin durum yönetimi state'i
  const [taskList, setTaskList] = useState(() =>
    initialProjects.map(p => ({ ...p, isDeleted: false, isPermanentlyDeleted: false }))
  );

  // 1. AKTİF GÖREVLER
  const activeTasks = taskList.filter(
    p => p.status && !p.isDeleted && !p.isPermanentlyDeleted
  );
  
  // 2. ÇÖPTEKİ GÖREVLER
  const archivedTasks = taskList.filter(
    p => p.status && p.isDeleted && !p.isPermanentlyDeleted
  );

  const filteredTasks = activeTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const taskStatus = task.status?.toUpperCase().replace(/_/g, ' ');
    const matchesProgress = progressFilter === "ALL" || taskStatus === progressFilter;
    return matchesSearch && matchesProgress;
  });

  const visibleTasks = filteredTasks.slice(0, displayLimit);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      status: "New" as const,
      isDeleted: false,
      isPermanentlyDeleted: false,
      task: "Annotation",
      count: 0,
      role: "annotator" as const,
      type: "project" as const,
    };

    setTaskList(prev => [newTask, ...prev]);
    setNewTaskName("");
    setIsCreateModalOpen(false);
  };

  const handleStatusChange = (id: string, currentStatus: "New" | "In Progress" | "Completed") => {
    let nextStatus: "New" | "In Progress" | "Completed" = "New";
    if (currentStatus === "New") nextStatus = "In Progress";
    else if (currentStatus === "In Progress") nextStatus = "Completed";
    else if (currentStatus === "Completed") nextStatus = "New";

    setTaskList(prev => 
      prev.map(task => task.id === id ? { ...task, status: nextStatus } : task)
    );
  };

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('pages:tasks.title', 'Tasks')}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Arama Input */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              placeholder={t("pages:tasks.search_placeholder", "Search tasks...")} 
              className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Create New Task Butonu */}
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 h-9 font-medium shadow-sm gap-1.5 text-white"
          >
            <Plus size={16} />
            {t('pages:tasks.create_new', 'Create New Task')}
          </Button>

          {/* Progress Filtresi */}
          <div>
            <select
              value={progressFilter}
              onChange={(e) => {
                setProgressFilter(e.target.value);
                setDisplayLimit(4);
              }}
              className="flex h-9 w-44 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">✨ {t('pages:tasks.filter.all_progress', 'All Progress')}</option>
              <option value="NEW">🆕 {t('pages:tasks.filter.status.new', 'NEW')}</option>
              <option value="IN PROGRESS">⚡ {t('pages:tasks.filter.status.in_progress', 'IN PROGRESS')}</option>
              <option value="COMPLETED">✅ {t('pages:tasks.filter.status.completed', 'COMPLETED')}</option>
            </select>
          </div>

          {/* Trash Butonu */}
          <Button 
            variant="outline" 
            className="h-9 relative border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 gap-2 font-medium"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            {archivedTasks.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedTasks.length}
              </span>
            )}
            {t('pages:trash.title', 'Trash')}
          </Button>
        </div>
      </div>

      {/* Görev Kartları Grid Yapısı */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleTasks.map(item => (
          <div key={item.id} className="relative group transition-transform hover:scale-[1.01]">
            <ProjectCard 
              project={item} 
              cardType="task" 
              onStatusChange={() => handleStatusChange(item.id, item.status)}
            />
            
            {/* Kart Hızlı Silme Butonu */}
            <button
              onClick={(e) => handleDeleteTask(item.id, e)}
              className="absolute bottom-4 right-4 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 shadow-sm z-10"
              title={t('pages:trash.permanent_delete', 'Delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {displayLimit < filteredTasks.length && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">
            {t('pages:dashboard.show_more', 'Load More')} 
          </Button>
        </div>
      )}

      {/* ================= CREATE TASK MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('pages:tasks.create_new', 'Create New Task')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('pages:project_general.project_name', 'Task Name')}
                  </label>
                  <Input
                    required
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder={t('pages:project_general.placeholder_name', 'E.g. Classify Dataset...')}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="dark:border-slate-800 dark:hover:bg-slate-800">
                  {t('pages:actions.cancel', 'Cancel')}
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
                  {t('pages:actions.create', 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TASKS TRASH MODAL ================= */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Trash2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-lg">{t('pages:trash.modal_title', 'Trash Bin')}</h3>
              </div>
              <button onClick={() => setIsTrashOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200 dark:text-slate-800" />
                  <p className="text-sm">{t('pages:tasks.empty_list', 'Your trash is currently empty.')}</p>
                </div>
              ) : (
                archivedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{task.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 uppercase">Status: {task.status}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" variant="outline" onClick={() => handleRecoverTask(task.id)}
                        className="h-8 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} /> {t('pages:trash.recover', 'Recover')}
                      </Button>

                      <Button 
                        size="sm" variant="outline" onClick={() => handlePermanentDelete(task.id)}
                        className="h-8 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold gap-1.5"
                      >
                        <Trash2 size={13} /> {t('pages:trash.permanent_delete', 'Delete')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium">
                {t('pages:actions.close', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;