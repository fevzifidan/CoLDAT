// src/features/datasets/DatasetsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, RotateCcw, X, Plus, FolderPlus, Trash, ArrowLeft } from "lucide-react"; 
import { DatasetCard } from './components/DatasetCard';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { datasetService } from './services/datasetService';

interface Dataset {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  dataset_type: string; // backend şemasına göre gerekirse 'text' | 'image' vb. veya default-string
  current_version?: string;
  total_images?: number;
  annotated_images?: number;
  role?: string;
  isDeleted?: boolean;
  isPermanentlyDeleted?: boolean;
}

const DatasetsPage = () => {
  const { t } = useTranslation(['pages', 'common']);
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const isUUID = (str?: string) => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const activeProjectId = isUUID(projectId) ? projectId : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(8); // Varsayılan limiti biraz artırdık grid uyumu için
  
  const [datasetList, setDatasetList] = useState<Dataset[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDesc, setDatasetDesc] = useState("");
  const [datasetType, setDatasetType] = useState("image"); // Backend imaj tabanlı şemaya sahip olduğundan varsayılanı 'image' yapabiliriz
  const [submitting, setSubmitting] = useState(false);

const fetchDatasets = useCallback(async () => {
  setLoading(true);
  try {
    let rawData: any = null;

    if (activeProjectId) {
      rawData = await datasetService.getAllDatasets(activeProjectId);
    } else {
      rawData = await datasetService.getAllDatasets(); 
    }

    // 🚀 Hata Ayıklama Logu: Konsolda ham nesneyi net görebilmek için
    console.log("Backend'den Gelen Ham Nesne:", rawData);

    let extractedData: any[] = [];
    
    // Her türlü API yanıt mimarisini kapsayan güvenli kontrol:
    if (rawData) {
      if (Array.isArray(rawData)) {
        extractedData = rawData;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        extractedData = rawData.data;
        if (rawData.next_cursor) setNextCursor(rawData.next_cursor);
      } else if (rawData.results && Array.isArray(rawData.results)) {
        extractedData = rawData.results;
      } else if (rawData.datasets && Array.isArray(rawData.datasets)) {
        extractedData = rawData.datasets;
      }
    }
    
    const enrichedDatasets = extractedData.map((d: any) => ({
      ...d,
      // Backend'den isim farklı gelebiliyorsa tolerans gösterelim:
      name: d.name || d.title || d.dataset_name || "Untitled Dataset",
      isDeleted: d.isDeleted ?? d.is_deleted ?? false,
      isPermanentlyDeleted: d.isPermanentlyDeleted ?? false
    }));
    
    setDatasetList(enrichedDatasets);
  } catch (error) {
    console.error("Dataset yükleme hatası:", error);
    toast.error(t("common:status.error", "Veri setleri yüklenirken bir hata oluştu."));
    setDatasetList([]); 
  } finally {
    setLoading(false);
  }
}, [activeProjectId, t]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleCreateDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName.trim()) return;

    if (!activeProjectId) {
      toast.error("Dataset oluşturabilmek için öncelikle 'Projects' sayfasından bir projenin içerisine girmelisiniz.");
      return;
    }

    setSubmitting(true);
    
    datasetService.createDataset(activeProjectId, { 
      name: datasetName, 
      description: datasetDesc, 
      dataset_type: datasetType
    })
      .then(() => {
        toast.success(t("common:status.success", "Created successfully."));
        setIsModalOpen(false);
        setDatasetName("");
        setDatasetDesc("");
        setDatasetType("image");
        fetchDatasets(); 
      })
      .catch((err: any) => {
        console.error("Dataset oluşturma hatası:", err);
        toast.error(err?.message || t("common:status.error", "An error occurred."));
      })
      .finally(() => setSubmitting(false));
  };

  const activeDatasets = datasetList.filter((d) => !d.isDeleted && !d.isPermanentlyDeleted);
  const archivedDatasets = datasetList.filter((d) => d.isDeleted && !d.isPermanentlyDeleted);
  console.log("Tüm Datasetler:", datasetList);
  console.log("Aktif Datasetler:", activeDatasets);
  console.log("Arşivlenen Datasetler:", archivedDatasets);
  console.log("Aktif Datasetler:", activeDatasets.map(d => ({ id: d.id, name: d.name, role: d.role, created_at: (d as any).created_at, isDeleted: d.isDeleted })));
  console.log("Arşivlenen Datasetler:", archivedDatasets.map(d => ({ id: d.id, name: d.name, role: d.role, created_at: (d as any).created_at, isDeleted: d.isDeleted })));

