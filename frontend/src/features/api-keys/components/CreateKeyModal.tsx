// src/features/api-keys/components/CreateKeyModal.tsx
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "../../../components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyCreated: (newKey: { id: number; name: string; key: string; createdAt: string; status: string }) => void;
}

export function CreateKeyModal({ isOpen, onClose, onKeyCreated }: CreateKeyModalProps) {
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleCreate = () => {
    // Gerçek anahtar (kullanıcının kopyalaması için)
    const rawKey = `sk-coldat-${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    
    // Tabloya gönderilecek maskelenmiş obje
    const newKeyObj = {
      id: Date.now(),
      name: keyName,
      key: `sk-coldat-••••${rawKey.slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: "Active"
    };
    
    setGeneratedKey(rawKey); // Modalda tam halini göster
    onKeyCreated(newKeyObj);  // Tabloya (parent) gönder
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
    }
  };

  const handleFinalClose = () => {
    setGeneratedKey(null);
    setKeyName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleFinalClose}>
      <DialogContent className="sm:max-w-[425px]">
        {!generatedKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Give your key a name to identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Key Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Production-Server" 
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!keyName}>Generate Key</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600 font-bold italic">
                <CheckCircle2 size={20} />
                Key Generated Successfully
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert variant="destructive" className="bg-amber-500/10 text-amber-900 border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs font-medium">
                  Güvenlik gereği bunu size tekrar göstermeyeceğiz. Lütfen şimdi kopyalayın.
                </AlertDescription>
              </Alert>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedKey} className="font-mono text-xs bg-muted" />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleFinalClose}>
                I have saved my key
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}