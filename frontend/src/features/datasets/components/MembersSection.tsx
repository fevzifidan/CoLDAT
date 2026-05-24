// src/features/datasets/components/MembersSection.tsx
import { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  user: { username: string; email: string };
  role: 'owner' | 'editor' | 'viewer';
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
      // Servis katmanında array temizlendiği için doğrudan set edilebilir
      setMembers(Array.isArray(data) ? data : []); 
    } catch {
      toast.error("Üyeler yüklenemedi.");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await memberService.updateMember(datasetId, memberId, newRole);
      fetchMembers();
      toast.success("Rol güncellendi.");
    } catch {
      toast.error("Rol güncellenirken hata oluştu.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await memberService.removeMember(datasetId, memberId);
      fetchMembers();
      toast.success("Üye silindi.");
    } catch {
      toast.error("Üye silinirken hata oluştu.");
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
                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{m.user?.username || "Bilinmeyen Kullanıcı"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.user?.email || ""}</p>
              </div>
              <div className="flex gap-2 items-center">
                <select 
                  value={m.role} 
                  onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                  className="text-xs border rounded p-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:border-slate-700 focus:outline-none"
                >
                  <option value="owner">Owner</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
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