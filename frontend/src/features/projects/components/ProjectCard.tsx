// src/features/projects/components/ProjectCard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Settings, Eye } from "lucide-react";

// Tipi burada tanımlıyoruz (Hata almamak için)
interface Project {
  id: string | number;
  name: string;
  status: string;
  task: string;
  count: number;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  // AuthContext'ten gelen rolü kontrol et
  const userRole = (user as any)?.role?.toLowerCase() || 'viewer'; 

  return (
    <Card className="group relative overflow-hidden rounded-[2rem] border-none bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
      <CardHeader className="pb-2 text-left p-5">
        <div className="flex justify-between items-start mb-1">
          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter rounded-lg border-red-100 text-red-600 bg-red-50/30 px-2 py-0.5">
            {project.status === "In Progress" ? t('dashboard.in_progress') : project.status}
          </Badge>
          
          {/* TEST: Sadece admin ise dişli çark ikonunu gösterir */}
          {userRole === 'admin' && (
            <Settings className="w-3.5 h-3.5 text-slate-300 hover:text-red-600 cursor-pointer transition-colors" />
          )}
        </div>
        
        <CardTitle className="text-base font-bold text-slate-800 leading-tight group-hover:text-red-600 transition-colors">
          {project.name}
        </CardTitle>
        <CardDescription className="text-[11px] font-medium leading-none mt-1 uppercase tracking-tight text-slate-400">
          {project.task}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-left px-5 py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tighter text-slate-900">
            {project.count}
          </span>
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
            Files
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-2">
        <Button 
          className="w-full rounded-xl h-9 bg-slate-50 text-slate-600 hover:bg-[#e10613] hover:text-white border-none font-bold text-[10px] transition-all" 
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          {/* Rol bazlı buton metni testi */}
          {userRole === 'admin' ? "MANAGE PROJECT" : 
           userRole === 'annotator' ? "START LABELING" : "VIEW DETAILS"}

          {userRole === 'viewer' ? (
            <Eye className="ml-1 w-3 h-3 opacity-50" />
          ) : (
            <ArrowUpRight className="ml-1 w-3 h-3 opacity-50 group-hover:opacity-100" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};