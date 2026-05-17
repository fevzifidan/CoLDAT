import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, UserPlus, Image as ImageIcon, CheckCircle2, Shield, Search, Trash2, RotateCcw, X, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next"; 

interface Dataset {
  id: string;              
  project_id: string;      
  name: string;            
  description: string;      
  current_version: string;  
  total_images: number;     
  annotated_images: number; 
  role: 'admin' | 'annotator' | 'viewer'; 
}

const DatasetsPage = () => {
  const { t } = useTranslation(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); 
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const datasets: Dataset[] = [
    {
      id: "d1773663-d17e-468a-b851-f762f2759e6c",
      project_id: "p1-uuid",
      name: "Traffic_Sign_Detection",
      description: "YOLOv8 training dataset for urban traffic signs.",
      current_version: "v1.2",
      total_images: 1500,
      annotated_images: 1200,
      role: "admin"
    },
    {
      id: "a2223663-b27e-422a-b851-a123f2759e11",
      project_id: "p1-uuid",
      name: "Pedestrian_Safety_Dataset",
      description: "Night vision infrared images for pedestrian detection.",
      current_version: "v1.0",
      total_images: 800,
      annotated_images: 250,
      role: "viewer"
    }
  ];

  const [deletedDatasetIds, setDeletedDatasetIds] = useState<string[]>([]);
  const [permanentDeletedIds, setPermanentDeletedIds] = useState<string[]>([]);

  const activeDatasets = datasets.filter(
    ds => !deletedDatasetIds.includes(ds.id) && !permanentDeletedIds.includes(ds.id)
  );

  const archivedDatasets = datasets.filter(
    ds => deletedDatasetIds.includes(ds.id) && !permanentDeletedIds.includes(ds.id)
  );

  const filteredDatasets = activeDatasets.filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ds.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || ds.role === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleDeleteDataset = (id: string) => {
    setDeletedDatasetIds(prev => [...prev, id]);
  };

  const handleRecoverDataset = (id: string) => {
    setDeletedDatasetIds(prev => prev.filter(item => item !== id));
  };

  const handlePermanentDelete = (id: string) => {
    setPermanentDeletedIds(prev => [...prev, id]);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t('datasets.title')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('datasets.description')}
          </p>
        </div>
        
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

          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all h-9 font-medium">
            <Database className="mr-2 h-4 w-4" /> {t('datasets.create_new')}
          </Button>

          {/* Dinamik Role Filtresi */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex h-9 w-40 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none text-slate-700 font-medium"
            >
              <option value="ALL">✨ {t('filter.all_roles')}</option>
              <option value="ADMIN">{t('filter.roles.admin')}</option>
              <option value="ANNOTATOR">{t('filter.roles.annotator')}</option>
              <option value="VIEWER">{t('filter.roles.viewer')}</option>
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
            {t('trash.title')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDatasets.map((ds) => {
          const progress = Math.round((ds.annotated_images / ds.total_images) * 100);
          
          return (
            <Card key={ds.id} className="relative overflow-hidden border-2 hover:border-indigo-200 transition-all group">
              <div className="absolute top-0 right-0 flex flex-col items-end z-10">
                {/* Dinamik Kart Rol Alanı */}
                <div className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg border-b border-l",
                  ds.role === 'admin' ? "bg-amber-100 text-amber-700 border-amber-200" : 
                  ds.role === 'viewer' ? "bg-slate-100 text-slate-600 border-slate-200" :
                  "bg-blue-100 text-blue-700 border-blue-200"
                )}>
                  <span className="flex items-center gap-1">
                    <Shield size={10} /> {t(`filter.roles.${ds.role}`)}
                  </span>
                </div>
                
                <button
                  onClick={() => handleDeleteDataset(ds.id)}
                  className="mt-2 mr-2 p-1.5 rounded-md bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100 border border-rose-200 shadow-sm"
                  title="Move to Trash"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <span className="text-[10px] font-mono bg-indigo-50 px-2 py-0.5 rounded italic">
                    {ds.current_version}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-800 leading-none pr-16">
                  {ds.name.replace(/_/g, ' ')}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2 leading-relaxed italic text-slate-500">
                  {ds.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                      {t('datasets.total')}
                    </p>
                    <div className="flex items-center gap-2 text-slate-700">
                      <ImageIcon size={14} className="text-slate-400" />
                      <span className="font-bold">{ds.total_images}</span>
                    </div>
                  </div>
                  <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                    <p className="text-[10px] text-green-600/70 uppercase font-bold mb-1">
                      {t('datasets.annotated')}
                    </p>
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 size={14} />
                      <span className="font-bold">{ds.annotated_images}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{t('datasets.progress')}</span>
                    <span className="text-indigo-600">%{progress}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50/80 border-t p-4 flex gap-3 mt-2">
                <Button variant="outline" size="sm" className="flex-1 text-[11px] font-bold h-9 border-2 hover:bg-white">
                  {t('datasets.view_data')}
                </Button>
                <Button 
                  size="sm" disabled={ds.role !== 'admin'}
                  className={cn(
                    "flex-1 text-[11px] font-bold h-9 shadow-sm",
                    ds.role === 'admin' ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> {t('datasets.members')}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Trash2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-lg">{t('trash.modal_title')}</h3>
              </div>
              <button onClick={() => setIsTrashOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[200px]">
              {archivedDatasets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Trash2 size={40} className="mx-auto text-slate-200" />
                  <p className="text-sm">{t('trash.empty')}</p>
                </div>
              ) : (
                archivedDatasets.map((ds) => (
                  <div key={ds.id} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{ds.name.replace(/_/g, ' ')}</h4>
                      <p className="text-xs text-slate-400 capitalize">Version: {ds.current_version} | Role: {t(`filter.roles.${ds.role}`)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" variant="outline" onClick={() => handleRecoverDataset(ds.id)}
                        className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold gap-1.5"
                      >
                        <RotateCcw size={13} /> {t('trash.recover')}
                      </Button>

                      <Button 
                        size="sm" variant="outline" onClick={() => handlePermanentDelete(ds.id)}
                        className="h-8 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold gap-1.5"
                      >
                        <Trash2 size={13} /> {t('trash.permanent_delete')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsTrashOpen(false)} className="bg-slate-800 hover:bg-slate-900 text-xs font-medium">
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsPage;