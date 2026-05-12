import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileCode, Archive, CheckCircle2, Loader2 } from "lucide-react";

const ExportManager = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('coco');

  const formats = [
    { id: 'coco', name: 'COCO JSON', icon: FileJson, desc: 'Common Objects in Context' },
    { id: 'yolo', name: 'YOLO v8', icon: FileCode, desc: 'Darknet / PyTorch format' },
    { id: 'pascal', name: 'Pascal VOC', icon: Archive, desc: 'XML format for object detection' },
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
          <h3 className="text-lg font-bold">Export Dataset</h3>
          <p className="text-sm text-muted-foreground">Download your annotations in industry standard formats.</p>
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
              <h4 className="text-sm font-semibold">Ready to Generate</h4>
              <p className="text-xs text-muted-foreground">This will package all annotated assets into a {selectedFormat.toUpperCase()} file.</p>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Export Now
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