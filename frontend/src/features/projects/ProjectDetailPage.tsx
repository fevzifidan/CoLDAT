// frontend/src/features/projects/ProjectDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Tag, Image as ImageIcon, Users, Download, ArrowLeft, Save } from "lucide-react";
import { useState, useEffect, useCallback } from 'react'; 
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { projectService } from './services/projectService';

import TaxonomyManager from '@/features/datasets/taxonomy/TaxonomyManager';
import AssetManager from '@/assets/AssetManager';
import TeamManager from '@/assets/TeamManager';
import ExportManager from '@/assets/ExportManager';
import GeneralSettings from './tabs/GeneralSettings'; 

interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: string;
  dataset_id: string;
  created_at: string;
  is_public: boolean;
  role?: string;
  task?: string | number;
}

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['pages', 'common']);
  const [activeTab, setActiveTab] = useState('general');
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [pendingChanges, setPendingChanges] = useState<{
    general: any;
    taxonomy: any;
    team: any;
  }>({
    general: null,
    taxonomy: null,
    team: null
  });

  const loadProjectDetails = () => {
    if (!id) return;
    setLoading(true);
    projectService.getProjectById(id)
      .then((data: any) => {
        const projectData = data?.project || data; 
        
        setProject({
          ...data, 
          id: projectData.id || id,
          name: projectData.name || '',
          description: projectData.description || '',
          project_type: projectData.project_type || 'object_detection',
          task: projectData.project_type || 'object_detection',
          is_public: projectData.is_public ?? false
        });
      })
      .catch((error: any) => {
        console.error("Proje detayı yüklenirken hata oluştu:", error);
        toast.error(t('pages:project_detail.not_found', "Project details could not be retrieved from backend."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const handleDataUpdate = useCallback((tab: string, data: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [tab]: data
    }));
  }, []);

  const handleDeleteProject = async () => {
    if (!id) return;
    
    const confirmDelete = window.confirm(t('project_general.delete_confirm', 'Are you sure you want to permanently delete this project?'));
    if (!confirmDelete) return;

    const deleteToastId = toast.loading(t('common:status.deleting', 'Deleting project...'));
    try {
      await projectService.deleteProject(id);
      toast.success(t('pages:project_detail.delete_success', "Project deleted successfully!"), { id: deleteToastId });
      navigate('/projects'); 
    } catch (error: any) {
      console.error("Proje silinirken hata oluştu:", error);
      toast.error(t('pages:errors.delete_failed', "Failed to delete project from backend."), { id: deleteToastId });
    }
  };

  const handleGlobalSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    const saveToastId = toast.loading(t('common:status.saving', 'Saving changes...'));

    try {
      if (pendingChanges.general) {
        // 🎯 DÜZELTME: Temiz enum değerleri doğrudan gönderiliyor
        const updatedPayload = {
          name: pendingChanges.general.name,
          description: pendingChanges.general.description,
          project_type: pendingChanges.general.project_type, 
          is_public: Boolean(pendingChanges.general.is_public)
        };
        await projectService.updateProject(id, updatedPayload);
      }

      if (pendingChanges.taxonomy) {
        await projectService.updateProjectTaxonomy(id, pendingChanges.taxonomy);
      }

      toast.success(t('pages:project_detail.alert_success', "Changes saved successfully!"), { id: saveToastId });
      
      setPendingChanges({ general: null, taxonomy: null, team: null });
      loadProjectDetails(); 
    } catch (error: any) {
      console.error("Kayıt esnasında hata meydana geldi:", error);
      toast.error(t('pages:errors.save_failed', "Failed to save some configurations to backend."), { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-slate-500 bg-white dark:bg-slate-950">
        {t('common:status.loading', 'Loading...')}
      </div>
    );
  }

  if (!project || !id) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center gap-4">
        <p>{t('pages:project_detail.not_found', 'Project not found.')}</p>
        <Button onClick={() => navigate('/projects')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common:status.back', 'Go to Projects')}
        </Button>
      </div>
    );
  }

  const tabs = [
    { value: 'general', label: t('pages:project_detail.tabs.general', 'General'), icon: Settings },
    { value: 'taxonomy', label: t('pages:project_detail.tabs.taxonomy', 'Taxonomy'), icon: Tag },
    { value: 'assets', label: t('pages:project_detail.tabs.assets', 'Assets'), icon: ImageIcon },
    { value: 'team', label: t('pages:project_detail.tabs.users', 'Team'), icon: Users },
    { value: 'export', label: t('pages:project_detail.tabs.export', 'Export'), icon: Download },
  ];

  const hasChanges = !!(pendingChanges.general || pendingChanges.taxonomy || pendingChanges.team);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{project.task}</p>
          </div>
          <Badge 
            variant="secondary" 
            className={`ml-2 border uppercase text-[9px] ${
              project.is_public 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' 
                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800'
            }`}
          >
            {project.is_public ? 'PUBLIC' : 'PRIVATE'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            onClick={handleGlobalSave}
            disabled={isSaving || !hasChanges}
          >
            <Save className="mr-2 h-4 w-4" /> {t('pages:project_detail.save_all', 'Save All')}
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate(`/projects/${project.id}/datasets`)}>
            {t('pages:project_detail.annotate_data', 'Annotate Data')}
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-800 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={16} /> 
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="pb-20">
              {activeTab === 'general' && (
                <GeneralSettings 
                  project={project} 
                  onUpdate={(data) => handleDataUpdate('general', data)}
                  onDelete={handleDeleteProject}
                />
              )}

              {activeTab === 'taxonomy' && (
                <TaxonomyManager 
                  projectId={id} 
                  onUpdate={(data) => handleDataUpdate('taxonomy', data)} 
                />
              )}

              {activeTab === 'assets' && <AssetManager />}
              {activeTab === 'team' && <TeamManager projectId={id} />}
              {activeTab === 'export' && <ExportManager />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;