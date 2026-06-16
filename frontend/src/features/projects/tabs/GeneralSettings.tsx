import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Trash2, AlertCircle } from "lucide-react";

interface GeneralSettingsProps {
  project: {
    id: string;
    name: string;
    description?: string;
  };
  isAdmin?: boolean;
  onUpdate: (data: any) => void;
  onDelete?: () => void;
}

const GeneralSettings = ({ project, isAdmin = false, onUpdate, onDelete }: GeneralSettingsProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
      });
    }
  }, [project]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const pushChanges = (currentData: typeof formData) => {
    const origName = project?.name || "";
    const origDesc = project?.description || "";

    const hasChanged =
      currentData.name.trim() !== origName.trim() ||
      currentData.description.trim() !== origDesc.trim();

    if (hasChanged) {
      onUpdate({
        name: currentData.name,
        description: currentData.description,
      });
    } else {
      onUpdate(null);
    }
  };

  const handleBlur = () => {
    pushChanges(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings size={20} className="text-slate-400" />
            {t('project_general.metadata', 'Project Metadata')}
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                {t('project_general.project_name', 'Project Name')}
              </label>

              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={isAdmin ? handleBlur : undefined}
                readOnly={!isAdmin}
                className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                {t('project_general.description', 'Description')}
              </label>

              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={isAdmin ? handleBlur : undefined}
                readOnly={!isAdmin}
                className={`min-h-[100px] ${!isAdmin ? "bg-muted cursor-not-allowed" : ""}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
      <Card className="border-red-100 bg-red-50/30 dark:bg-red-950/10">
        <CardContent className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertCircle
                className="text-red-600 dark:text-red-400"
                size={20}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-red-900 dark:text-slate-200">
                {t('project_general.delete_project', 'Delete Project')}
              </p>

              <p className="text-xs text-red-600 dark:text-red-400">
                {t(
                  'project_general.delete_warning',
                  'Once deleted, projects cannot be recovered.'
                )}
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="font-bold cursor-pointer"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('project_general.delete_project', 'Delete Project')}
          </Button>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default GeneralSettings;