// src/features/datasets/DatasetsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RotateCcw, X, Plus, Trash, ArrowLeft, Layers, Shield, Users } from "lucide-react"; 
import { SelectFilter } from '@/shared/components/SelectFilter';
import { DatasetCard } from './components/DatasetCard';
import { useNavigate, useParams } from 'react-router-dom';
import notificationService from '@/shared/services/notification/notification.service';
import { datasetService } from './services/datasetService';
import { CreateDatasetModal } from './components/CreateDatasetModal';

interface Dataset {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  current_version?: string;
  total_images?: number;
  annotated_images?: number;
  role?: string;
  isDeleted?: boolean;
  isPermanentlyDeleted?: boolean;
}

const DatasetsPage = () => {
  const { t } = useTranslation(['pages', 'common', 'datasets']);
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
    notificationService.error(t("common:status.error", "Veri setleri yüklenirken bir hata oluştu."));
    setDatasetList([]); 
  } finally {
    setLoading(false);
  }
}, [activeProjectId, t]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

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
    notificationService.info(t("common:status.moved_to_trash", "Moved to trash."));
  };

  const handleRecoverDataset = (id: string) => {
    setDatasetList(prev => prev.map(d => d.id === id ? { ...d, isDeleted: false } : d));
    notificationService.success(t("pages:trash.recover", "Restored successfully."));
  };

  const handlePermanentDelete = (id: string) => {
    datasetService.deleteDataset(id)
      .then(() => {
        setDatasetList(prev => prev.filter(d => d.id !== id));
        notificationService.success(t("pages:trash.permanent_delete", "Permanently deleted."));
      })
      .catch((err: any) => {
        console.error("Kalıcı silme hatası:", err);
        notificationService.error(t("common:status.error", "An error occurred."));
      });
  };

    if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-muted-foreground min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <p className="text-sm">{t("common:status.loading", "Loading datasets...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-border">
        <div className="flex items-center gap-3">
          {activeProjectId && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/projects')}
              className="rounded-xl border border-border h-9 w-9"
            >
              <ArrowLeft size={16} />
            </Button>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {activeProjectId ? `${t('pages:datasets.title', "Datasets")} - Project Scope` : t('pages:datasets.title', "Datasets")}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("pages:datasets.search_placeholder", "Search datasets...")} 
              className="pl-9 h-9 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

                    <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 h-9 font-medium shadow-sm gap-1.5 text-primary-foreground rounded-xl"
          >
            <Plus size={16} /> {t('pages:datasets.create_dataset', "Create Dataset")}
          </Button>

          <CreateDatasetModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onDatasetCreated={fetchDatasets}
          />

                              <SelectFilter
                                value={roleFilter}
                                onChange={(v) => {
                                  setRoleFilter(v);
                                  setDisplayLimit(8);
                                }}
                                triggerClassName="w-40"
                                options={[
                                  { value: 'ALL', label: t('pages:datasets.filter.all_roles', 'All Roles'), icon: <Layers className="h-3.5 w-3.5" /> },
                                  { value: 'ADMIN', label: t("datasets:roles.admin", "Admin"), icon: <Shield className="h-3.5 w-3.5" /> },
                                  { value: 'MEMBER', label: t("datasets:roles.member", "Member"), icon: <Users className="h-3.5 w-3.5" /> },
                                ]}
                              />

          <Button 
            variant="outline" 
            className="h-9 relative gap-2 font-medium rounded-xl"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-muted-foreground" />
            {archivedDatasets.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedDatasets.length}
              </span>
            )}
            {t('pages:trash.title', "Trash")}
          </Button>
        </div>
      </div>

      {filteredDatasets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('pages:datasets.empty_list', "No datasets found matching the criteria.")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-left">
          {visibleDatasets.map((dataset) => (
            <div 
              key={dataset.id} 
              onClick={() => navigate(`/datasets/${dataset.id}`)}
              className="cursor-pointer transition-transform hover:scale-[1.02] relative group"
            >
              {/* DatasetCard içerisine backend verileri (total_images, role vb.) otomatik sızacaktır */}
                            <DatasetCard dataset={dataset} />
              <button
                onClick={(e) => handleDeleteDataset(dataset.id, e)}
                className="absolute bottom-4 right-4 p-2 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 border border-destructive/20 shadow-sm"
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
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="px-8 rounded-xl">
            {t('pages:datasets.more_load', "Load More")} 
          </Button>
        </div>
      )}

      {/* Trash Modal Arayüzü */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
              <div className="flex items-center gap-2">
                <Trash2 size={18} className="text-destructive" />
                <h3 className="font-bold text-lg">{t('pages:trash.modal_title', "Trash Bin")}</h3>
              </div>
              <button onClick={() => setIsTrashOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedDatasets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Trash2 size={40} className="mx-auto text-muted-foreground/30" />
                  <p className="text-sm">{t('pages:trash.empty', "Trash is empty")}</p>
                </div>
              ) : (
                archivedDatasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30 gap-4">
                    <div className="text-left">
                      <h4 className="font-semibold text-card-foreground text-sm">{dataset.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{t("datasets:card.version_label", "Version")}: {dataset.current_version || 'v1.0'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleRecoverDataset(dataset.id)} className="h-8 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-bold gap-1.5 rounded-xl">
                        <RotateCcw size={13} /> {t('pages:trash.recover', "Recover")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePermanentDelete(dataset.id)} className="h-8 border-destructive/20 bg-destructive/10 text-destructive text-xs font-bold gap-1.5 rounded-xl">
                        <Trash2 size={13} /> {t('pages:trash.permanent_delete', "Delete")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="text-xs font-medium rounded-xl">
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