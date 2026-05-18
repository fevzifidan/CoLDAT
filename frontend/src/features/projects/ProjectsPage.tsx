// src/features/projects/ProjectsPage.tsx
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RotateCcw, X, Trash, Plus } from "lucide-react";
import { ProjectCard } from './components/ProjectCard';
import { projects as initialProjects } from '@/shared/utils/projectsData';

const ProjectsPage = () => {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(4);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // --- Yeni Proje Ekleme State'leri ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Projelerin durum yönetimi state'i
  const [projectList, setProjectList] = useState(() =>
    initialProjects.map(p => ({ ...p, isDeleted: false, isPermanentlyDeleted: false }))
  );

  // 1. AKTİF PROJELER
  const activeProjects = projectList.filter(
    p => !p.isDeleted && !p.isPermanentlyDeleted
  );
  
  // 2. ÇÖPTEKİ PROJELER
  const archivedProjects = projectList.filter(
    p => p.isDeleted && !p.isPermanentlyDeleted
  );

  const filteredProjects = activeProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const projectRole = project.role?.toUpperCase();
    const matchesRole = roleFilter === "ALL" || projectRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const visibleProjects = filteredProjects.slice(0, displayLimit);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject = {
      id: `project-${Date.now()}`,
      name: newProjectName,
      status: "New" as const,
      isDeleted: false,
      isPermanentlyDeleted: false,
      task: "Project",
      count: 0,
      role: "admin" as const,
      type: "project" as const,
    };

    setProjectList(prev => [newProject, ...prev]);
    setNewProjectName("");
    setIsCreateModalOpen(false);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectList(prev => prev.map(t => t.id === id ? { ...t, isDeleted: true } : t));
  };

  const handleRecoverProject = (id: string) => {
    setProjectList(prev => prev.map(t => t.id === id ? { ...t, isDeleted: false } : t));
  };

  const handlePermanentDelete = (id: string) => {
    setProjectList(prev => prev.map(t => t.id === id ? { ...t, isPermanentlyDeleted: true } : t));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('projects.title', 'Projects')}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Arama Input */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              placeholder={t("search.placeholder", "Search...")} 
              className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Create New Project Butonu */}
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 h-9 font-medium shadow-sm gap-1.5 text-white"
          >
            <Plus size={16} />
            {t('projects.create_new', 'Create New Project')}
          </Button>

          {/* Role Filtresi */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setDisplayLimit(4);
              }}
              className="flex h-9 w-44 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">✨ {t('filter.all_roles', 'All Roles')}</option>
              <option value="ADMIN">🛡️ {t('filter.role.admin', 'ADMIN')}</option>
              <option value="ANNOTATOR">✏️ {t('filter.role.annotator', 'ANNOTATOR')}</option>
            </select>
          </div>

          {/* Trash Butonu */}
          <Button 
            variant="outline" 
            className="h-9 relative border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 gap-2 font-medium"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            {archivedProjects.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedProjects.length}
              </span>
            )}
            {t('trash.title', 'Trash')}
          </Button>
        </div>
      </div>

      {/* Proje Kartları Grid Yapısı */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProjects.map(item => (
          <div key={item.id} className="relative group transition-transform hover:scale-[1.01]">
            <ProjectCard project={item} cardType="project" />
            
            {/* Kart Hızlı Silme Butonu */}
            <button
              onClick={(e) => handleDeleteProject(item.id, e)}
              className="absolute bottom-4 right-4 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 shadow-sm z-10"
              title="Move to Trash"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {displayLimit < filteredProjects.length && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">
            {t('status.load_more', 'Load More')} 
          </Button>
        </div>
      )}

      {/* ================= CREATE PROJECT MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('projects.create_new', 'Create New Project')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('project_general.project_name', 'Project Name')}
                  </label>
                  <Input
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder={t('project_general.placeholder_name', 'E.g. Classify Dataset...')}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="dark:border-slate-800 dark:hover:bg-slate-800">
                  {t('actions.cancel', 'Cancel')}
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
                  {t('actions.create', 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PROJECTS TRASH MODAL ================= */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Trash2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-lg">{t('trash.modal_title', 'Trash Bin')}</h3>
              </div>
              <button onClick={() => setIsTrashOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200 dark:text-slate-800" />
                  <p className="text-sm">{t('trash.empty', 'Your trash is currently empty.')}</p>
                </div>
              ) : (
                archivedProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{project.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 uppercase">Role: {project.role}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" variant="outline" onClick={() => handleRecoverProject(project.id)}
                        className="h-8 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} /> {t('trash.recover', 'Recover')}
                      </Button>

                      <Button 
                        size="sm" variant="outline" onClick={() => handlePermanentDelete(project.id)}
                        className="h-8 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold gap-1.5"
                      >
                        <Trash2 size={13} /> {t('trash.permanent_delete', 'Delete')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium">
                {t('actions.close', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;