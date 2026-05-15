// src/features/api-keys/pages/ApiKeysPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CreateKeyModal } from "./components/CreateKeyModal";

export default function ApiKeysPage() {
  const { t } = useTranslation(); // defaultNS common.json'dan okur
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [keys, setKeys] = useState([
    { id: 1, name: "Initial_Project", key: "sk-coldat-••••4a21", createdAt: "2026-05-10", status: "Active" },
  ]);

  const handleAddNewKey = (newKey: any) => {
    setKeys((prevKeys) => [newKey, ...prevKeys]); 
  };

  const deleteKey = (id: number) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sidebar.api_keys")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("api_keys.description")}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          {t("api_keys.create_new")}
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">{t("api_keys.table.name")}</TableHead>
              <TableHead>{t("api_keys.table.key")}</TableHead>
              <TableHead>{t("api_keys.table.created_at")}</TableHead>
              <TableHead>{t("api_keys.table.status")}</TableHead>
              <TableHead className="text-right">{t("api_keys.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length > 0 ? (
              keys.map((item) => (
                <TableRow key={item.id} className="animate-in slide-in-from-top-1 duration-300">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.key}</TableCell>
                  <TableCell>{item.createdAt}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <ShieldCheck size={12} />
                      {item.status === "Active" ? t("dashboard.status.in_progress") || "Active" : item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => deleteKey(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t("api_keys.no_keys")}
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateKeyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onKeyCreated={handleAddNewKey}
      />
    </div>
  );
}