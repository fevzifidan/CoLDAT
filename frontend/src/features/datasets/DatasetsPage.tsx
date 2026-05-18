// src/features/datasets/DatasetsPage.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, RotateCcw, X, Trash, Plus, FolderPlus } from "lucide-react"; 
import { DatasetCard } from './components/DatasetCard'; // Import yolu düzeltildi
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { datasetService } from './services/datasetService';

interface Dataset {
  id: string;
  name: string;
  description?: string;
  dataset_type: string;
  created_at: string;
  status?: string;
  role?: string;
  isDeleted?: boolean;
  isPermanentlyDeleted?: boolean;
}

const DatasetsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(4);
  
  const [datasetList, setDatasetList] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Yeni Dataset Modal Stateleri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDesc, setDatasetDesc] = useState("");
  const [datasetType, setDatasetType] = useState("text");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = () => {
    setLoading(true);
    datasetService.getAllDatasets()
      .then((data: any) => {
        const enrichedDatasets = (data || []).map((d: any) => ({
          ...d,
          isDeleted: d.isDeleted ?? false,
          isPermanentlyDeleted: d.isPermanentlyDeleted ?? false
        }));
        setDatasetList(enrichedDatasets);
      })
      .catch((error: any) => {
        console.error("Dataset yükleme hatası:", error);
        toast.error(t("apiService:error.unexpected_err", "Veri setleri yüklenemedi."));
      })
      .finally(() => setLoading(false));
  };

  const handleCreateDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName.trim()) return;

    setSubmitting(true);
    
    datasetService.createDataset({ 
      name: datasetName, 
      description: datasetDesc, 
      dataset_type: datasetType 
    })
      .then(() => {
        toast.success(t("datasets.created_success", "Veri seti başarıyla oluşturuldu."));
        setIsModalOpen(false);
        setDatasetName("");
        setDatasetDesc("");
        setDatasetType("text");
        fetchDatasets(); 
      })
      .catch((err: any) => {
        console.error("Dataset oluşturma hatası:", err);
        toast.error(t("datasets.create_failed", "Veri seti oluşturulurken bir hata oluştu."));
      })
      .finally(() => setSubmitting(false));
  };

  const activeDatasets = datasetList.filter(
    (d) => !d.isDeleted && !d.isPermanentlyDeleted
  );
  
  const archivedDatasets = datasetList.filter(
    (d) => d.isDeleted && !d.isPermanentlyDeleted
  );

  const filteredDatasets = activeDatasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const datasetRole = dataset.role?.toUpperCase() || dataset.status?.toUpperCase() || "OWNER";
    const matchesRole = roleFilter === "ALL" || datasetRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const visibleDatasets = filteredDatasets.slice(0, displayLimit);

  const handleDeleteDataset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDatasetList(prev => prev.map(d => d.id === id ? { ...d, isDeleted: true } : d));
    toast.info(t("datasets.moved_to_trash", "Veri seti çöp kutusuna taşındı."));
  };

  const handleRecoverDataset = (id: string) => {
    setDatasetList(prev => prev.map(d => d.id === id ? { ...d, isDeleted: false } : d));
    toast.success(t("datasets.recovered", "Veri seti geri yüklendi."));
  };

  const handlePermanentDelete = (id: string) => {
    datasetService.deleteDataset(id)
      .then(() => {
        setDatasetList(prev => prev.filter(d => d.id !== id));
        toast.success(t("datasets.permanently_deleted", "Veri seti sistemden kalıcı olarak silindi."));
      })
      .catch((err: any) => {
        console.error("Kalıcı silme hatası:", err);
        toast.error(t("datasets.delete_failed", "Veri seti silinirken hata oluştu."));
      });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-muted-foreground">
        {t("common.loading", "Veriler yükleniyor...")}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {t('datasets.title', "Datasets")}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t("search.placeholder", "Search...")} 
              className="pl-9 h-9 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 h-9 font-medium shadow-sm gap-1.5"
          >
            <Plus size={16} /> {t('datasets.create_dataset', "Create Dataset")}
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white border-2">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-900">
                  <FolderPlus className="text-indigo-600 h-5 w-5" /> 
                  {t('datasets.create_dataset', "Create Dataset")}
                </DialogTitle>
                <DialogDescription>
                  Create a new target dataset repository to manage your ground truth data.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDataset} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dataset Name</label>
                  <Input 
                    value={datasetName} 
                    onChange={(e) => setDatasetName(e.target.value)} 
                    placeholder="e.g., Medical Records Corpus" 
                    required 
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dataset Type</label>
                  <select
                    value={datasetType}
                    onChange={(e) => setDatasetType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer text-slate-700 font-medium focus-visible:outline-none"
                  >
                    <option value="text">📄 Text / Document Data</option>
                    <option value="image">🖼️ Image / Vision Data</option>
                    <option value="tabular">📊 Tabular / Structured Data</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <Textarea 
                    value={datasetDesc} 
                    onChange={(e) => setDatasetDesc(e.target.value)} 
                    placeholder="Describe the distribution, schema, or purpose of this dataset..." 
                    rows={3} 
                    maxLength={300}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2 font-bold">
                  {submitting ? t("common.saving", "Saving...") : t("common.save", "Create Dataset")}
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
              <option value="OWNER">Owner</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            className="h-9 relative border-slate-300 hover:bg-slate-100 gap-2 font-medium"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash className="h-4 w-4 text-slate-600" />
            {archivedDatasets.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {archivedDatasets.length}
              </span>
            )}
            {t('trash.title', "Trash")}
          </Button>
        </div>
      </div>

      {visibleDatasets.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>{t('datasets.empty_list', "Görüntülenecek veri seti bulunamadı.")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleDatasets.map((dataset) => (
            <div 
              key={dataset.id} 
              onClick={() => navigate(`/datasets/${dataset.id}`)}
              className="cursor-pointer transition-transform hover:scale-[1.02] relative group"
            >
              <DatasetCard dataset={dataset} />
              
              <button
                onClick={(e) => handleDeleteDataset(dataset.id, e)}
                className="absolute bottom-4 right-4 p-2 rounded-lg bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 border border-rose-200 shadow-sm"
                title="Move to Trash"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {displayLimit < filteredDatasets.length && (
        <div className="flex justify-center mt-12">
          <Button onClick={() => setDisplayLimit(prev => prev + 4)} variant="outline" className="px-8">
            {t('tasks.load_more', "Load More")} 
          </Button>
        </div>
      )}

      {/* Çöp Kutusu Modalı */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Trash2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-lg">{t('trash.modal_title', "Trash Bin")}</h3>
              </div>
              <button 
                onClick={() => setIsTrashOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedDatasets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200" />
                  <p className="text-sm">{t('trash.empty', "Trash is empty")}</p>
                </div>
              ) : (
                archivedDatasets.map((dataset) => (
                  <div 
                    key={dataset.id} 
                    className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{dataset.name}</h4>
                      <p className="text-xs text-slate-400 capitalize">Type: {dataset.dataset_type}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRecoverDataset(dataset.id)}
                        className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} />
                        {t('trash.recover', "Recover")}
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePermanentDelete(dataset.id)}
                        className="h-8 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold gap-1.5"
                        title="Delete Permanently"
                      >
                        <Trash2 size={13} />
                        {t('trash.permanent_delete', "Delete")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="bg-slate-800 hover:bg-slate-900 text-xs font-medium">
                {t('common.close', "Close")}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsPage;