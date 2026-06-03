// frontend/src/features/projects/ProjectDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Database, ArrowLeft, ListTodo, Settings } from "lucide-react";
import TaxonomyManager from '@/features/datasets/taxonomy/TaxonomyManager';
import ProjectDatasetsPage from './ProjectDatasetsPage';
import { ProjectTasksTab } from './tabs/ProjectTasksTab';
import GeneralSettings from './tabs/GeneralSettings';
import { projectService } from './services/projectService';
import notificationService from '@/shared/services/notification/notification.service';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['pages', 'common']);
  const [activeTab, setActiveTab] = useState('datasets');
  const [project, setProject] = useState<{ id: string; name: string; description?: string; user_role?: string } | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const projectId = id || '';

  // Kullanıcının bu projedeki rolünü hesapla
  const isAdmin = useMemo(() => {
    return project?.user_role === 'admin';
  }, [project?.user_role]);

  // Proje detayını backend'den çek
  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoadingProject(true);
    try {
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoadingProject(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // General Settings güncelleme callback'i
  const handleProjectUpdate = async (data: any) => {
    if (!data) return;
    try {
      const updated = await projectService.updateProject(projectId, data);
      setProject(updated);
      notificationService.success(t('pages:project_detail.alert_success', 'Changes saved successfully.'));
    } catch (err) {
      notificationService.error(t('common:status.error_general', 'An error occurred.'));
    }
  };

  // Proje silme
  const handleProjectDelete = async () => {
    if (!window.confirm(t('pages:project_general.delete_warning', 'Are you sure you want to delete this project? This action is permanent.'))) return;
    try {
      await projectService.deleteProject(projectId);
      notificationService.success(t('common:status.success', 'Project deleted.'));
      navigate('/projects');
    } catch (err) {
      notificationService.error(t('common:status.error_general', 'An error occurred.'));
    }
  };

  const tabs = [
    { value: 'general', label: t('pages:project_detail.tabs.general', 'General'), icon: Settings },
    { value: 'datasets', label: t('pages:project_detail.tabs.datasets', 'Datasets'), icon: Database },
    { value: 'taxonomy', label: t('pages:project_detail.tabs.taxonomy', 'Taxonomy'), icon: Tag },
    { value: 'tasks', label: t('pages:project_detail.tabs.tasks', 'Tasks'), icon: ListTodo },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {project ? project.name : t('pages:project_detail.page_title', 'Project Details')}
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {t('pages:project_detail.subtitle', 'Manage Datasets, Taxonomy & Tasks')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          {/* Tab Navigation */}
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

          {/* Tab Content */}
          <div className="pb-20">
            {activeTab === 'general' && (
              loadingProject ? (
                <div className="flex justify-center items-center py-24 text-primary font-medium">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mr-3" />
                  {t('common:status.loading', 'Loading...')}
                </div>
              ) : project ? (
                <GeneralSettings
                  project={project}
                  onUpdate={handleProjectUpdate}
                  onDelete={handleProjectDelete}
                />
              ) : (
                <div className="text-center py-24 text-muted-foreground">
                  {t('pages:project_detail.not_found', 'Project Not Found.')}
                </div>
              )
            )}

                        {activeTab === 'datasets' && (
              <ProjectDatasetsPage projectId={projectId} />
            )}

            {activeTab === 'taxonomy' && (
              <TaxonomyManager 
                projectId={projectId}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'tasks' && (
              <ProjectTasksTab projectId={projectId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;