// frontend/src/features/projects/tabs/GeneralSettings.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Trash2, Globe, Lock, AlertCircle } from "lucide-react";

interface GeneralSettingsProps {
  project: {
    id: string;
    name: string;
    description?: string;
    project_type: 'object_detection' | 'entity_recognition' | 'semantic_relation' | string;
    dataset_id: string;
    status?: string;
    task?: string | number;
  };
  onUpdate: (data: any) => void;
}

const GeneralSettings = ({ project, onUpdate }: GeneralSettingsProps) => {
  const { t } = useTranslation();
  
  // Form verilerini backend alan adlarıyla (project_type, status) senkronize ediyoruz
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    project_type: project?.project_type || "object_detection",
    status: project?.status || "ACTIVE"
  });

  // Üst bileşenden (ProjectDetailPage) asenkron veri geldiğinde formun içini doldurmasını garanti ediyoruz
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        project_type: project.project_type || "object_detection",
        status: project.status || "ACTIVE"
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData); 
  };

  const handleStatusChange = (newStatus: string) => {
    const updatedData = { ...formData, status: newStatus };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings size={20} className="text-slate-400" /> {t('project_general.metadata')}
          </h3>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.project_name')}</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('project_general.placeholder_name')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.description')}</label>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('project_general.placeholder_desc')}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.task_type')}</label>
                <select 
                  name="project_type"
                  className="w-full h-10 px-3 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer dark:bg-slate-900"
                  value={formData.project_type}
                  onChange={handleChange}
                >
                  <option value="object_detection">{t('project_general.tasks.object_detection', 'Object Detection')}</option>
                  <option value="entity_recognition">{t('project_general.tasks.entity_recognition', 'Entity Recognition')}</option>
                  <option value="semantic_relation">{t('project_general.tasks.semantic_relation', 'Semantic Relation')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.privacy_status')}</label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={formData.status === 'ACTIVE' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleStatusChange('ACTIVE')}
                  >
                    <Globe className="mr-2 h-4 w-4" /> {t('project_general.public')}
                  </Button>
                  <Button 
                    type="button"
                    variant={formData.status === 'ARCHIVED' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleStatusChange('ARCHIVED')}
                  >
                    <Lock className="mr-2 h-4 w-4" /> {t('project_general.private')}
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
              <p className="text-sm font-bold text-red-900">{t('project_general.delete_project')}</p>
              <p className="text-xs text-red-600">{t('project_general.delete_warning')}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> {t('project_general.delete_project')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;