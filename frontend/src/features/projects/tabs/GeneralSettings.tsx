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
    project_type: string;
    dataset_id: string;
    status?: string;
  };
  onUpdate: (data: any) => void;
}

const GeneralSettings = ({ project, onUpdate }: GeneralSettingsProps) => {
  const { t } = useTranslation();
  
  // Tamamen yalıtılmış yerel form state'i
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project_type: "object_detection",
    status: "ACTIVE"
  });

  // Sadece project nesnesinin benzersiz kimliği (id) değiştiğinde veya ilk yüklemede senkronize et
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        project_type: project.project_type || "object_detection",
        status: project.status || "ACTIVE"
      });
    }
  }, [project?.id]);

  // Kullanıcı klavyeden yazarken SADECE yerel state güncellenir (Donma/Focus kaybı yaşanmaz)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Kullanıcı input alanından çıktığı an (onBlur) veya seçim değiştirdiğinde üst bileşene bildirir
  const pushChanges = (currentData: typeof formData) => {
    // Gerçekten bir değişiklik var mı kontrolü (gereksiz render önlemek için)
    const hasChanged = 
      currentData.name !== (project?.name || "") ||
      currentData.description !== (project?.description || "") ||
      currentData.project_type !== (project?.project_type || "object_detection") ||
      currentData.status !== (project?.status || "ACTIVE");

    if (hasChanged) {
      onUpdate(currentData);
    } else {
      onUpdate(null); // Değişiklik yoksa boşalt
    }
  };

  const handleBlur = () => {
    pushChanges(formData);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updated = { ...formData, project_type: e.target.value };
    setFormData(updated);
    pushChanges(updated);
  };

  const handleStatusChange = (newStatus: string) => {
    const updated = { ...formData, status: newStatus };
    setFormData(updated);
    pushChanges(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings size={20} className="text-slate-400" /> {t('project_general.metadata', 'Project Metadata')}
          </h3>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.project_name', 'Project Name')}</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={t('project_general.placeholder_name', 'Project Name')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.description', 'Description')}</label>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={t('project_general.placeholder_desc', 'Description')}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.task_type', 'Task Type')}</label>
                <select 
                  name="project_type"
                  className="w-full h-10 px-3 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  value={formData.project_type}
                  onChange={handleSelectChange}
                >
                  <option value="object_detection">{t('project_general.tasks.object_detection', 'Object Detection')}</option>
                  <option value="entity_recognition">{t('project_general.tasks.entity_recognition', 'Entity Recognition')}</option>
                  <option value="semantic_relation">{t('project_general.tasks.semantic_relation', 'Semantic Relation')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">{t('project_general.privacy_status', 'Privacy Status')}</label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={formData.status === 'ACTIVE' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1 font-bold"
                    onClick={() => handleStatusChange('ACTIVE')}
                  >
                    <Globe className="mr-2 h-4 w-4" /> {t('project_general.public', 'Public')}
                  </Button>
                  <Button 
                    type="button"
                    variant={formData.status === 'ARCHIVED' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1 font-bold"
                    onClick={() => handleStatusChange('ARCHIVED')}
                  >
                    <Lock className="mr-2 h-4 w-4" /> {t('project_general.private', 'Private')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tehlikeli Alan */}
      <Card className="border-red-100 bg-red-50/30 dark:bg-red-950/10">
        <CardContent className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900 dark:text-slate-200">{t('project_general.delete_project', 'Delete Project')}</p>
              <p className="text-xs text-red-600 dark:text-red-400">{t('project_general.delete_warning', 'Once deleted, projects cannot be recovered.')}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" className="font-bold">
            <Trash2 className="mr-2 h-4 w-4" /> {t('project_general.delete_project', 'Delete Project')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;