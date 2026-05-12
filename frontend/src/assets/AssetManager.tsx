// frontend/src/assets/AssetManager.tsx

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon, X, FilePlus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AssetManager = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [assets, setAssets] = useState([
    { id: 1, name: 'frame_001.jpg', size: '1.2 MB', status: 'Annotated' },
    { id: 2, name: 'frame_002.jpg', size: '850 KB', status: 'Pending' },
  ]);

  const handleUploadClick = () => {
    setIsUploading(!isUploading);
  };

  const deleteAsset = (id: number) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Üst Kontrol Paneli */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search assets..." className="pl-9 h-9" />
        </div>
        <Button 
          onClick={handleUploadClick}
          className={`${isUploading ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isUploading ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Upload className="mr-2 h-4 w-4" /> Upload Items</>}
        </Button>
      </div>

      {/* Upload Alanı (Koşullu Gösterim) */}
      {isUploading && (
        <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 animate-in zoom-in-95 duration-300">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <FilePlus className="text-indigo-600" size={28} />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Upload your images or videos</h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
              Drag and drop files here, or click to browse. Supports JPG, PNG, MP4.
            </p>
            <input type="file" id="file-upload" className="hidden" multiple />
            <Button variant="outline" className="mt-6 border-indigo-200 bg-white" onClick={() => document.getElementById('file-upload')?.click()}>
              Select Files
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Asset Listesi / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id} className="group overflow-hidden border-slate-200 hover:border-indigo-300 transition-all shadow-sm">
            <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
              <ImageIcon size={32} className="text-slate-300" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 rounded-full shadow-lg"
                  onClick={() => deleteAsset(asset.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-semibold truncate text-slate-700 w-32">{asset.name}</p>
                <Badge variant={asset.status === 'Annotated' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {asset.status}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-mono uppercase">{asset.size}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetManager;