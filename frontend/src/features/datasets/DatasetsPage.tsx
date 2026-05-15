import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, UserPlus, Image as ImageIcon, CheckCircle2, Shield } from "lucide-react";
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
  // Parantez içini boş bıraktık, böylece varsayılan olarak common.json'dan okuyacak
  const { t } = useTranslation(); 

  const [datasets] = useState<Dataset[]>([
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
      role: "annotator"
    }
  ]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t('datasets.title')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('datasets.description')}
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all">
          <Database className="mr-2 h-4 w-4" /> {t('datasets.create_new')}
        </Button>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {datasets.map((ds) => {
          const progress = Math.round((ds.annotated_images / ds.total_images) * 100);
          
          return (
            <Card key={ds.id} className="relative overflow-hidden border-2 hover:border-indigo-200 transition-all group">
              {/* Role Badge */}
              <div className={cn(
                "absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg border-b border-l",
                ds.role === 'admin' ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-blue-100 text-blue-700 border-blue-200"
              )}>
                <span className="flex items-center gap-1">
                  <Shield size={10} /> {ds.role}
                </span>
              </div>

              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <span className="text-[10px] font-mono bg-indigo-50 px-2 py-0.5 rounded italic">
                    {ds.current_version}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-800 leading-none">
                  {ds.name.replace(/_/g, ' ')}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2 leading-relaxed italic text-slate-500">
                  {ds.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
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

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">
                      {t('datasets.progress')}
                    </span>
                    <span className="text-indigo-600">%{progress}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50/80 border-t p-4 flex gap-3 mt-2">
                <Button variant="outline" size="sm" className="flex-1 text-[11px] font-bold h-9 border-2 hover:bg-white">
                  {t('datasets.view_data')}
                </Button>
                <Button 
                  size="sm" 
                  disabled={ds.role !== 'admin'}
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
    </div>
  );
};

export default DatasetsPage;