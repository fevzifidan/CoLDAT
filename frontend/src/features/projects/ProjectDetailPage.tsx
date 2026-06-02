import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Tag, Image as ImageIcon, Users, Download, ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from 'react'; 
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { projectService } from './services/projectService';

// Bileşen Importları
import TaxonomyManager from '@/features/datasets/taxonomy/TaxonomyManager';
import AssetManager from '@/assets/AssetManager';
import TeamManager from '@/assets/TeamManager';
import ExportManager from '@/assets/ExportManager';
import GeneralSettings from './tabs/GeneralSettings'; 

interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: 'object_detection' | 'entity_recognition' | 'semantic_relation';
  dataset_id: string;
  created_at: string;
  status?: string; 
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

  // Global Değişiklik Takibi
  const [pendingChanges, setPendingChanges] = useState({
    general: null,
    taxonomy: null,
    team: null
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    projectService.getProjectById(id)
      .then((data: any) => {
        setProject({
          ...data,
          task: data.task || data.project_type || 'OBJECT_DETECTION',
          status: data.status || 'ACTIVE'
        });
      })
      .catch((error: any) => {
        console.error("Proje detayı yüklenirken hata oluştu:", error);
        toast.error(t('pages:project_detail.not_found', "Project details could not be retrieved from backend."));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  const handleDataUpdate = (tab: string, data: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [tab]: data
    }));
  };

  const handleGlobalSave = async () => {
    console.log("Kaydedilecek Değişiklikler:", pendingChanges);
    toast.success(t('pages:project_detail.alert_success', "Changes saved successfully!"));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-slate-500 bg-white dark:bg-slate-950">
        {t('common:status.loading', 'Loading...')}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center gap-4">
        <p>{t('pages:project_detail.not_found', 'Project not found.')}</p>
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common:status.back', 'Go Back')}
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

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{project.task}</p>
          </div>
          <Badge variant="secondary" className="ml-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800 uppercase text-[9px]">
            {project.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleGlobalSave}
          >
            <Save className="mr-2 h-4 w-4" /> {t('pages:project_detail.save_all', 'Save All')}
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            {t('pages:project_detail.annotate_data', 'Annotate Data')}
          </Button>
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
                <GeneralSettings 
                  project={project as any} 
                  onUpdate={(data) => handleDataUpdate('general', data)} 
                />
              )}

              {activeTab === 'taxonomy' && (
                <TaxonomyManager />
              )}

              {activeTab === 'assets' && (
                <AssetManager />
              )}

              {activeTab === 'team' && (
                <TeamManager />
              )}

              {activeTab === 'export' && (
                <ExportManager />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;