const filteredDatasets = activeDatasets.filter(dataset => {
  // dataset.name parametresinin güvenli kontrolü
  const currentName = dataset.name || "";
  const matchesSearch = currentName.toLowerCase().includes(searchQuery.toLowerCase());
  
  const datasetRole = dataset.role?.toUpperCase() || "MEMBER"; 
  const matchesRole = roleFilter === "ALL" || datasetRole === roleFilter;
  
  return matchesSearch && matchesRole;
});

  const visibleDatasets = filteredDatasets.slice(0, displayLimit);

  const handleDeleteDataset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Local soft delete simülasyonu (Gerçek senaryoda backend endpoint'ine bağlanabilir)
    setDatasetList(prev => prev.map(d => d.id === id ? { ...d, isDeleted: true } : d));
    toast.info(t("common:status.moved_to_trash", "Moved to trash."));
  };

  const handleRecoverDataset = (id: string) => {
    setDatasetList(prev => prev.map(d => d.id === id ? { ...d, isDeleted: false } : d));
    toast.success(t("pages:trash.recover", "Restored successfully."));
  };

  const handlePermanentDelete = (id: string) => {
    datasetService.deleteDataset(id)
      .then(() => {
        setDatasetList(prev => prev.filter(d => d.id !== id));
        toast.success(t("pages:trash.permanent_delete", "Permanently deleted."));
      })
      .catch((err: any) => {
        console.error("Kalıcı silme hatası:", err);
        toast.error(t("common:status.error", "An error occurred."));
      });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-muted-foreground dark:text-slate-400 min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          <p className="text-sm">{t("common:status.loading", "Loading datasets...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {activeProjectId && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/projects')}
              className="rounded-xl border dark:border-slate-800 h-9 w-9"
            >
              <ArrowLeft size={16} />
            </Button>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {activeProjectId ? `${t('pages:datasets.title', "Datasets")} - Project Scope` : t('pages:datasets.title', "Datasets")}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              placeholder={t("pages:datasets.search_placeholder", "Search datasets...")} 
              className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button 
            onClick={() => {
              if (!activeProjectId) {
                toast.error("Dataset oluşturabilmek için öncelikle 'Projects' sayfasından bir projenin içerisine girmelinesiniz.");
                return;
              }
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 h-9 font-medium shadow-sm gap-1.5 text-white rounded-xl"
          >
            <Plus size={16} /> {t('pages:datasets.create_dataset', "Create Dataset")}
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-2 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <FolderPlus className="text-indigo-600 dark:text-indigo-400 h-5 w-5" /> 
                    {t('pages:datasets.create_dataset', "Create Dataset")}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  <span className="block dark:text-slate-400">
                    {t('pages:datasets.description', "Manage versioned data collections and track progress.")}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDataset} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('pages:project_general.project_name', 'Dataset Name')}</label>
                  <Input 
                    value={datasetName} 
                    onChange={(e) => setDatasetName(e.target.value)} 
                    placeholder={t('pages:project_general.placeholder_name', 'E.g. Autonomous Driving Dataset')} 
                    required 
                    maxLength={100}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('pages:project_general.task_type', 'Dataset Type')}</label>
                  <select
                    value={datasetType}
                    onChange={(e) => setDatasetType(e.target.value)}
                    className="flex h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-medium focus-visible:outline-none"
                  >
                    <option value="image">🖼️ Image / Vision Data</option>
                    <option value="text">📄 Text / Document Data</option>
                    <option value="tabular">📊 Tabular / Structured Data</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('pages:project_general.description', 'Description')}</label>
                  <Textarea 
                    value={datasetDesc} 
                    onChange={(e) => setDatasetDesc(e.target.value)} 
                    placeholder={t('pages:project_general.placeholder_desc', 'Describe the purpose of this dataset...')} 
                    rows={3} 
                    maxLength={300}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 mt-2 font-bold text-white rounded-xl">
                  {submitting ? t("common:status.saving", "Saving...") : t("pages:datasets.create_dataset", "Create Dataset")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setDisplayLimit(8); 
              }}
              className="flex h-9 w-40 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">✨ {t('pages:datasets.filter.all_roles', 'All Roles')}</option>
              <option value="ADMIN">🔑 Admin</option>
              <option value="MEMBER">👥 Member</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            className="h-9 relative border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 gap-2 font-medium rounded-xl"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            {archivedDatasets.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedDatasets.length}
              </span>
            )}
            {t('pages:trash.title', "Trash")}
          </Button>
        </div>
      </div>

      {filteredDatasets.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <p>{t('pages:datasets.empty_list', "No datasets found matching the criteria.")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-left">
          {visibleDatasets.map((dataset) => (
            <div 
              key={dataset.id} 
              onClick={() => navigate(`/datasets/${dataset.id}`)}
              className="cursor-pointer transition-transform hover:scale-[1.02] relative group dark:[&_h3]:!text-white dark:[&_h4]:!text-white"
            >
              {/* DatasetCard içerisine backend verileri (total_images, role vb.) otomatik sızacaktır */}
              <DatasetCard dataset={{
                ...dataset,
                created_at: (dataset as any).created_at ?? (dataset as any).createdAt ?? new Date().toISOString(),
              }} />
              <button
                onClick={(e) => handleDeleteDataset(dataset.id, e)}
                className="absolute bottom-4 right-4 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 shadow-sm"
                title={t('pages:trash.permanent_delete', 'Delete')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {displayLimit < filteredDatasets.length && (
        <div className="flex justify-center mt-12">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="px-8 rounded-xl dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">
            {t('pages:datasets.more_load', "Load More")} 
          </Button>
        </div>
      )}

      {/* Trash Modal Arayüzü */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Trash2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-lg">{t('pages:trash.modal_title', "Trash Bin")}</h3>
              </div>
              <button onClick={() => setIsTrashOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedDatasets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200 dark:text-slate-800" />
                  <p className="text-sm">{t('pages:trash.empty', "Trash is empty")}</p>
                </div>
              ) : (
                archivedDatasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 gap-4">
                    <div className="text-left">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{dataset.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">Version: {dataset.current_version || 'v1.0'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleRecoverDataset(dataset.id)} className="h-8 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold gap-1.5 rounded-xl">
                        <RotateCcw size={13} /> {t('pages:trash.recover', "Recover")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePermanentDelete(dataset.id)} className="h-8 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold gap-1.5 rounded-xl">
                        <Trash2 size={13} /> {t('pages:trash.permanent_delete', "Delete")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-xl">
                {t('common:status.close', "Close")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsPage;