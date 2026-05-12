// frontend/src/features/projects/tabs/GeneralSettings.tsx
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Trash2, Globe, Lock, AlertCircle } from "lucide-react";

interface GeneralSettingsProps {
  project: any;
  onUpdate: (data: any) => void;
}

const GeneralSettings = ({ project, onUpdate }: GeneralSettingsProps) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    task: project.task,
    status: project.status
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    onUpdate({ ...formData, [name]: value }); // Üst bileşene (ProjectDetailPage) anlık ilet
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings size={20} className="text-slate-400" /> Project Metadata
          </h3>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Project Name</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g. Autonomous Driving Dataset"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Description</label>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the purpose of this dataset..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Task Type</label>
                <select 
                  name="task"
                  className="w-full h-10 px-3 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.task}
                  onChange={(any) => handleChange(any as any)}
                >
                  <option value="Object Detection">Object Detection</option>
                  <option value="Instance Segmentation">Instance Segmentation</option>
                  <option value="Classification">Classification</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Privacy Status</label>
                <div className="flex gap-2">
                  <Button 
                    variant={formData.status === 'Active' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setFormData({...formData, status: 'Active'})}
                  >
                    <Globe className="mr-2 h-4 w-4" /> Public
                  </Button>
                  <Button 
                    variant={formData.status === 'Archived' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setFormData({...formData, status: 'Archived'})}
                  >
                    <Lock className="mr-2 h-4 w-4" /> Private
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tehlikeli Alan */}
      <Card className="border-red-100 bg-red-50/30">
        <CardContent className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">Delete Project</p>
              <p className="text-xs text-red-600">This action is permanent and cannot be undone.</p>
            </div>
          </div>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;