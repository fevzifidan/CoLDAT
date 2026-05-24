// src/features/datasets/taxonomy/TaxonomyManager.tsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Save, Check, X, Link as LinkIcon, Tag, Loader2, Trash2 } from "lucide-react";
import { projectService } from '../../projects/services/projectService';

interface TaxonomyManagerProps {
  projectId: string | undefined;
  onUpdate: (data: { classes: any[]; predicates: any[]; attributes: string[] }) => void;
}

interface ClassItem {
  id: string | number;
  name: string;
  color: string;
}

interface PredicateItem {
  id: string | number;
  name: string;
}

const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({ projectId, onUpdate }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState<boolean>(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [predicates, setPredicates] = useState<PredicateItem[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [tempName, setTempName] = useState<string>("");

  // 1. Backend'den veya local'den veriyi ilk açılışta çekiyoruz (Burada döngü yok, tek seferlik)
  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    projectService.getProjectTaxonomy(projectId)
      .then((res: any) => {
        const data = res?.data || res || {};
        setClasses(Array.isArray(data.classes) ? data.classes : []);
        setPredicates(Array.isArray(data.predicates) ? data.predicates : []);
        setAttributes(Array.isArray(data.attributes) ? data.attributes : []);
      })
      .catch((err) => {
        console.error("Taxonomy yüklenirken hata:", err);
      })
      .finally(() => setLoading(false));
  }, [projectId]);


  // 🚀 CRITICAL FIX: Otomatik sonsuz döngü tetikleyen useEffect'i kaldırdık!
  // Bunun yerine her veri değişiminde üst bileşene kontrollü haber veren yardımcı bir fonksiyon yazdık.
  const updateParent = (updatedClasses: ClassItem[], updatedPreds: PredicateItem[], updatedAttrs: string[]) => {
    onUpdate({
      classes: updatedClasses,
      predicates: updatedPreds,
      attributes: updatedAttrs
    });
  };

  // Düzenlemeyi Kaydetme
  const saveEdit = (type: 'class' | 'pred', id: string | number) => {
    let nextClasses = [...classes];
    let nextPredicates = [...predicates];

    if (type === 'class') {
      nextClasses = classes.map(c => c.id === id ? { ...c, name: tempName } : c);
      setClasses(nextClasses);
    } else {
      nextPredicates = predicates.map(p => p.id === id ? { ...p, name: tempName } : p);
      setPredicates(nextPredicates);
    }
    
    setEditingId(null);
    updateParent(nextClasses, nextPredicates, attributes); // Değişikliği yukarı fırlat
  };

  // Eleman Silme
  const deleteItem = (type: 'class' | 'pred', id: string | number) => {
    let nextClasses = [...classes];
    let nextPredicates = [...predicates];

    if (type === 'class') {
      nextClasses = classes.filter(c => c.id !== id);
      setClasses(nextClasses);
    } else {
      nextPredicates = predicates.filter(p => p.id !== id);
      setPredicates(nextPredicates);
    }

    updateParent(nextClasses, nextPredicates, attributes);
  };

  // Yeni Klas/Eleman Ekleme
  const addClass = () => {
    const newCls = { 
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), 
      name: t("taxonomy.default_new_class", "New Class"), 
      color: ['#ff4d4d', '#33ff77', '#3b82f6', '#eab308'][Math.floor(Math.random() * 4)] 
    };
    const nextClasses = [...classes, newCls];
    setClasses(nextClasses);
    updateParent(nextClasses, predicates, attributes);
  };

  const addPredicate = () => {
    const newPred = { 
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), 
      name: t("taxonomy.default_new_relation", "new_relation") 
    };
    const nextPredicates = [...predicates, newPred];
    setPredicates(nextPredicates);
    updateParent(classes, nextPredicates, attributes);
  };

  const addGlobalAttribute = () => {
    const attr = prompt(t("taxonomy.prompt_msg", "Enter attribute name:"));
    if (attr && attr.trim()) {
      const nextAttrs = [...attributes, attr.trim()];
      setAttributes(nextAttrs);
      updateParent(classes, predicates, nextAttrs);
    }
  };

  const removeAttribute = (indexToRemove: number) => {
    const nextAttrs = attributes.filter((_, index) => index !== indexToRemove);
    setAttributes(nextAttrs);
    updateParent(classes, predicates, nextAttrs);
  };

  const startEdit = (type: 'class' | 'pred', id: string | number, currentName: string) => {
    setEditingId(`${type}-${id}`);
    setTempName(currentName);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500 font-mono gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        {t("common:status.loading", "Loading taxonomy...")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">{t("taxonomy.title", "Project Taxonomy")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("taxonomy.description", "Manage labels, object classes, attributes and predicates for this project.")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Object Classes Kartı */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <Tag size={18} className="text-orange-500" /> {t("taxonomy.object_classes", "Object Classes")}
              </div>
              <Button variant="ghost" size="icon" onClick={addClass}>
                <Plus size={18} className="text-indigo-600" />
              </Button>
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {classes.length === 0 && (
                <p className="text-xs text-center py-6 text-muted-foreground">{t("taxonomy.no_classes", "No classes defined yet.")}</p>
              )}
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl group">
                  {editingId === `class-${cls.id}` ? (
                    <div className="flex gap-2 w-full">
                      <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm" autoFocus />
                      <Button size="icon" className="h-8 w-8 bg-green-500 text-white" onClick={() => saveEdit('class', cls.id)}><Check size={14}/></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingId(null)}><X size={14}/></Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cls.color }} />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cls.name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit('class', cls.id, cls.name)}>
                          <Edit2 size={14} className="text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteItem('class', cls.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predicates Kartı */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <LinkIcon size={18} className="text-blue-500" /> {t("taxonomy.predicates", "Predicates (Relations)")}
              </div>
              <Button variant="ghost" size="icon" onClick={addPredicate}>
                <Plus size={18} className="text-indigo-600" />
              </Button>
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {predicates.length === 0 && (
                <p className="text-xs text-center py-6 text-muted-foreground">{t("taxonomy.no_predicates", "No predicates defined yet.")}</p>
              )}
              {predicates.map((pred) => (
                <div key={pred.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl group">
                  {editingId === `pred-${pred.id}` ? (
                    <div className="flex gap-2 w-full">
                      <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm font-mono" autoFocus />
                      <Button size="icon" className="h-8 w-8 bg-green-500 text-white" onClick={() => saveEdit('pred', pred.id)}><Check size={14}/></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingId(null)}><X size={14}/></Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-mono italic text-slate-600 dark:text-slate-400">{pred.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit('pred', pred.id, pred.name)}>
                          <Edit2 size={14} className="text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteItem('pred', pred.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Attributes Alanı */}
      <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
        <CardContent className="p-8 text-center">
          {attributes.length === 0 ? (
            <>
              <div className="bg-white dark:bg-slate-900 w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border dark:border-slate-800">
                <Tag size={20} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium mb-4 text-sm">{t("taxonomy.no_global_attributes", "No global attributes defined.")}</p>
              <Button variant="outline" size="sm" onClick={addGlobalAttribute} className="text-indigo-600 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900">
                {t("taxonomy.add_global_attribute", "Add Global Attribute")}
              </Button>
            </>
          ) : (
            <div className="text-left w-full">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">{t("taxonomy.global_attributes_title", "Global Attributes")}</h4>
              <div className="flex flex-wrap gap-2 items-center">
                {attributes.map((attr, i) => (
                  <Badge key={i} className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-none px-3 py-1 flex items-center gap-1 font-semibold">
                    {attr}
                    <button onClick={() => removeAttribute(i)} className="hover:text-red-500 transition-colors ml-1">
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 border border-dashed border-slate-300" onClick={addGlobalAttribute}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxonomyManager;