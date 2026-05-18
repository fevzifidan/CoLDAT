// src/features/dashboard/components/ProjectCard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Settings, Eye } from "lucide-react";
import type { Project } from '@/shared/utils/projectsData';

interface ProjectCardProps {
  project: Project;
  cardType: 'task' | 'dataset' | 'project';
}

export const ProjectCard = ({ project, cardType }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Rol bilgisini alıyoruz, eğer yoksa dökümanda belirtilen rollerden birini (viewer) varsayılan atıyoruz
  const rawRole = project.role?.toLowerCase() || 'viewer';

  const handleNavigate = () => {
    const paths = {
      task: `/tasks/${project.id}`,
      dataset: `/datasets/${project.id}`,
      project: `/projects/${project.id}`
    };
    navigate(paths[cardType]);
  };

  const getButtonConfig = () => {
    if (rawRole === 'admin') return { text: t('dashboard.buttons.manage'), icon: <Settings className="ml-1 w-3 h-3" /> };
    if (cardType === 'task') return { text: t('dashboard.buttons.start_labeling'), icon: <ArrowUpRight className="ml-1 w-3 h-3" /> };
    return { text: t('dashboard.buttons.open'), icon: <Eye className="ml-1 w-3 h-3" /> };
  };

  const buttonConfig = getButtonConfig();

  return (
    <Card className="group relative overflow-hidden rounded-[2rem] border-none bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
      <CardHeader className="pb-2 text-left p-5">
        <div className="flex justify-between items-start mb-1">
          {/* KRİTİK DÜZELTME: Sadece Task kartları status içerir. Proje ve Dataset kartlarında sadece Rol olmalı. */}
          {cardType === 'task' ? (
            <Badge variant="outline" className="text-[9px] font-bold uppercase rounded-lg border-red-100 text-red-600 bg-red-50/30 px-2 py-0.5">
              {t(`dashboard.status.${project.status?.toLowerCase().replace(" ", "_")}`)}
            </Badge>
          ) : (
            // Proje ve Dataset kartlarında 'Atanmış Görev Yok' yerine direkt Rol yazıyoruz
            <Badge variant="secondary" className="text-[8px] opacity-70 uppercase px-2 py-0">
              {t(`dashboard.roles.${rawRole.replace(/ /g, '_')}`)}
            </Badge>
          )}
        </div>

        <CardTitle className="text-base font-bold text-slate-800 leading-tight group-hover:text-red-600 transition-colors">
          {project.name}
        </CardTitle>
        
        <CardDescription className="text-[11px] font-medium leading-none mt-1 uppercase tracking-tight text-slate-400">
          {t(`dashboard.tasks.${project.task?.toLowerCase().replace(" ", "_")}`)}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-left px-5 py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tighter text-slate-900">{project.count}</span>
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest italic">
            {t('dashboard.files')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-2">
        <Button 
          className="w-full rounded-xl h-9 bg-slate-50 text-slate-600 hover:bg-[#e10613] hover:text-white border-none font-bold text-[10px] transition-all" 
          onClick={handleNavigate}
        >
          {buttonConfig.text}
          {buttonConfig.icon}
        </Button>
      </CardFooter>
    </Card>
  );
};