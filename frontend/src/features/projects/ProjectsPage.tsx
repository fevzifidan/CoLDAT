import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RotateCcw, X, Trash, Plus } from "lucide-react";
import { ProjectCard } from './components/ProjectCard';
import { projectService } from './services/projectService';
import { useNavigate } from 'react-router-dom'; // 1. Bunu ekledik

interface ExtendedProject {
  id: string;
  name: string;
  description?: string;
  project_type?: string;
  status?: string;
  count?: number;
  role?: string;
  created_at?: string;
  isDeleted?: boolean;
}

const ProjectsPage = () => {
  const { t } = useTranslation(['pages']);
  const navigate = useNavigate(); // 2. Bunu tanımladık
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [displayLimit, setDisplayLimit] = useState<number>(4);
  const [isTrashOpen, setIsTrashOpen] = useState<boolean>(false);

  const [projectList, setProjectList] = useState<ExtendedProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState("");

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await projectService.getAllProjects();
      
      const projectDataArray = response && Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response) ? response : []);

      const formatted = projectDataArray.map((p: any) => ({ 
        ...p, 
        isDeleted: p.isDeleted ?? false,
        role: p.role || "ADMIN" 
      }));

      setProjectList(formatted);
    } catch (err: any) {
      console.error("API error fetching projects:", err);
      setApiError(t('pages:errors.fetch_failed', 'Failed to load projects from backend server.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const activeProjects = projectList.filter(p => p.isDeleted === false || !p.isDeleted);
  const archivedProjects = projectList.filter(p => p.isDeleted === true);

  const filteredProjects = activeProjects.filter(project => {
    const projectName = project.name ? String(project.name) : "";
    const matchesSearch = projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const projectRole = (project.role || "ADMIN").toUpperCase();
    const matchesRole = roleFilter === "ALL" || projectRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const visibleProjects = filteredProjects.slice(0, displayLimit);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const payload = {
        name: newProjectName,
        description: "No description provided yet.",
        project_type: "object_detection",
      };

      await projectService.createProject(payload);
      setNewProjectName("");
      setIsCreateModalOpen(false);
      await fetchProjects();
    } catch (err) {
      console.error("Proje oluşturulurken hata:", err);
      alert("Project creation failed on backend.");
    }
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectList(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true } : p));
  };

  const handleRecoverProject = (id: string) => {
    setProjectList(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this project?")) return;
    try {
      await projectService.deleteProject(id);
      setProjectList(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to permanently delete the project from backend.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('pages:dashboard.sections.recent_projects', 'Recent Projects')}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              placeholder={t("pages:assets.search_placeholder", "Search...")} 
              className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 h-9 font-medium shadow-sm gap-1.5 text-white"
          >
            <Plus size={16} />
            {t('pages:dashboard.buttons.create_project', 'Create New Project')}
          </Button>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setDisplayLimit(4);
              }}
              className="flex h-9 w-44 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">✨ {t('pages:dashboard.roles.all_roles', 'All Roles')}</option>
              <option value="ADMIN">🛡️ {t('pages:dashboard.roles.admin', 'Admin')}</option>
              <option value="ANNOTATOR">✏️ {t('pages:dashboard.roles.annotator', 'Annotator')}</option>
              <option value="VIEWER">👁️ {t('pages:dashboard.roles.viewer', 'Viewer')}</option>
            </select>
          </div>

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
            {t('pages:trash.title', 'Trash')}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-24 text-indigo-600 dark:text-indigo-400 font-medium">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mr-3" />
          {t('pages:assets.loading', 'Loading data from backend...')}
        </div>
      )}

      {apiError && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 text-rose-700 dark:text-rose-400 text-sm text-center">
          {apiError}
          <Button variant="link" className="text-rose-700 dark:text-rose-400 underline ml-2" onClick={fetchProjects}>
            {t('pages:assets.retry', 'Retry')}
          </Button>
        </div>
      )}

      {!isLoading && !apiError && (
        <>
          {visibleProjects.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              {t('pages:dashboard.no_projects', 'No active projects found matching criteria.')}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProjects.map(item => (
                /* 3. BURASI GÜNCELLENDİ: Tıklayınca projenin datasetlerine yönlendiriyor */
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/projects/${item.id}/datasets`)} 
                  className="relative group transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  <ProjectCard project={item} cardType="project" />
                  
                  <button
                    onClick={(e) => handleDeleteProject(item.id, e)}
                    className="absolute bottom-4 right-4 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 shadow-sm z-10"
                    title={t('pages:trash.permanent_delete', 'Delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!isLoading && displayLimit < filteredProjects.length && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">
            {t('pages:dashboard.show_more', 'Show More')} 
          </Button>
        </div>
      )}

      {/* MODAL & TRASH kısımları aynı kalıyor */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('pages:dashboard.buttons.create_project', 'Create New Project')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('pages:project_general.project_name', 'Project Name')}
                  </label>
                  <Input
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder={t('pages:project_general.placeholder_name', 'E.g. Autonomous Driving Dataset...')}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="dark:border-slate-800 dark:hover:bg-slate-800">
                  {t('pages:assets.cancel', 'Cancel')}
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
                  {t('pages:dashboard.buttons.create_project', 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {archivedProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200 dark:text-slate-800" />
                  <p className="text-sm">{t('pages:trash.empty', 'Your trash is currently empty.')}</p>
                </div>
              ) : (
                archivedProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{project.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 uppercase">Role: {project.role || 'N/A'} | Type: {project.project_type || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" variant="outline" onClick={() => handleRecoverProject(project.id)}
                        className="h-8 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} /> {t('pages:trash.recover', 'Recover')}
                      </Button>
                      <Button 
                        size="sm" variant="outline" onClick={() => handlePermanentDelete(project.id)}
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
                {t('pages:assets.cancel', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;