import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { type ApiKey } from '../services/apiKeyService';
import notificationService from '@/shared/services/notification/notification.service';

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  datasetId: string;
  loading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
  onRevoke: (keyId: string) => Promise<void>;
  onEdit: (apiKey: ApiKey) => void;
  onReveal: (datasetId: string, keyId: string) => Promise<string | null>;
}

export const ApiKeyTable: React.FC<ApiKeyTableProps> = ({
  apiKeys,
  datasetId,
  loading,
  hasNext,
  onLoadMore,
  onRevoke,
  onEdit,
  onReveal,
}) => {
  const { t } = useTranslation(['api-keys', 'common']);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revealLoadingId, setRevealLoadingId] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return t('api-keys:table.never_expires');
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const maskKey = (key?: string): string => {
    if (!key) return '••••••••••••••••••••••••••••';
    if (key.length <= 12) return key.substring(0, 4) + '••••••••';
    return key.substring(0, 6) + '••••••••••••' + key.substring(key.length - 4);
  };

  const handleToggleReveal = async (key: ApiKey) => {
    if (revealedKeys[key.id]) {
      setRevealedKeys(prev => {
        const copy = { ...prev };
        delete copy[key.id];
        return copy;
      });
      return;
    }

    setRevealLoadingId(key.id);
    try {
      const fullKey = await onReveal(datasetId, key.id);
      if (fullKey) {
        setRevealedKeys(prev => ({ ...prev, [key.id]: fullKey }));
      } else {
        notificationService.error(t('api-keys:messages.reveal_failed'));
      }
    } catch {
      notificationService.error(t('api-keys:messages.reveal_failed'));
    } finally {
      setRevealLoadingId(null);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      notificationService.success(t('common:status.success_copied'));
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      notificationService.error(t('common:status.error_general'));
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeConfirmId) return;
    setRevokingId(revokeConfirmId);
    try {
      await onRevoke(revokeConfirmId);
      setRevokeConfirmId(null);
    } finally {
      setRevokingId(null);
    }
  };

  if (!apiKeys.length && !loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground italic">
        {t('api-keys:key_list.empty')}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">{t('api-keys:table.column_name')}</TableHead>
              <TableHead className="min-w-[200px]">{t('api-keys:table.column_key')}</TableHead>
              <TableHead className="w-[120px]">{t('api-keys:table.column_created')}</TableHead>
              <TableHead className="w-[120px]">{t('api-keys:table.column_expires')}</TableHead>
              <TableHead className="w-[100px]">{t('api-keys:table.column_status')}</TableHead>
              <TableHead className="w-[60px]">{t('api-keys:table.column_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => {
              const isRevealed = !!revealedKeys[key.id];
              const displayValue = isRevealed
                ? revealedKeys[key.id]
                : maskKey(key.api_key);

              return (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">
                    <span className="truncate max-w-[160px] block">{key.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="bg-muted/50 border border-border/50 px-2 py-1 rounded font-mono text-xs flex-1 truncate">
                        {displayValue}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleToggleReveal(key)}
                        disabled={revealLoadingId === key.id}
                        title={isRevealed ? t('api-keys:tooltips.hide') : t('api-keys:tooltips.reveal')}
                      >
                        {revealLoadingId === key.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isRevealed ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        disabled={!isRevealed}
                        onClick={() => handleCopy(revealedKeys[key.id], key.id + '_copy')}
                        title={t('api-keys:tooltips.copy')}
                      >
                        {copiedId === key.id + '_copy' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(key.created_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(key.expires_at)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={key.is_active ? 'default' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {key.is_active
                        ? t('api-keys:table.status_active')
                        : t('api-keys:table.status_inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => onEdit(key)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common:actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setRevokeConfirmId(key.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('api-keys:key_list.revoke_button')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Loading row */}
            {loading && (
              <TableRow>
                <td colSpan={6} className="p-4 text-center">
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common:status.loading')}
                  </div>
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Load More */}
        {hasNext && !loading && (
          <div className="flex justify-center border-t py-3">
            <Button variant="ghost" size="sm" onClick={onLoadMore} className="text-xs">
              {t('api-keys:table.load_more')}
            </Button>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={!!revokeConfirmId}
        onOpenChange={(open) => { if (!open) setRevokeConfirmId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('api-keys:messages.confirm_revoke')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('api-keys:messages.confirm_revoke')} {t('common:status.action_cannot_be_undone')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              disabled={revokingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokingId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t('api-keys:key_list.revoke_button')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
