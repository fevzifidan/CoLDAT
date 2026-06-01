// src/features/projects/ProjectDatasetsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Database, Plus, RefreshCw, Layers, FileSpreadsheet, Image, CheckCircle, Tag } from "lucide-react";  
import { datasetService } from '../datasets/services/datasetService'; 
import { CreateDatasetModal } from '../datasets/components/CreateDatasetModal';
import notificationService from '@/shared/services/notification/notification.service';

export const ProjectDatasetsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['pages', 'common', 'datasets']);
  
  const [loading, setLoading] = useState(true);
  const [projectDatasets, setProjectDatasets] = useState<any[]>([]); 
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  
  // O projeye ait gerçek dataset listesini çeken fonksiyon
  const loadProjectData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      
      const res = await datasetService.getAllDatasets(projectId);
      // Backend pagination objesiyse ({ data: [...] }) içini aç, değilse array kontrolü yap
      const datasetList = res && res.data && Array.isArray(res.data) ? res.data : res;
      
      if (Array.isArray(datasetList)) {
        setProjectDatasets(datasetList);
      } else {
        setProjectDatasets([]);
      }

    } catch (err) {
      console.error("Error loading project datasets:", err);
      notificationService.error(t("datasets:project_page.notifications.load_error", "Veriler yüklenirken bir sorun oluştu."));
      setProjectDatasets([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/projects')}
            className="rounded-xl border dark:border-slate-800"
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
                        <h1 className="text-xl font-extrabold tracking-tight">
              {t('datasets:project_page.title', 'Project Datasets')}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
              {t('datasets:project_page.manage_linked', 'Linked Datasets Management')}
            </p>
          </div>
        </div>

        <Button 
          size="sm"
          onClick={loadProjectData}
          variant="outline"
          className="h-9 gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {t('datasets:project_page.refresh', 'Refresh')}
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 text-indigo-600 dark:text-indigo-400 font-medium gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
          <p className="text-sm">{t('datasets:project_page.loading_configs', 'Loading dataset configurations...')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Sol Taraf: Projeye Bağlı Datasetlerin Listesi */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                📂 {t('datasets:project_page.active_datasets', 'Active Datasets')} ({projectDatasets.length})
              </h3>
                            {projectDatasets.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 text-xs gap-1"
                  >
                    <Plus size={12} /> {t("datasets:project_page.create_new_dataset", "Yeni Oluştur")}
                  </Button>
                </div>
              )}
            </div>

            {projectDatasets.length === 0 ? (
              <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-950/20 rounded-[2rem] py-12 text-center">
                <CardContent className="space-y-3">
                  <Database size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('datasets:project_page.no_dataset_title', 'No Dataset Connected Yet')}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                      {t('datasets:project_page.no_dataset_desc', 'To unlock the project manager dashboard, you must first attach or upload a dataset matrix to this environment.')}
                    </p>
                  </div>
                  
                                    <div className="flex justify-center gap-3 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
                    >
                      <Plus size={14} className="mr-1" /> {t("datasets:project_page.create_from_scratch", "Sıfırdan Dataset Oluştur")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              projectDatasets.map((ds: any) => (
                <Card key={ds.id} className="rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {ds.name}
                        {ds.current_version && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            <Tag size={10} />
                            v{ds.current_version}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">{ds.description || t("datasets:card.no_description", "No custom description provided.")}</CardDescription>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Layers size={16} />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 flex flex-wrap gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                      <FileSpreadsheet size={13} />
                      <span>{t("datasets:project_page.id_label", "ID")}: <span className="font-mono text-slate-700 dark:text-slate-300">{ds.id ? (ds.id.toString().slice(0,8) + '...') : 'N/A'}</span></span>
                    </div>

                    {/* 🎯 REAl BACKEND VERİSİ: İmaj Sayıları */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                      <Image size={13} className="text-sky-500" />
                      <span>{t("datasets:project_page.images_label", "Images")}: <span className="text-slate-700 dark:text-slate-300">{ds.total_images ?? 0}</span></span>
                    </div>

                    {/* 🎯 REAL BACKEND VERİSİ: Anotasyon İlerlemesi */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                      <CheckCircle size={13} className="text-emerald-500" />
                      <span>{t("datasets:project_page.annotated_label", "Annotated")}: <span className="text-slate-700 dark:text-slate-300">{ds.annotated_images ?? 0}</span></span>
                    </div>

                    {/* 🎯 REAL BACKEND VERİSİ: Kullanıcı Rolü */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg capitalize">
                      <span>👤 {t("datasets:project_page.role_label", "Role")}: <span className="text-indigo-600 dark:text-indigo-400">{ds.role || 'Member'}</span></span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sağ Taraf: Pipeline Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              ℹ️ {t('datasets:project_page.pipeline_status', 'Pipeline Status')}
            </h3>
            <Card className="rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {t('datasets:project_page.requirements', 'Requirements Link')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                <p>{t("datasets:project_page.pipeline_info", "Projenin ana kontrol paneline (MANAGE) erişebilmek için en az 1 adet doğrulanmış veri setinin yukarıdaki listeye eklenmesi gerekmektedir.")}</p>
                <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between font-bold">
                                        <span>{t("datasets:project_page.dataset_connection", "Dataset Connection")}:</span>
                    <span className={projectDatasets.length > 0 ? "text-emerald-600" : "text-rose-500"}>
                      {projectDatasets.length > 0 ? t("datasets:project_page.passed", "PASSED") : t("datasets:project_page.required_label", "REQUIRED")}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{t("datasets:project_page.manager_access", "Manager Access")}:</span>
                    <span className={projectDatasets.length > 0 ? "text-emerald-600" : "text-amber-500"}>
                      {projectDatasets.length > 0 ? t("datasets:project_page.unlocked", "UNLOCKED") : t("datasets:project_page.locked", "LOCKED")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

                        {/* Yeni Dataset Oluşturma Modalı */}
      <CreateDatasetModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onDatasetCreated={() => {
          setTimeout(() => loadProjectData(), 400);
        }}
      />
    </div>
  );
};