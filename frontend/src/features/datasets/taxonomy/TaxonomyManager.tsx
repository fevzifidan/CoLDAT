import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Check, X, Link as LinkIcon, Tag, Loader2, Trash2, ShieldCheck, Lock } from "lucide-react";
import { projectService } from '../../projects/services/projectService';
import notificationService from '@/shared/services/notification/notification.service';





interface TaxonomyManagerProps {
  projectId: string | undefined;
  onUpdate?: (data: { classes: ClassItem[]; predicates: PredicateItem[]; attributes: string[] }) => void;
  isAdmin?: boolean; // 👑 Üst bileşenden gelen yetki kontrolü eklendi
}

interface ClassItem {
  id: string | number;
  name: string;
  color: string;
  isActive: boolean;
  includeInExport: boolean;
}

interface PredicateItem {
  id: string | number;
  name: string;
  isActive: boolean;
  includeInExport: boolean;
}

const COLOR_PALETTE = [
  '#ff4d4d', '#33ff77', '#3b82f6', '#eab308', 
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
  '#64748b', '#10b981', '#6366f1', '#d946ef'
];

const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({ projectId, onUpdate, isAdmin = false }) => {
  const { t } = useTranslation(['pages', 'common', 'taxonomy']);

  const [loading, setLoading] = useState<boolean>(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [predicates, setPredicates] = useState<PredicateItem[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null); 
  const [tempName, setTempName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("#3b82f6");
  
  const [tempIsActive, setTempIsActive] = useState<boolean>(true);
  const [tempIncludeInExport, setTempIncludeInExport] = useState<boolean>(true);

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    projectService.getProjectTaxonomy(projectId)
      .then((res: any) => {
        const data = res?.data || res || {};

        const normalizedClasses = (Array.isArray(data.classes) ? data.classes : []).map((c: any) => ({
          ...c,
          isActive: c.isActive ?? true,
          includeInExport: c.includeInExport ?? true
        }));

        const normalizedPredicates = (Array.isArray(data.predicates) ? data.predicates : []).map((p: any) => ({
          ...p,
          isActive: p.isActive ?? true,
          includeInExport: p.includeInExport ?? true
        }));

        setClasses(normalizedClasses);
        setPredicates(normalizedPredicates);
      })
      .catch((err) => {
        console.error("Taxonomy yüklenirken hata:", err);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

    const updateParent = (updatedClasses: ClassItem[], updatedPreds: PredicateItem[]) => {
    if (onUpdate) {
      onUpdate({
        classes: updatedClasses,
        predicates: updatedPreds,
        attributes: [] 
      });
    }
  };

                                const saveEdit = async (type: 'class' | 'pred', id: string | number) => {
        if (!isAdmin) {
      notificationService.error(t("common:status.error", "Sadece admin rolü düzenleme yapabilir."));
      return;
    }

    let nextClasses = [...classes];
    let nextPredicates = [...predicates];

    if (type === 'class') {
      nextClasses = classes.map(c => c.id === id ? { 
        ...c, 
        name: tempName, 
        color: selectedColor,
        isActive: tempIsActive,
        includeInExport: tempIncludeInExport
      } : c);
    } else {
      nextPredicates = predicates.map(p => p.id === id ? { 
        ...p, 
        name: tempName,
        isActive: tempIsActive,
        includeInExport: tempIncludeInExport
      } : p);
    }
    
    setEditingId(null);
    
    // Backend'e tüm listeyi topluca kaydet (PUT /taxonomy/)
    await saveTaxonomyToBackend(nextClasses, nextPredicates);
  };

    const deleteItem = async (type: 'class' | 'pred', id: string | number) => {
    if (!isAdmin) {
      notificationService.error(t("taxonomy:delete_error", "Sadece yetkili admin bu öğeyi silebilir."));
      return;
    }

    if (!projectId) return;

    const confirmDelete = window.confirm(
      t("taxonomy.permanent_delete_warning", "DİKKAT! Bu işlem bu öğeye ait tüm geçmiş etiketlemeleri veritabanından KALICI olarak silecektir. Emin misiniz?")
    );
    
    if (!confirmDelete) return;

        try {
          const taxonomyType = type === 'class' ? 'class' : 'predicate';

          await notificationService.promise(
            projectService.deleteTaxonomyItem(projectId, taxonomyType, String(id)),
            {
              loading: t("taxonomy.deleting", "Silme işlemi gerçekleştiriliyor..."),
              success: t("taxonomy.delete_success", "Öğe ve ilişkili tüm geçmiş etiketler başarıyla silindi."),
              error: t("taxonomy.delete_error", "Silme işlemi sırasında bir hata oluştu."),
            }
          );

      let nextClasses = [...classes];
      let nextPredicates = [...predicates];

      if (type === 'class') {
        nextClasses = classes.filter(c => c.id !== id);
        setClasses(nextClasses);
      } else {
        nextPredicates = predicates.filter(p => p.id !== id);
        setPredicates(nextPredicates);
      }

      updateParent(nextClasses, nextPredicates);
    } catch (error) {
      console.error("Taxonomy kalıcı silme hatası:", error);
    }
  };

    // Backend'e tüm taxonomy'yi kaydetmek için yardımcı fonksiyon
  const saveTaxonomyToBackend = async (updatedClasses: ClassItem[], updatedPredicates: PredicateItem[]) => {
    if (!projectId) return;

    try {
      // ID'si geçici (string) olanları backend oluşturacağı için id'siz gönder, 
      // var olanları id'li gönder.
      // NOT: Backend'deki bulk upsert, id'si olmayan öğeleri yeni oluşturur.
      const classPayload = updatedClasses.map(c => ({
        ...(typeof c.id === 'number' || (typeof c.id === 'string' && !c.id.startsWith('temp-')) ? { id: c.id } : {}),
        name: c.name,
        color: c.color,
        index: typeof c.id === 'number' ? c.id : updatedClasses.indexOf(c),
        is_active: c.isActive,
        include_in_export: c.includeInExport,
      }));

      const predicatePayload = updatedPredicates.map(p => ({
        ...(typeof p.id === 'number' || (typeof p.id === 'string' && !p.id.startsWith('temp-')) ? { id: p.id } : {}),
        name: p.name,
        is_active: p.isActive,
        include_in_export: p.includeInExport,
      }));

      const response = await projectService.updateProjectTaxonomy(projectId, {
        classes: classPayload,
        predicates: predicatePayload,
      });

      // Backend'den dönen gerçek verilerle state'i güncelle
      const responseData = response?.data || response || {};
      const serverClasses = (Array.isArray(responseData.classes) ? responseData.classes : []).map((c: any) => ({
        id: c.id,
        name: c.name,
        color: c.color || COLOR_PALETTE[0],
        isActive: c.is_active ?? true,
        includeInExport: c.include_in_export ?? true,
      }));
      const serverPredicates = (Array.isArray(responseData.predicates) ? responseData.predicates : []).map((p: any) => ({
        id: p.id,
        name: p.name,
        isActive: p.is_active ?? true,
        includeInExport: p.include_in_export ?? true,
      }));

      setClasses(serverClasses);
      setPredicates(serverPredicates);
      updateParent(serverClasses, serverPredicates);
    } catch (err: any) {
      console.error("Taxonomy kaydedilirken hata:", err);
      notificationService.error(
        err?.response?.data?.message || t("common:status.error_general", "An error occurred while saving taxonomy.")
      );
      // Hata durumunda eski state'e geri dönmek için veriyi yeniden yükle
      const res = await projectService.getProjectTaxonomy(projectId);
      const data = res?.data || res || {};
      const reloadedClasses = (Array.isArray(data.classes) ? data.classes : []).map((c: any) => ({
        ...c, isActive: c.isActive ?? true, includeInExport: c.includeInExport ?? true
      }));
      const reloadedPredicates = (Array.isArray(data.predicates) ? data.predicates : []).map((p: any) => ({
        ...p, isActive: p.isActive ?? true, includeInExport: p.includeInExport ?? true
      }));
      setClasses(reloadedClasses);
      setPredicates(reloadedPredicates);
    }
  };

  const addClass = async () => {
    if (!isAdmin) return;
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString()}`;
    const newCls: ClassItem = { 
      id: tempId,
      name: t("taxonomy.default_new_class", "New Class"), 
      color: randomColor,
      isActive: true,
      includeInExport: true
    };
    const nextClasses = [...classes, newCls];
    setClasses(nextClasses);
    // Backend'e kaydet (beklemeden göster, backend'e async kaydet)
    await saveTaxonomyToBackend(nextClasses, predicates);
  };

  const addPredicate = async () => {
    if (!isAdmin) return;
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString()}`;
    const newPred: PredicateItem = { 
      id: tempId,
      name: t("taxonomy.default_new_relation", "new_relation"),
      isActive: true,
      includeInExport: true
    };
    const nextPredicates = [...predicates, newPred];
    setPredicates(nextPredicates);
    // Backend'e kaydet
    await saveTaxonomyToBackend(classes, nextPredicates);
  };

  const startEdit = (type: 'class' | 'pred', item: any) => {
    if (!isAdmin) return; 
    setEditingId(`${type}-${item.id}`);
    setTempName(item.name);
    setTempIsActive(item.isActive ?? true);
    setTempIncludeInExport(item.includeInExport ?? true);
    if (type === 'class') {
      setSelectedColor(item.color);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500 font-mono gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        {t("common:status.loading", "Loading taxonomy...")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {t("taxonomy.title", "Project Taxonomy")}
            {!isAdmin && <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal"><Lock size={12}/> {t("taxonomy.view_only", "Salt Okunur")}</span>}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("taxonomy.description", "Manage labels, object classes, and predicates for this project.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================= OBJECT CLASSES KARTI ================= */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Tag size={18} className="text-primary" /> {t("taxonomy.object_classes", "Object Classes")}
              </div>
              {isAdmin && (
                <Button variant="ghost" size="icon" onClick={addClass} className="hover:bg-primary/10 hover:text-primary">
                  <Plus size={18} className="text-primary" />
                </Button>
              )}
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {classes.length === 0 && (
                <p className="text-xs text-center py-6 text-muted-foreground">{t("taxonomy.no_classes", "No classes defined yet.")}</p>
              )}
              {classes.map((cls) => (
                <div key={cls.id} className="flex flex-col p-3 bg-card border border-border rounded-xl group gap-2 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                  {editingId === `class-${cls.id}` ? (
                    <div className="space-y-3 w-full">
                      <div className="flex gap-2 w-full">
                        <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm" autoFocus />
                        <Button size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => saveEdit('class', cls.id)}><Check size={14}/></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setEditingId(null)}><X size={14}/></Button>
                      </div>
                      
                      <div className="flex gap-4 bg-white dark:bg-slate-950 p-2 rounded-lg border dark:border-slate-800 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                          <input type="checkbox" checked={tempIsActive} onChange={(e) => setTempIsActive(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary" />
                                                    {t("taxonomy:active_label", "Active")}
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                          <input type="checkbox" checked={tempIncludeInExport} onChange={(e) => setTempIncludeInExport(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary" />
                          {t("taxonomy:include_export_label", "Include in Export")}
                        </label>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("taxonomy:class_color_label", "Class Color:")}</span>
                        <div className="grid grid-cols-6 gap-1 p-1.5 bg-white dark:bg-slate-950 rounded-lg border dark:border-slate-800">
                          {COLOR_PALETTE.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`h-5 w-full rounded transition-transform ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-950 scale-105' : 'hover:scale-105 hover:ring-2 hover:ring-primary/50 hover:ring-offset-1'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setSelectedColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cls.color }} />
                          <span className={`text-sm font-semibold ${cls.isActive ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 line-through'}`}>{cls.name}</span>
                        </div>
                        <div className="flex gap-1 ml-1 sm:ml-4 scale-90 origin-left">
                          {!cls.isActive && <span className="bg-muted text-muted-foreground border border-border text-[9px] px-1.5 py-0.5 rounded font-bold">{t("taxonomy:passive_badge", "Passive")}</span>}
                          {cls.includeInExport && <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"><ShieldCheck size={10}/>{t("taxonomy:exportable_badge", "Exportable")}</span>}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit('class', cls)}>
                            <Edit2 size={14} className="text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteItem('class', cls.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ================= PREDICATES KARTI ================= */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <LinkIcon size={18} className="text-primary" /> {t("taxonomy.predicates", "Predicates (Relations)")}
              </div>
              {isAdmin && (
                <Button variant="ghost" size="icon" onClick={addPredicate} className="hover:bg-primary/10 hover:text-primary">
                  <Plus size={18} className="text-primary" />
                </Button>
              )}
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {predicates.length === 0 && (
                <p className="text-xs text-center py-6 text-muted-foreground">{t("taxonomy.no_predicates", "No predicates defined yet.")}</p>
              )}
              {predicates.map((pred) => (
                <div key={pred.id} className="flex flex-col p-3 bg-card border border-border rounded-xl group gap-2 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                  {editingId === `pred-${pred.id}` ? (
                    <div className="space-y-3 w-full">
                      <div className="flex gap-2 w-full">
                        <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm font-mono" autoFocus />
                        <Button size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => saveEdit('pred', pred.id)}><Check size={14}/></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setEditingId(null)}><X size={14}/></Button>
                      </div>
                      
                      <div className="flex gap-4 bg-white dark:bg-slate-950 p-2 rounded-lg border dark:border-slate-800 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                          <input type="checkbox" checked={tempIsActive} onChange={(e) => setTempIsActive(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary" />
                                                    {t("taxonomy:active_label", "Active")}
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                          <input type="checkbox" checked={tempIncludeInExport} onChange={(e) => setTempIncludeInExport(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary" />
                          {t("taxonomy:include_export_label", "Include in Export")}
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className={`text-sm font-mono italic ${pred.isActive ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 line-through'}`}>{pred.name}</span>
                        <div className="flex gap-1 ml-1 sm:ml-4 scale-90 origin-left">
                          {!pred.isActive && <span className="bg-muted text-muted-foreground border border-border text-[9px] px-1.5 py-0.5 rounded font-bold">{t("taxonomy:passive_badge", "Passive")}</span>}
                          {pred.includeInExport && <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"><ShieldCheck size={10}/>{t("taxonomy:exportable_badge", "Exportable")}</span>}
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit('pred', pred)}>
                            <Edit2 size={14} className="text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteItem('pred', pred.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaxonomyManager;