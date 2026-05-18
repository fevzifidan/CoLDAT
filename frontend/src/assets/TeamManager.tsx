// frontend/src/assets/TeamManager.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // i18n hook'u eklendi
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Mail, 
  Trash2, 
  X,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TeamManager = () => {
  const { t } = useTranslation(); // t fonksiyonu tanımlandı

  const [isAdding, setIsAdding] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Labeler");
  
  const [team, setTeam] = useState([
    { id: 1, name: "Muzaffer Göktuğ", email: "goktug@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Pending User", email: "test@example.com", role: "Labeler", status: "Invited" }
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const newUser = {
      id: Date.now(),
      name: email.split('@')[0], 
      email: email,
      role: role,
      status: "Invited"
    };

    setTeam([...team, newUser]);
    setIsAdding(false);
    alert(t("team.alert_invited", { email: email })); // Parametreli alert kullanımı
    setEmail("");
  };

  const removeUser = (id: number) => {
    setTeam(team.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{t("team.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("team.description")}</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className={isAdding ? "bg-slate-200 text-slate-700" : "bg-indigo-600"}
        >
          {isAdding ? <><X className="mr-2 h-4 w-4" /> {t("team.cancel")}</> : <><UserPlus className="mr-2 h-4 w-4" /> {t("team.add_member")}</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-100 bg-indigo-50/20 shadow-sm animate-in slide-in-from-top-2">
          <CardContent className="p-6">
            <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">{t("team.email_label")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="user@example.com" 
                    className="pl-9" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                </div>
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">{t("team.role_label")}</label>
                <select 
                  className="w-full h-10 px-3 py-2 bg-white border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Admin">{t("team.roles.admin")}</option>
                  <option value="Manager">{t("team.roles.manager")}</option>
                  <option value="Labeler">{t("team.roles.labeler")}</option>
                  <option value="Reviewer">{t("team.roles.reviewer")}</option>
                </select>
              </div>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {t("team.send_invitation")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {team.map((user) => (
          <Card key={user.id} className="hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <Badge variant="outline" className="text-[10px] h-5 py-0">
                      {t(`team.roles.${user.role.toLowerCase()}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.status === "Active" ? (
                  <div className="flex items-center text-green-600 text-[10px] font-bold gap-1">
                    <CheckCircle2 size={12} /> {t("team.status.active")}
                  </div>
                ) : (
                  <div className="text-orange-500 text-[10px] font-bold">{t("team.status.invited")}</div>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-300 hover:text-red-500"
                  onClick={() => removeUser(user.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamManager;