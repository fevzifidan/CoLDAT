// frontend/src/features/datasets/taxonomy/TaxonomyManager.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // i18n hook'u eklendi
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Edit2, Check, X, Link as LinkIcon, Tag } from "lucide-react";

const TaxonomyManager = () => {
  const { t } = useTranslation(); // t fonksiyonu tanımlandı

  // State Yönetimi
  const [classes, setClasses] = useState([
    { id: 1, name: 'Car', color: '#ff4d4d' },
    { id: 2, name: 'Pedestrian', color: '#33ff77' }
  ]);
  
  const [predicates, setPredicates] = useState([
    { id: 1, name: 'is_riding' },
    { id: 2, name: 'is_holding' }
  ]);

  const [attributes, setAttributes] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [tempName, setTempName] = useState("");

  // Edit İşlemleri
  const startEdit = (type: 'class' | 'pred', id: number, currentName: string) => {
    setEditingId(`${type}-${id}`);
    setTempName(currentName);
  };

  const saveEdit = (type: 'class' | 'pred', id: number) => {
    if (type === 'class') {
      setClasses(classes.map(c => c.id === id ? { ...c, name: tempName } : c));
    } else {
      setPredicates(predicates.map(p => p.id === id ? { ...p, name: tempName } : p));
    }
    setEditingId(null);
  };

  const addGlobalAttribute = () => {
    const attr = prompt(t("taxonomy.prompt_msg"));
    if (attr) setAttributes([...attributes, attr]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{t("taxonomy.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("taxonomy.description")}</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => alert(t("taxonomy.alert_saved"))}>
          <Save className="mr-2 h-4 w-4" /> {t("taxonomy.save_changes")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Object Classes Kartı */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Tag size={18} className="text-orange-500" /> {t("taxonomy.object_classes")}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setClasses([...classes, { id: Date.now(), name: t("taxonomy.default_new_class"), color: '#cbd5e1' }])}>
                <Plus size={18} className="text-indigo-600" />
              </Button>
            </div>
            <div className="space-y-2">
              ={classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                  {editingId === `class-${cls.id}` ? (
                    <div className="flex gap-2 w-full">
                      <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm" />
                      <Button size="icon" className="h-8 w-8 bg-green-500" onClick={() => saveEdit('class', cls.id)}><Check size={14}/></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingId(null)}><X size={14}/></Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }} />
                        <span className="text-sm font-semibold text-slate-700">{cls.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => startEdit('class', cls.id, cls.name)}>
                        <Edit2 size={14} className="text-slate-400" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predicates Kartı */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <LinkIcon size={18} className="text-blue-500" /> {t("taxonomy.predicates")}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPredicates([...predicates, { id: Date.now(), name: t("taxonomy.default_new_relation") }])}>
                <Plus size={18} className="text-indigo-600" />
              </Button>
            </div>
            <div className="space-y-2">
              {predicates.map((pred) => (
                <div key={pred.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                  {editingId === `pred-${pred.id}` ? (
                    <div className="flex gap-2 w-full">
                      <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm font-mono" />
                      <Button size="icon" className="h-8 w-8 bg-green-500" onClick={() => saveEdit('pred', pred.id)}><Check size={14}/></Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-mono italic text-slate-600">{pred.name}</span>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => startEdit('pred', pred.id, pred.name)}>
                        <Edit2 size={14} className="text-slate-400" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Attributes Alanı */}
      <Card className="border-2 border-dashed border-slate-200 bg-slate-50/30">
        <CardContent className="p-8 text-center">
          {attributes.length === 0 ? (
            <>
              <div className="bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Tag size={20} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium mb-4 text-sm">{t("taxonomy.no_global_attributes")}</p>
              <Button variant="outline" size="sm" onClick={addGlobalAttribute} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                {t("taxonomy.add_global_attribute")}
              </Button>
            </>
          ) : (
            <div className="text-left w-full">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">{t("taxonomy.global_attributes_title")}</h4>
              <div className="flex flex-wrap gap-2">
                {attributes.map((attr, i) => (
                  <Badge key={i} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none px-3 py-1">
                    {attr}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0" onClick={addGlobalAttribute}>
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