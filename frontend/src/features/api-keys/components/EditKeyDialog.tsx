import React, { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Save } from 'lucide-react';
import { apiKeyService, type ApiKey } from '../services/apiKeyService';
import notificationService from '@/shared/services/notification/notification.service';

interface EditKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  apiKey: ApiKey;
  onUpdated: () => void;
}

export const EditKeyDialog: React.FC<EditKeyDialogProps> = ({
  open,
  onOpenChange,
  datasetId,
  apiKey,
  onUpdated,
}) => {
  const { t } = useTranslation(['api-keys', 'common']);
  const [name, setName] = useState(apiKey.name);
  const [isActive, setIsActive] = useState(apiKey.is_active);
  const [extendTtlDays, setExtendTtlDays] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(apiKey.name);
      setIsActive(apiKey.is_active);
      setExtendTtlDays('');
      setError(null);
    }
  }, [open, apiKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: { name?: string; ttl_days?: number; is_active?: boolean } = {};
      if (name.trim() !== apiKey.name) payload.name = name.trim();
      if (isActive !== apiKey.is_active) payload.is_active = isActive;
      const ttl = parseInt(extendTtlDays, 10);
      if (extendTtlDays && !isNaN(ttl) && ttl > 0) payload.ttl_days = ttl;

      if (Object.keys(payload).length === 0) {
        onOpenChange(false);
        return;
      }

      await apiKeyService.update(datasetId, apiKey.id, payload);
      notificationService.success(t('api-keys:messages.update_success'));
      onUpdated();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('api-keys:messages.update_failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('api-keys:edit_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('api-keys:table.column_name')}: <span className="font-mono text-xs">{apiKey.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-key-name">{t('api-keys:edit_dialog.name_label')}</Label>
            <Input
              id="edit-key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="toggle-active" className="text-sm font-medium">
                {t('api-keys:edit_dialog.toggle_active')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isActive
                  ? t('api-keys:table.status_active')
                  : t('api-keys:table.status_inactive')}
              </p>
            </div>
            <Switch
              id="toggle-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="extend-ttl">{t('api-keys:edit_dialog.extend_ttl_label')}</Label>
            <Input
              id="extend-ttl"
              type="number"
              min={1}
              max={3650}
              value={extendTtlDays}
              onChange={(e) => setExtendTtlDays(e.target.value)}
              placeholder={t('api-keys:create_dialog.ttl_placeholder')}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {t('api-keys:edit_dialog.save_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
