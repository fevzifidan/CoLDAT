import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { apiKeyService } from '../services/apiKeyService';
import notificationService from '@/shared/services/notification/notification.service';

interface RevokeAllDialogProps {
  datasetId: string;
  datasetName: string;
  onRevoked: () => void;
}

export const RevokeAllDialog: React.FC<RevokeAllDialogProps> = ({ datasetId, datasetName, onRevoked }) => {
  const { t } = useTranslation(['api-keys', 'common']);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRevokeAll = async () => {
    setLoading(true);
    try {
      const result = await apiKeyService.revokeAll(datasetId);
      notificationService.success(
        t('api-keys:revoke_all.success') + ' ' +
        t('api-keys:revoke_all.revoked_count', { count: result.revoked_count })
      );
      onRevoked();
      setOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('common:status.error');
      notificationService.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <ShieldAlert className="mr-2 h-4 w-4" />
        {t('api-keys:revoke_all.button')}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              {t('api-keys:revoke_all.confirm_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('api-keys:revoke_all.confirm_message')}
              <div className="mt-2 rounded-md bg-muted p-2 font-mono text-xs">
                {datasetName}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAll}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-2 h-4 w-4" />
              {t('api-keys:revoke_all.button')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
