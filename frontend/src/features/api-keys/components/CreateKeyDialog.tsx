import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Check, AlertTriangle, Loader2, Key } from 'lucide-react';
import {
  apiKeyService,
  type CreateApiKeyResponse,
  type CreateApiKeyPayload,
} from '../services/apiKeyService';
import notificationService from '@/shared/services/notification/notification.service';

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  onCreated: () => void;
}

export const CreateKeyDialog: React.FC<CreateKeyDialogProps> = ({
  open,
  onOpenChange,
  datasetId,
  onCreated,
}) => {
  const { t } = useTranslation(['api-keys', 'common']);
  const [name, setName] = useState('');
  const [ttlDays, setTtlDays] = useState<string>('');
  const [targetVersion, setTargetVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setName('');
    setTtlDays('');
    setTargetVersion('');
    setError(null);
    setCreatedKey(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('api-keys:messages.name_required'));
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const payload: CreateApiKeyPayload = { name: trimmedName };
      const ttl = parseInt(ttlDays, 10);
      if (ttlDays && !isNaN(ttl) && ttl > 0) payload.ttl_days = ttl;
      if (targetVersion.trim()) payload.target_version = targetVersion.trim();

      const result = await apiKeyService.create(datasetId, payload);
      setCreatedKey(result);
      onCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('api-keys:messages.create_failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdKey?.key) return;
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      notificationService.success(t('common:status.success_copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notificationService.error(t('common:status.error_general'));
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return t('api-keys:table.never_expires');
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Success state - show key and hide form
  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {t('api-keys:create_dialog.success_title')}
            </DialogTitle>
            <DialogDescription>
              {t('api-keys:create_dialog.success_message')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700 dark:text-amber-400 text-sm font-semibold">
                {t('api-keys:create_dialog.security_alert')}
              </AlertTitle>
              <AlertDescription className="text-amber-600/80 dark:text-amber-400/80 text-xs mt-1">
                {t('api-keys:security_warning.message')}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('api-keys:create_dialog.name_label')}</Label>
                <p className="text-sm font-medium">{name}</p>
              </div>
              {createdKey.target_version && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t('api-keys:create_dialog.version_label')}</Label>
                  <p className="text-sm font-medium">{createdKey.target_version}</p>
                </div>
              )}
              {createdKey.expires_at && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t('api-keys:table.column_expires')}</Label>
                  <p className="text-sm font-medium">{formatDate(createdKey.expires_at)}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted border border-border px-3 py-2 rounded-lg font-mono text-xs break-all select-all">
                  {createdKey.key}
                </code>
                <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full sm:w-auto">
              {t('api-keys:create_dialog.done_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Form state
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('api-keys:create_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('api-keys:create_dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="key-name">{t('api-keys:create_dialog.name_label')}</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('api-keys:create_dialog.name_placeholder')}
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ttl-days">{t('api-keys:create_dialog.ttl_label')}</Label>
              <Input
                id="ttl-days"
                type="number"
                min={1}
                max={3650}
                value={ttlDays}
                onChange={(e) => setTtlDays(e.target.value)}
                placeholder={t('api-keys:create_dialog.ttl_placeholder')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="target-version">{t('api-keys:create_dialog.version_label')}</Label>
              <Input
                id="target-version"
                value={targetVersion}
                onChange={(e) => setTargetVersion(e.target.value)}
                placeholder={t('api-keys:create_dialog.version_placeholder')}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('api-keys:create_dialog.cancel_button')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('api-keys:create_dialog.create_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
