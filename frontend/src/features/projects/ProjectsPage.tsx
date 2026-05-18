// src/features/projects/ProjectsPage.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, RotateCcw, X, Trash, Plus, FolderPlus } from "lucide-react";
import { ProjectCard } from './components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Yazdığımız JavaScript tabanlı servis import ediliyor
import { projectService } from './services/projectService';

interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: 'object_detection' | 'entity_recognition' | 'semantic_relation';
  dataset_id: string;
  created_at: string;
  status?: string; 
  role?: string;
  type?: string; 
  task?: any;   
  count?: any;  
  isDeleted?: boolean;
  isPermanentlyDeleted?: boolean;
}

const ProjectsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(4);
  
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Yeni Proje Modal Stateleri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectType, setProjectType] = useState<'object_detection' | 'entity_recognition' | 'semantic_relation'>('object_detection');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    setLoading(true);
    projectService.getAllProjects()
      .then((data: any) => {
        const enrichedProjects = (data || []).map((p: any) => ({
          ...p,
          type: p.type || 'project',
          task: p.task !== undefined ? String(p.task) : "0", 
          count: p.count !== undefined ? String(p.count) : "0", 
          isDeleted: p.isDeleted ?? false,
          isPermanentlyDeleted: p.isPermanentlyDeleted ?? false
        }));
        setProjectList(enrichedProjects);
      })
      .catch((error: any) => {
        console.error("Proje yükleme hatası:", error);
        toast.error(t("status.error"));
      })
      .finally(() => setLoading(false));
  };

  // Yeni Proje Gönderme İşlemi (POST)
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setSubmitting(true);
    
    projectService.createProject({
      name: projectName,
      description: projectDesc,
      project_type: projectType,
      dataset_id: "" 
    })
      .then(() => { 
        toast.success(t("status.success"));
        setIsModalOpen(false);
        setProjectName("");
        setProjectDesc("");
        setProjectType("object_detection");
        fetchProjects(); 
      })
      .catch((err: any) => {
        console.error("Proje oluşturma hatası:", err);
        toast.error(t("status.error"));
      })
      .finally(() => setSubmitting(false));
  };

  const activeProjects = projectList.filter(
    (p) => !p.isDeleted && !p.isPermanentlyDeleted
  );
  
  const archivedProjects = projectList.filter(
    (p) => p.isDeleted && !p.isPermanentlyDeleted
  );

  const filteredProjects = activeProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const projectRole = project.role?.toUpperCase() || project.status?.toUpperCase() || "ANNOTATOR";
    const matchesRole = roleFilter === "ALL" || projectRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const visibleProjects = filteredProjects.slice(0, displayLimit);

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectList(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true } : p));
    toast.info(t("status.updating"));
  };

  const handleRecoverProject = (id: string) => {
    setProjectList(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
    toast.success(t("status.success"));
  };

  const handlePermanentDelete = (id: string) => {
    projectService.deleteProject(id)
      .then(() => {
        setProjectList(prev => prev.filter(p => p.id !== id));
        toast.success(t("status.success"));
      })
      .catch(() => {
        toast.error(t("status.error"));
      });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-muted-foreground">
        {t("status.loading")}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {t('projects.title')}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t("search.placeholder")} 
              className="pl-9 h-9 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 h-9 font-medium shadow-sm gap-1.5"
          >
            <Plus size={16} /> {t('dashboard.buttons.create_project')}
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white border-2">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-900">
                  <FolderPlus className="text-indigo-600 h-5 w-5" /> 
                  {t('dashboard.buttons.create_project')}
                </DialogTitle>
                <DialogDescription>
                  {t('dashboard.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t('project_general.project_name')}</label>
                  <Input 
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)} 
                    placeholder={t('project_general.placeholder_name')} 
                    required 
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t('project_general.task_type')}</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer text-slate-700 font-medium focus-visible:outline-none"
                  >
                    <option value="object_detection">🎯 {t('dashboard.tasks.object_detection')}</option>
                    <option value="entity_recognition">📝 {t('dashboard.tasks.entity_recognition')}</option>
                    <option value="semantic_relation">🔗 {t('dashboard.tasks.semantic_relation')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t('project_general.description')}</label>
                  <Textarea 
                    value={projectDesc} 
                    onChange={(e) => setProjectDesc(e.target.value)} 
                    placeholder={t('project_general.placeholder_desc')} 
                    rows={3} 
                    maxLength={300}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2 font-bold">
                  {submitting ? t("status.saving") : t("actions.create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setDisplayLimit(4); 
              }}
              className="flex h-9 w-40 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-slate-700 font-medium"
            >
              <option value="ALL">✨ {t('filter.all_roles')}</option>
              <option value="ADMIN">{t('filter.roles.admin')}</option>
              <option value="ANNOTATOR">{t('filter.roles.annotator')}</option>
              <option value="VIEWER">{t('filter.roles.viewer')}</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            className="h-9 relative border-slate-300 hover:bg-slate-100 gap-2 font-medium"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-slate-600" />
            {archivedProjects.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedProjects.length}
              </span>
            )}
            {t('trash.title')}
          </Button>
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>{t('trash.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProjects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/projects/${project.id}`)}
              className="cursor-pointer transition-transform hover:scale-[1.02] relative group"
            >
              <ProjectCard project={project as any} cardType="project" />
              
              <button
                onClick={(e) => handleDeleteProject(project.id, e)}
                className="absolute bottom-4 right-4 p-2 rounded-lg bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 border border-rose-200 shadow-sm"
                title={t('actions.delete')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {displayLimit < filteredProjects.length && (
        <div className="flex justify-center mt-12">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="px-8">
            {t('status.mod_more', t('status.load_more'))} 
          </Button>
        </div>
      )}

      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Trash2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-lg">{t('trash.modal_title')}</h3>
              </div>
              <button 
                onClick={() => setIsTrashOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200" />
                  <p className="text-sm">{t('trash.empty')}</p>
                </div>
              ) : (
                archivedProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{project.name}</h4>
                      <p className="text-xs text-slate-400 capitalize">
                        {t('team.role_label')}: {project.role ? t(`filter.roles.${project.role.toLowerCase()}`) : t('filter.roles.annotator')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRecoverProject(project.id)}
                        className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} />
                        {t('trash.recover')}
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePermanentDelete(project.id)}
                        className="h-8 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold gap-1.5"
                        title={t('actions.delete')}
                      >
                        <Trash2 size={13} />
                        {t('trash.permanent_delete')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="bg-slate-800 hover:bg-slate-900 text-xs font-medium">
                {t('actions.close')}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;