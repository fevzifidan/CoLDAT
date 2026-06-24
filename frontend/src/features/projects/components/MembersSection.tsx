// src/features/datasets/components/MembersSection.tsx
import { useState, useEffect } from 'react';
import { memberService } from '../../datasets/services/memberService';
import { Button } from "@/components/ui/button";
import notificationService from '@/shared/services/notification/notification.service';
import { UserPlus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// API spec response: { id: uuid, user_id: uuid, username: string, role: "annotator" | "viewer" }
interface Member {
  id: string;
  user_id: string;
  username: string;
  role: 'annotator' | 'viewer';
}

export const MembersSection = ({ datasetId }: { datasetId: string }) => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (datasetId) {
      fetchMembers();
    }
  }, [datasetId]);

  const fetchMembers = async () => {
    try {
      const data = await memberService.getMembers(datasetId);
      setMembers(Array.isArray(data) ? data : []); 
        } catch {
      notificationService.error("Üyeler yüklenemedi.");
    }
  };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await memberService.updateMember(datasetId, memberId, newRole);
      fetchMembers();
      notificationService.success("Rol güncellendi.");
    } catch {
      notificationService.error("Rol güncellenirken hata oluştu.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await memberService.removeMember(datasetId, memberId);
      fetchMembers();
      notificationService.success("Üye silindi.");
    } catch {
      notificationService.error("Üye silinirken hata oluştu.");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-xl dark:border-slate-800">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">Dataset Üyeleri</h3>
        <Button size="sm"><UserPlus size={16} className="mr-2" /> Üye Ekle</Button>
      </div>

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Bu dataset'e kayıtlı üye bulunamadı.</p>
        ) : (
                    members.map((m) => (
            <div key={m.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800">
              <div>
                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{m.username || "Bilinmeyen Kullanıcı"}</p>
              </div>
              <div className="flex gap-2 items-center">
                                <Select 
                  value={m.role} 
                  onValueChange={(newRole) => handleUpdateRole(m.id, newRole)}
                >
                  <SelectTrigger className="h-8 text-xs w-24 bg-white dark:bg-slate-800 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                        <SelectItem value="annotator" className="text-xs">Annotator</SelectItem>
                    <SelectItem value="viewer" className="text-xs">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.id)} className="h-8 w-8 p-0 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                  <Trash2 size={14} className="text-rose-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};