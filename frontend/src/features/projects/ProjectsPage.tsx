// src/features/projects/ProjectsPage.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RotateCcw, X, Trash, Plus, LogIn } from "lucide-react";
import { ProjectCard } from './components/ProjectCard';
import { projectService } from './services/projectService';
import { useNavigate } from 'react-router-dom';

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
  dataset_id?: string;
}

const ProjectsPage = () => {
  const { t } = useTranslation(['projects', 'pages']);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [displayLimit, setDisplayLimit] = useState<number>(4);
  const [isTrashOpen, setIsTrashOpen] = useState<boolean>(false);

  const [projectList, setProjectList] = useState<ExtendedProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState("");

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      setIsUnauthorized(false);
      const response = await projectService.getAllProjects();
      
      let projectDataArray: any[] = [];
      if (response) {
        if (Array.isArray(response)) {
          projectDataArray = response;
        } else if (response.data && Array.isArray(response.data)) {
          projectDataArray = response.data;
        } else if (typeof response === 'object') {
          projectDataArray = Array.isArray((response as any).results) ? (response as any).results : [];
        }
      }

      const formatted = projectDataArray.map((p: any) => ({ 
        ...p, 
        isDeleted: p.isDeleted ?? false,
        role: p.role || "ADMIN" 
      }));

      setProjectList(formatted);
    } catch (err: any) {
      console.error("API error fetching projects:", err);
      
      if (err?.response?.status === 401 || err?.status === 401) {
        setIsUnauthorized(true);
        setApiError(t('pages:errors.unauthorized', 'Session expired or unauthorized. Please log in again.'));
      } else {
        setApiError(t('pages:errors.fetch_failed', 'Failed to load projects from backend server.'));
      }
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
        <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-border">
        <h1 className="text-2xl font-extrabold text-foreground">
          {t('projects:title')}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("pages:assets.search_placeholder", "Search...")} 
              className="pl-9 h-9 bg-card border-border text-foreground placeholder:text-muted-foreground" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isUnauthorized}
            className="bg-primary hover:bg-primary/90 h-9 font-medium shadow-sm gap-1.5 text-primary-foreground"
          >
            <Plus size={16} />
            {t('projects:buttons.create_project', 'Create New Project')}
          </Button>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setDisplayLimit(4);
              }}
              className="flex h-9 w-44 rounded-md border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-muted-foreground font-medium"
            >
                            <option value="ALL">✨ {t('projects:roles.all_roles', 'All Roles')}</option>
              <option value="ADMIN">🛡️ {t('projects:roles.admin', 'Admin')}</option>
              <option value="ANNOTATOR">✏️ {t('projects:roles.annotator', 'Annotator')}</option>
              <option value="VIEWER">👁️ {t('projects:roles.viewer', 'Viewer')}</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            className="h-9 relative gap-2 font-medium"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-muted-foreground" />
            {archivedProjects.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedProjects.length}
              </span>
            )}
            {t('pages:trash.title', 'Trash')}
          </Button>
        </div>
      </div>

            {isLoading && (
        <div className="flex justify-center items-center py-24 text-primary font-medium">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mr-3" />
          {t('pages:assets.loading', 'Loading data from backend...')}
        </div>
      )}

      {apiError && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 text-destructive text-sm text-center max-w-md mx-auto space-y-3 shadow-sm">
          <p className="font-medium">{apiError}</p>
          <div className="flex justify-center gap-3">
            {isUnauthorized ? (
              <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5" onClick={() => navigate('/login')}>
                <LogIn size={15} /> {t('pages:assets.login', 'Go to Login')}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={fetchProjects}>
                {t('pages:assets.retry', 'Retry')}
              </Button>
            )}
          </div>
        </div>
      )}

      {!isLoading && !apiError && (
        <>
                    {visibleProjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {t('projects:no_projects', 'No active projects found matching criteria.')}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProjects.map(item => (
                /* 🎯 DÜZELTME: Dış div üzerindeki onClick yönlendirmesi tamamen temizlendi */
                <div 
                  key={item.id} 
                  className="relative group transition-transform hover:scale-[1.01]"
                >
                  <ProjectCard project={item} cardType="project" />
                  
                  <button
                    onClick={(e) => handleDeleteProject(item.id, e)}
                    className="absolute bottom-4 right-4 p-2 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 border border-destructive/20 shadow-sm z-10"
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
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline">
            {t('projects:show_more', 'Show More')} 
          </Button>
        </div>
      )}

            {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
              <h3 className="font-bold text-lg text-foreground">{t('projects:buttons.create_project', 'Create New Project')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('pages:project_general.project_name', 'Project Name')}
                  </label>
                  <Input
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder={t('pages:project_general.placeholder_name', 'E.g. Autonomous Driving Dataset...')}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="p-3 border-t border-border bg-muted flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  {t('pages:assets.cancel', 'Cancel')}
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('pages:dashboard.buttons.create_project', 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

            {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
              <div className="flex items-center gap-2">
                <Trash2 size={18} className="text-destructive" />
                <h3 className="font-bold text-lg">{t('pages:trash.modal_title', 'Trash Bin')}</h3>
              </div>
              <button onClick={() => setIsTrashOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedProjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Trash2 size={40} className="mx-auto text-muted-foreground/30" />
                  <p className="text-sm">{t('pages:trash.empty', 'Your trash is currently empty.')}</p>
                </div>
              ) : (
                archivedProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-4">
                    <div>
                      <h4 className="font-semibold text-card-foreground text-sm">{project.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase">Role: {project.role || 'N/A'} | Type: {project.project_type || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" variant="outline" onClick={() => handleRecoverProject(project.id)}
                        className="h-8 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} /> {t('pages:trash.recover', 'Recover')}
                      </Button>
                      <Button 
                        size="sm" variant="outline" onClick={() => handlePermanentDelete(project.id)}
                        className="h-8 border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-bold gap-1.5"
                      >
                        <Trash2 size={13} /> {t('pages:trash.permanent_delete', 'Delete')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border bg-muted flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="text-xs font-medium">
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