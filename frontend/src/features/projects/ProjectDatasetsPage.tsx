// src/features/projects/ProjectDatasetsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"; 
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Database, Plus, RefreshCw, Layers, FileSpreadsheet, FolderPlus, Image, CheckCircle } from "lucide-react"; 
import { projectService } from './services/projectService';
import { datasetService } from '../datasets/services/datasetService'; 
import { toast } from 'sonner';

export const ProjectDatasetsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['pages', 'common']);
  
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [projectDatasets, setProjectDatasets] = useState<any[]>([]); 
  
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  
  const [allAvailableDatasets, setAllAvailableDatasets] = useState<any[]>([]);
  const [attachingId, setAttachingId] = useState<string | null>(null);

  const [datasetName, setDatasetName] = useState("");
  const [datasetDesc, setDatasetDesc] = useState("");
  const [datasetType, setDatasetType] = useState("image");
  const [submitting, setSubmitting] = useState(false);

  // Hem projeyi hem de o projeye ait gerçek datasetleri çekip eşitleyen ana fonksiyon
  const loadProjectData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      
      // 1. Proje Detayını Çek
      const projRes = await projectService.getProjectById(projectId);
      const projData = projRes?.data || projRes;
      setProjectDetails(projData);

      // 2. O Projeye Bağlı Gerçek Dataset Listesini Çek
      const res = await datasetService.getAllDatasets(projectId);
      // Backend pagination objesiyse ({ data: [...] }) içini aç, değilse array kontrolü yap
      const datasetList = res && res.data && Array.isArray(res.data) ? res.data : res;
      
      if (Array.isArray(datasetList)) {
        setProjectDatasets(datasetList);
      } else if (projData && Array.isArray(projData.datasets)) {
        setProjectDatasets(projData.datasets);
      } else {
        setProjectDatasets([]);
      }

    } catch (err) {
      console.error("Error loading project datasets:", err);
      toast.error("Veriler yüklenirken bir sorun oluştu.");
      setProjectDatasets([]); 
    } finally {
      setLoading(false);
    }
  };

  // 🎯 REAL BACKEND ENTEGRASYONU: Havuzdaki Diğer Tüm Datasetleri Yükle (Attach Modalı için)
  const loadAvailableDatasets = async () => {
    try {
      // Tüm projeleri gezmek yerine, kullanıcının erişebildiği ana havuzu tek istek ile çekiyoruz
      const response = await datasetService.getAllDatasets();
      const extractedList = response && response.data && Array.isArray(response.data) ? response.data : response;
      
      if (Array.isArray(extractedList)) {
        setAllAvailableDatasets(extractedList);
      }
    } catch (err) {
      console.error("Error loading available datasets:", err);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // Mevcut Bir Dataseti Projeye Bağlama
  const handleAttachDataset = async (datasetId: string) => {
    if (!projectId) return;
    try {
      setAttachingId(datasetId);
      await projectService.attachDataset(projectId, datasetId);

      toast.success("Dataset başarıyla projeye bağlandı.");
      setIsAttachModalOpen(false);
      
      setTimeout(() => {
        loadProjectData();
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error("Bağlama işlemi sırasında bir hata oluştu.");
    } finally {
      setAttachingId(null);
    }
  };

  // Sıfırdan Yeni Dataset Oluşturup Projeye Ekleme
  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName.trim() || !projectId) return;

    setSubmitting(true);
    try {
      await datasetService.createDataset(projectId, { 
        name: datasetName, 
        description: datasetDesc, 
        dataset_type: datasetType
      });
      
      toast.success(t("common:status.success", "Dataset başarıyla oluşturuldu ve projeye eklendi."));
      setIsCreateModalOpen(false);
      
      setDatasetName("");
      setDatasetDesc("");
      setDatasetType("image");
      
      setTimeout(() => {
        loadProjectData();
      }, 400);
    } catch (err: any) {
      console.error("Dataset oluşturma hatası:", err);
      toast.error(err?.message || t("common:status.error", "Bir hata oluştu."));
    } finally {
      setSubmitting(false);
    }
  };

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
              {projectDetails?.name || t('pages:dashboard.sections.loading', 'Loading Project...')}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
              {t('pages:datasets.manage_linked', 'Linked Datasets Management')}
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
          {t('pages:assets.refresh', 'Refresh')}
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 text-indigo-600 dark:text-indigo-400 font-medium gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
          <p className="text-sm">{t('pages:assets.loading', 'Loading dataset configurations...')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Sol Taraf: Projeye Bağlı Datasetlerin Listesi */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                📂 {t('pages:datasets.active_datasets', 'Active Datasets')} ({projectDatasets.length})
              </h3>
              {projectDatasets.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => { loadAvailableDatasets(); setIsAttachModalOpen(true); }}
                    className="rounded-xl h-8 text-xs gap-1"
                  >
                    <Plus size={12} /> Var Olanı Bağla
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 text-xs gap-1"
                  >
                    <Plus size={12} /> Yeni Oluştur
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
                      {t('pages:datasets.no_dataset_title', 'No Dataset Connected Yet')}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                      {t('pages:datasets.no_dataset_desc', 'To unlock the project manager dashboard, you must first attach or upload a dataset matrix to this environment.')}
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-3 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => { loadAvailableDatasets(); setIsAttachModalOpen(true); }}
                      className="rounded-xl font-medium"
                    >
                      <Plus size={14} className="mr-1" /> Havuzdan Dataset Bağla
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
                    >
                      <Plus size={14} className="mr-1" /> Sıfırdan Dataset Oluştur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              projectDatasets.map((ds: any) => (
                <Card key={ds.id} className="rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">{ds.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{ds.description || 'No custom description provided.'}</CardDescription>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Layers size={16} />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 flex flex-wrap gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                      <FileSpreadsheet size={13} />
                      <span>ID: <span className="font-mono text-slate-700 dark:text-slate-300">{ds.id ? (ds.id.toString().slice(0,8) + '...') : 'N/A'}</span></span>
                    </div>

                    {/* 🎯 REAl BACKEND VERİSİ: İmaj Sayıları */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                      <Image size={13} className="text-sky-500" />
                      <span>Images: <span className="text-slate-700 dark:text-slate-300">{ds.total_images ?? 0}</span></span>
                    </div>

                    {/* 🎯 REAL BACKEND VERİSİ: Anotasyon İlerlemesi */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                      <CheckCircle size={13} className="text-emerald-500" />
                      <span>Annotated: <span className="text-slate-700 dark:text-slate-300">{ds.annotated_images ?? 0}</span></span>
                    </div>

                    {/* 🎯 REAL BACKEND VERİSİ: Kullanıcı Rolü */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg capitalize">
                      <span>👤 Role: <span className="text-indigo-600 dark:text-indigo-400">{ds.role || 'Member'}</span></span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sağ Taraf: Pipeline Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              ℹ️ {t('pages:datasets.pipeline_status', 'Pipeline Status')}
            </h3>
            <Card className="rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {t('pages:datasets.requirements', 'Requirements Link')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <p>
                  Projenin ana kontrol paneline (<strong>MANAGE</strong>) erişebilmek için en az 1 adet doğrulanmış veri setinin yukarıdaki listeye eklenmesi gerekmektedir.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Dataset Connection:</span>
                    <span className={projectDatasets.length > 0 ? "text-emerald-600" : "text-rose-500"}>
                      {projectDatasets.length > 0 ? "PASSED" : "REQUIRED"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Manager Access:</span>
                    <span className={projectDatasets.length > 0 ? "text-emerald-600" : "text-amber-500"}>
                      {projectDatasets.length > 0 ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL 1: Havuzdan Var Olanı Bağlama */}
      <Dialog open={isAttachModalOpen} onOpenChange={setIsAttachModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800">
          <DialogHeader>
            <DialogTitle>Mevcut Dataset İlişkilendir</DialogTitle>
            <DialogDescription>
              Sistemdeki kayıtlı havuzdan bir veri setini bu projeye bağlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pt-2 pr-1">
            {allAvailableDatasets.filter(d => !projectDatasets.some((existing: any) => existing.id === d.id)).length === 0 ? (
              <p className="text-sm text-center text-slate-400 py-6">Bağlanabilecek yeni bir dataset bulunamadı.</p>
            ) : (
              allAvailableDatasets
                .filter(d => !projectDatasets.some((existing: any) => existing.id === d.id))
                .map((availableDs) => (
                  <div key={availableDs.id} className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{availableDs.name}</h4>
                      <p className="text-xs text-slate-400 max-w-[280px] truncate">{availableDs.description || 'Açıklama yok.'}</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={attachingId === availableDs.id}
                      onClick={() => handleAttachDataset(availableDs.id)}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 h-8 text-xs rounded-lg"
                    >
                      {attachingId === availableDs.id ? "Bağlanıyor..." : "Bağla"}
                    </Button>
                  </div>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Yeni Dataset Oluşturma Modalı */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-2 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                <FolderPlus className="text-indigo-600 dark:text-indigo-400 h-5 w-5" /> 
                Yeni Dataset Oluştur
              </span>
            </DialogTitle>
            <DialogDescription>
              <span className="block dark:text-slate-400">
                Bu proje için doğrudan yeni bir veri seti koleksiyonu başlatın.
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDataset} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dataset Adı</label>
              <Input 
                value={datasetName} 
                onChange={(e) => setDatasetName(e.target.value)} 
                placeholder="Örn: Otonom Sürüş Kamera Verileri" 
                required 
                maxLength={100}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dataset Tipi</label>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-medium focus-visible:outline-none"
              >
                <option value="image">🖼️ Görsel / Resim Verisi</option>
                <option value="text">📄 Metin / Doküman Verisi</option>
                <option value="tabular">📊 Tablo / Yapılandırılmış Veri</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Açıklama</label>
              <Textarea 
                value={datasetDesc} 
                onChange={(e) => setDatasetDesc(e.target.value)} 
                placeholder="Bu veri setinin amacını kısaca açıklayın..." 
                rows={3} 
                maxLength={300}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-50 dark:hover:bg-indigo-600 mt-2 font-bold text-white rounded-xl">
              {submitting ? "Kaydediliyor..." : "Oluştur ve Projeye Ekle"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};