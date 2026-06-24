// frontend/src/features/projects/ProjectDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Database, ArrowLeft, ListTodo, Settings, Users } from "lucide-react";
import { RoleProvider } from '@/context/PermissionContext';
import { type BackendRole } from '@/shared/roles';
import TaxonomyManager from '@/features/datasets/taxonomy/TaxonomyManager';
import ProjectDatasetsPage from './ProjectDatasetsPage';
import { ProjectTasksTab } from './tabs/ProjectTasksTab';
import GeneralSettings from './tabs/GeneralSettings';
import ProjectMembersManager from '@/features/projects/components/ProjectMembersManager';
import { projectService } from './services/projectService';
import notificationService from '@/shared/services/notification/notification.service';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['pages', 'common']);
  const [activeTab, setActiveTab] = useState('datasets');
  const [project, setProject] = useState<{ id: string; name: string; description?: string; role?: string } | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const projectId = id || '';

  // Proje rolünü BackendRole tipine cast et
  const projectRole = (project?.role as BackendRole) || null;

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
    { value: 'members', label: t('pages:project_detail.tabs.members', 'Members'), icon: Users },
    { value: 'datasets', label: t('pages:project_detail.tabs.datasets', 'Datasets'), icon: Database },
    { value: 'taxonomy', label: t('pages:project_detail.tabs.taxonomy', 'Taxonomy'), icon: Tag },
    { value: 'tasks', label: t('pages:project_detail.tabs.tasks', 'Tasks'), icon: ListTodo },
  ];

  return (
    <RoleProvider role={projectRole}>
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {project ? project.name : t('pages:project_detail.page_title', 'Project Details')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('pages:project_detail.subtitle', 'Manage Datasets, Taxonomy & Tasks')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="flex gap-6 border-b border-border w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={16} /> 
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
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

                        {activeTab === 'members' && (
              <ProjectMembersManager projectId={projectId} ownerId={project?.owner_id} />
            )}

                                                {activeTab === 'datasets' && (
              <ProjectDatasetsPage projectId={projectId} />
            )}

            {activeTab === 'taxonomy' && (
                            <TaxonomyManager 
                projectId={projectId}
              />
            )}

            {activeTab === 'tasks' && (
              <ProjectTasksTab projectId={projectId} />
            )}
          </div>
        </div>
      </div>
        </div>
    </RoleProvider>
  );
};

export default ProjectDetailPage;