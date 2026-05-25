// frontend/src/assets/TeamManager.tsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Trash2, 
  X,
  CheckCircle2,
  Loader2,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { projectService } from '@/features/projects/services/projectService';
import { toast } from 'sonner';

interface TeamMember {
  id: string; // Backend'den dönen membership_id (UUID)
  name?: string;
  email?: string;
  username?: string;
  role: string; // 'admin', 'manager', 'annotator', 'viewer'
  status?: string;
}

interface TeamManagerProps {
  projectId: string;
}

const TeamManager = ({ projectId }: TeamManagerProps) => {
  const { t } = useTranslation(['pages', 'common']);
  
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // 🎯 YAML COLDAT API UYUMLULUĞU: 
  // Backend rolleri küçük harf olarak beklediği için varsayılan değeri "annotator" yapıyoruz.
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("annotator");

  // Projedeki üyeleri listeleme fonksiyonu
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getProjectMembers(projectId);
      
      let membersData = [];
      if (response && (response as any).data) {
        membersData = (response as any).data;
      } else if (Array.isArray(response)) {
        membersData = response;
      }

      setTeam(Array.isArray(membersData) ? membersData : []);
    } catch (error: any) {
      console.error("Üyeler çekilirken hata oluştu:", error);
      
      // Token / Oturum zaman aşımı kontrolü
      if (error.response?.status === 401 || error.response?.data?.detail?.includes("token")) {
        toast.error("Oturum süreniz dolmuş. Lütfen sayfayı yenileyip tekrar giriş yapın.");
      } else {
        toast.error(t('common:errors.fetch_failed', 'Üye listesi alınamadı.'));
      }
      setTeam([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId || projectId === "undefined") return;
    fetchMembers();
  }, [projectId]);

  // Yeni üye ekleme fonksiyonu
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Backend UUID formatı zorunlu tuttuğundan hatalı girdileri önceden engelliyoruz
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId.trim())) {
      toast.error("Lütfen geçerli bir kullanıcı UUID'si girin! (Örn: aca85218-c7ce-4353-bdf0-ded6f8f7a00b)");
      return;
    }

    try {
      // projectService.addProjectMember metoduna tam uyumlu küçük harfli rol ve id gönderimi
      await projectService.addProjectMember(projectId, { 
        user_id: userId.trim(), 
        role: role // 'admin', 'manager', 'annotator', 'viewer'
      });
      
      toast.success(t("team.alert_added", "Üye başarıyla projeye eklendi."));
      setUserId("");
      setIsAdding(false);
      fetchMembers();
    } catch (error: any) {
      console.error("Ekleme hatası detayı:", error.response?.data);
      
      const backendErrors = error.response?.data;
      
      // Token geçersizlik uyarısı
      if (error.response?.status === 401 || backendErrors?.detail?.includes("token")) {
        toast.error("Oturumunuzun süresi dolmuş! Lütfen çıkış yapıp tekrar giriş yapın.");
        return;
      }

      // 🎯 GELİŞMİŞ HATA YÖNETİMİ: 
      // Backend'den dizi veya obje halinde gelen tüm Django doğrulama mesajlarını yakalıyoruz
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        toast.error(backendErrors[0]);
      } else if (backendErrors && typeof backendErrors === 'object') {
        if (backendErrors.user_id) {
          toast.error(`Kullanıcı Hatası: ${backendErrors.user_id.join(', ')}`);
        } else if (backendErrors.role) {
          toast.error(`Rol Hatası: ${backendErrors.role.join(', ')}`);
        } else if (backendErrors.non_field_errors) {
          toast.error(backendErrors.non_field_errors.join(', '));
        } else if (backendErrors.detail) {
          toast.error(backendErrors.detail);
        } else {
          toast.error("Üye eklenemedi. Girilen UUID sistemde kayıtlı olmayabilir.");
        }
      } else {
        toast.error(t("common:errors.save_failed", "İşlem başarısız."));
      }
    }
  };

  // Üye silme fonksiyonu
  const removeUser = async (membershipId: string) => {
    try {
      await projectService.removeProjectMember(projectId, membershipId);
      toast.success(t("team.removed_successfully", "Üye başarıyla silindi."));
      fetchMembers();
    } catch (error: any) {
      console.error("Silme hatası detayı:", error.response?.data);
      
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        toast.error("Oturum süresi dolmuş. İşlem gerçekleştirilemedi.");
        return;
      }

      // Django'dan gelen ["The project owner cannot be removed..."] gibi dizi hatalarını basar
      if (Array.isArray(errorData) && errorData.length > 0) {
        toast.error(errorData[0]); 
      } else if (errorData && errorData.detail) {
        toast.error(errorData.detail);
      } else {
        toast.error("Bu üye silinemez.");
      }
    }
  };

  // Backend'den gelen küçük/büyük harfli rollerin arayüzde şık görünmesini sağlar
  const getRoleLabel = (rawRole: string) => {
    const roles: Record<string, string> = {
      'OWNER': 'Owner (Proje Sahibi)',
      'ADMIN': 'Admin',
      'MANAGER': 'Manager',
      'ANNOTATOR': 'Labeler (Annotator)',
      'VIEWER': 'Reviewer (Viewer)',
      'REVIEWER': 'Reviewer (Viewer)'
    };
    return roles[rawRole.toUpperCase()] || rawRole;
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{t("team.title", "Team Management")}</h3>
          <p className="text-sm text-muted-foreground">{t("team.description", "Manage users and roles who have access to this project.")}</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? <><X className="mr-2 h-4 w-4" /> {t("common:status.cancel")}</> : <><UserPlus className="mr-2 h-4 w-4" /> {t("team.add_member", "Add Member")}</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-100 bg-indigo-50/20">
          <CardContent className="p-6">
            <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold uppercase">{t("team.user_id_label", "User UUID")}</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input value={userId} onChange={(e) => setUserId(e.target.value)} type="text" placeholder="aca85218-c7ce-4353-bdf0-ded6f8f7a00b" className="pl-9" required />
                </div>
              </div>
              
              <div className="w-full md:w-56 space-y-2">
                <label className="text-xs font-bold uppercase">{t("team.role_label", "Project Role")}</label>
                {/* 🎯 YAML DÜZELTMESİ: option value değerleri tam olarak OpenAPI dökümanında 
                    belirtildiği gibi küçük harflerle ("admin", "manager", "annotator", "viewer") gönderilir */}
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-10 px-3 border rounded-md text-sm outline-none bg-white text-slate-900">
                  <option value="admin">ADMIN</option>
                  <option value="manager">MANAGER</option>
                  <option value="annotator">ANNOTATOR (Labeler)</option>
                  <option value="viewer">VIEWER (Reviewer)</option>
                </select>
              </div>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{t("team.add", "Add Member")}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {(!team || team.length === 0) ? (
          <div className="text-center py-8 text-sm text-slate-400 border border-dashed rounded-xl">
            {t("team.no_members", "No members found in this project.")}
          </div>
        ) : (
          team.map((user) => {
            const userName = user?.name || user?.username || user?.email?.split('@')[0] || "User";
            const userEmail = user?.email || `ID: ${user?.id}`;
            const userRole = user?.role || "annotator";
            const isOwner = userRole.toUpperCase() === 'OWNER';

            return (
              <Card key={user?.id || Math.random().toString()}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{userName}</p>
                        <Badge variant={isOwner ? "default" : "outline"} className={isOwner ? "bg-amber-500 hover:bg-amber-600" : ""}>
                          {getRoleLabel(userRole)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-green-600 text-[10px] font-bold gap-1">
                      <CheckCircle2 size={12} /> {t("team.status.active", "Active")}
                    </div>
                    {/* Proje sahibinin (OWNER) silinmesi backend kurallarınca yasak olduğundan arayüzde Trash butonu gizlenir */}
                    {user?.id && !isOwner && (
                      <Button variant="ghost" size="icon" onClick={() => removeUser(user.id)}>
                        <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeamManager;