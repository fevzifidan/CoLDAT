import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

// Bileşen ve Servis Entegrasyonları
import { RoleProvider } from '@/context/PermissionContext';
import { type BackendRole } from '@/shared/roles';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { projectService } from '@/features/projects/services/projectService';
import { taskService } from '@/features/tasks/services/taskService';
import { datasetService } from '@/features/datasets/services/datasetService';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import type { PaginatedResponse } from '@/shared/hooks/useCursorPagination';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);

  // --- PROJECTS (simple fetch, all at once) ---
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const fetchProjects = () => {
    setProjectsLoading(true);
    setProjectsError(null);

    projectService.getAllProjects({ limit: 100 })
      .then((res: any) => {
        // Backend now returns { data: [...], next_cursor: null }
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setProjectsList(data);
      })
      .catch((err: any) => {
        setProjectsError(err?.message || 'Failed to load projects');
      })
      .finally(() => {
        setProjectsLoading(false);
      });
  };

  useEffect(() => {
    let cancelled = false;

    setProjectsLoading(true);
    projectService.getAllProjects({ limit: 100 })
      .then((res: any) => {
        if (cancelled) return;
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setProjectsList(data);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setProjectsError(err?.message || 'Failed to load projects');
      })
      .finally(() => {
        if (cancelled) return;
        setProjectsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // --- TASKS PAGINATION (limit=4, accumulate mode) ---
  const {
    items: tasksList,
    loading: tasksLoading,
    error: tasksError,
    hasNext: tasksHasNext,
    loadMore: loadMoreTasks,
  } = useCursorPagination({
    fetchFn: async (cursor, limit) => {
      const res = await taskService.getTasks({ limit, after: cursor });
      return res as PaginatedResponse<any>;
    },
    limit: 4,
    mode: 'accumulate',
  });

  // --- DATASETS PAGINATION (limit=4, accumulate mode) ---
  const {
    items: datasetsList,
    loading: datasetsLoading,
    error: datasetsError,
    hasNext: datasetsHasNext,
    loadMore: loadMoreDatasets,
  } = useCursorPagination({
    fetchFn: async (cursor, limit) => {
      const res = await datasetService.fetchAllDatasets({ limit, after: cursor });
      return res as PaginatedResponse<any>;
    },
    limit: 4,
    mode: 'accumulate',
  });

  // Combine all loading states for the initial loading screen
  const isLoading = projectsLoading && projectsList.length === 0
    || tasksLoading && tasksList.length === 0
    || datasetsLoading && datasetsList.length === 0;

  // Combine errors (per-section errors shown inline)
  const hasGlobalError = [projectsError, tasksError, datasetsError].some(Boolean);

  // --- VERİ KART UYUMLULUK MAPPING İŞLEMLERİ ---
  const mappedTasks = useMemo(() =>
    tasksList.map(t => ({
      id: t.id,
      name: t.name || `Task #${t.id.slice(0, 8)}`,
      status: t.status || 'assigned',
      role: t.role || 'Viewer',
      count: t.image_count ?? 0,
    })),
    [tasksList]
  );

    const mappedDatasets = useMemo(() =>
    datasetsList.map(d => ({
      id: d.id,
      name: d.name || 'Unnamed Dataset',
      description: d.description || 'Project dataset repository.',
      role: d.role,
    })),
    [datasetsList]
  );

    const mappedProjects = useMemo(() =>
    projectsList.map(p => ({
      id: p.id,
      name: p.name || 'Standard Project',
      status: p.status || '',
      description: p.description || 'Ecosystem managed project workspace.',
      role: p.user_role,
    })),
    [projectsList]
  );

  // --- ASENKRON DURUM EKRANLARI ---
  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium tracking-wide">{t('dashboard:loading_text')}</p>
      </div>
    );
  }

    if (hasGlobalError && projectsList.length === 0 && tasksList.length === 0 && datasetsList.length === 0) {
    return (
      <div className="h-[50vh] flex items-center justify-center p-4">
        <div className="p-5 rounded-2xl border border-destructive/20 bg-destructive/5 text-center space-y-3 max-w-sm shadow-sm">
          <AlertCircle size={28} className="mx-auto text-destructive animate-pulse" />
          <p className="text-xs text-destructive font-medium leading-relaxed">{t('dashboard:fetch_error')}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchProjects}
            className="text-xs h-8"
          >
            {t('dashboard:retry_button')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-left space-y-1 ml-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {t('dashboard:title')}
        </h1>
        <p className="text-sm text-muted-foreground font-medium italic opacity-70">
          {t('dashboard:description')}
        </p>
      </div>

      {/* RECENT TASKS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="text-left">
            <h2 className="text-xl font-bold text-foreground">
              {t('dashboard:sections.recent_tasks')}
            </h2>
            <p className="text-xs text-muted-foreground italic">
              {t('dashboard:sections.tasks_description')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tasksHasNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreTasks}
                disabled={tasksLoading}
                className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
              >
                {t('dashboard:load_more')}
              </Button>
            )}
            {mappedTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tasks')}
                className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
              >
                {t('dashboard:show_more')}
              </Button>
            )}
          </div>
        </div>

        {tasksError && (
          <div className="flex items-center justify-center gap-2 py-4 text-destructive/80 text-xs">
            <AlertCircle size={14} />
            <span>{tasksError}</span>
          </div>
        )}

        {mappedTasks.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mappedTasks.map((task) => (
              <RoleProvider key={task.id} role={(task.role?.toLowerCase() as BackendRole) || null}>
              <ProjectCard key={task.id} project={task} cardType="task" />
              </RoleProvider>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-[2rem] bg-muted/20 shadow-inner">
            <div className="bg-card p-3 rounded-full shadow-sm mb-3 border border-border">
               <span className="text-xl text-muted-foreground font-serif font-bold">!</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold text-center px-4 max-w-xs">
              {t('dashboard:no_assigned_tasks')}
            </p>
          </div>
        )}
      </section>

      {/* RECENT DATASETS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t('dashboard:sections.recent_datasets')}
            </h2>
            <p className="text-xs text-muted-foreground italic">{t('dashboard:sections.datasets_description')}</p>
          </div>
          <div className="flex items-center gap-2">
            {datasetsHasNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreDatasets}
                disabled={datasetsLoading}
                className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
              >
                {t('dashboard:load_more')}
              </Button>
            )}
            {mappedDatasets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/datasets')}
                className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
              >
                {t('dashboard:show_more')}
              </Button>
            )}
          </div>
        </div>

        {datasetsError && (
          <div className="flex items-center justify-center gap-2 py-4 text-destructive/80 text-xs">
            <AlertCircle size={14} />
            <span>{datasetsError}</span>
          </div>
        )}

                {mappedDatasets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mappedDatasets.map((dataset) => (
              <RoleProvider key={dataset.id} role={(dataset.role as BackendRole) || null}>
              <ProjectCard key={dataset.id} project={dataset} cardType="dataset" />
              </RoleProvider>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
            {t('dashboard:sections.datasets_empty')}
          </div>
        )}
      </section>

            {/* RECENT PROJECTS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t('dashboard:sections.recent_projects')}
            </h2>
            <p className="text-xs text-muted-foreground italic">{t('dashboard:sections.projects_description')}</p>
          </div>
          <div className="flex items-center gap-2">
            {mappedProjects.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
                className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-wider"
              >
                {t('dashboard:show_more')}
              </Button>
            )}
          </div>
        </div>

        {projectsError && (
          <div className="flex items-center justify-center gap-2 py-4 text-destructive/80 text-xs">
            <AlertCircle size={14} />
            <span>{projectsError}</span>
          </div>
        )}

        {mappedProjects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mappedProjects.slice(0, 4).map((project) => (
              <RoleProvider key={project.id} role={(project.role as BackendRole) || null}>
              <ProjectCard key={project.id} project={project} cardType="project" />
              </RoleProvider>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
            {t('dashboard:sections.projects_empty')}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardHome;