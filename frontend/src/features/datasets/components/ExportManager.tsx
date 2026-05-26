// frontend/src/assets/ExportManager.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // i18n hook'u eklendi
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileCode, Archive, CheckCircle2, Loader2 } from "lucide-react";

const ExportManager = () => {
  const { t } = useTranslation(); // t fonksiyonu tanımlandı

  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('coco');

  const formats = [
    { id: 'coco', name: 'COCO JSON', icon: FileJson, desc: t("export.formats.coco_desc") },
    { id: 'yolo', name: 'YOLO v8', icon: FileCode, desc: t("export.formats.yolo_desc") },
    { id: 'pascal', name: 'Pascal VOC', icon: Archive, desc: t("export.formats.pascal_desc") },
  ];

  const handleExport = () => {
    setIsExporting(true);
    // Simüle edilmiş export süreci
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{t("export.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("export.description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formats.map((format) => {
          const Icon = format.icon;
          return (
            <Card 
              key={format.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedFormat === format.id ? 'border-indigo-600 bg-indigo-50/30' : 'hover:border-slate-300'
              }`}
              onClick={() => setSelectedFormat(format.id)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl mb-4 ${selectedFormat === format.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon size={24} />
                </div>
                <h4 className="font-bold text-sm">{format.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{format.desc}</p>
                {selectedFormat === format.id && (
                  <CheckCircle2 size={16} className="text-indigo-600 mt-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{t("export.ready_title")}</h4>
              <p className="text-xs text-muted-foreground">
                {t("export.ready_desc", { format: selectedFormat === 'pascal' ? 'Pascal VOC' : selectedFormat.toUpperCase() })}
              </p>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("export.btn_generating")}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> {t("export.btn_export_now")}
                </>
              )}
            </Button>
          </div>
          
          {/* Progress Bar (Simüle) */}
          {isExporting && (
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-progress-stripes transition-all" style={{ width: '60%' }}></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportManager;