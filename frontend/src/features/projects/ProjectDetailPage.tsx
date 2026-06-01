// frontend/src/features/projects/ProjectDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tag, Database, ArrowLeft, ListTodo } from "lucide-react";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TaxonomyManager from '@/features/datasets/taxonomy/TaxonomyManager';
import ProjectDatasetsPage from './ProjectDatasetsPage';
import { ProjectTasksTab } from './tabs/ProjectTasksTab';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['pages', 'common']);
  const [activeTab, setActiveTab] = useState('datasets');
  
  // Project info obtained from URL params; no GET /projects/{id} endpoint exists.
  const projectId = id || '';
  const tabs = [
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
              {t('pages:project_detail.page_title', 'Project Details')}
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
            {activeTab === 'datasets' && (
              <ProjectDatasetsPage />
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
  );
};

export default ProjectDetailPage;