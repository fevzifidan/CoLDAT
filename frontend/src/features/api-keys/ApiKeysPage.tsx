import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Key, Plus, RefreshCw, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import notificationService from '@/shared/services/notification/notification.service';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import { apiKeyService, type ApiKey } from './services/apiKeyService';
import { AdminDatasetComboBox } from './components/AdminDatasetComboBox';
import { CreateKeyDialog } from './components/CreateKeyDialog';
import { EditKeyDialog } from './components/EditKeyDialog';
import { RevokeAllDialog } from './components/RevokeAllDialog';
import { ApiKeyTable } from './components/ApiKeyTable';

const ApiKeysPage = () => {
  const { t } = useTranslation(['api-keys', 'common']);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedDatasetName, setSelectedDatasetName] = useState<string>('');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);

  const {
    items: apiKeys,
    loading,
    hasNext,
    loadMore,
    reset: resetKeys,
    initialLoading: keysInitialLoading,
  } = useCursorPagination<ApiKey>({
    fetchFn: async (cursor, limit) => {
      const res = await apiKeyService.list(selectedDatasetId, { limit, after: cursor });
      return { data: res.data, next_cursor: res.next_cursor };
    },
    limit: 10,
    enabled: !!selectedDatasetId,
  });

  const handleDatasetChange = useCallback((datasetId: string, datasetName: string) => {
    setSelectedDatasetId(datasetId);
    setSelectedDatasetName(datasetName);
    resetKeys();
  }, [resetKeys]);

  const handleCreateSuccess = useCallback(() => {
    resetKeys();
  }, [resetKeys]);

  const handleRevoke = useCallback(async (keyId: string) => {
    await apiKeyService.revoke(selectedDatasetId, keyId);
    notificationService.success(t('api-keys:messages.revoked_success'));
    resetKeys();
  }, [selectedDatasetId, resetKeys, t]);

  const handleReveal = useCallback(async (datasetId: string, keyId: string): Promise<string | null> => {
    const res = await apiKeyService.reveal(datasetId, keyId);
    return res?.api_key || null;
  }, []);

  const handleEdit = useCallback((apiKey: ApiKey) => {
    setEditingKey(apiKey);
    setEditDialogOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    resetKeys();
  }, [resetKeys]);

  const handleRevokeAllSuccess = useCallback(() => {
    resetKeys();
  }, [resetKeys]);

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Key className="text-primary h-8 w-8" /> {t('api-keys:page.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('api-keys:page.description')}
        </p>
      </div>

      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Dataset</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('api-keys:dataset_selector.placeholder')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminDatasetComboBox
            value={selectedDatasetId}
            onChange={handleDatasetChange}
          />
        </CardContent>
      </Card>

      {selectedDatasetId ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedDatasetName}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => resetKeys()}
                disabled={loading}
                title={t('api-keys:tooltips.refresh')}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <RevokeAllDialog
                datasetId={selectedDatasetId}
                datasetName={selectedDatasetName}
                onRevoked={handleRevokeAllSuccess}
              />
              <Button onClick={() => setCreateDialogOpen(true)} className="whitespace-nowrap">
                <Plus className="mr-1.5 h-4 w-4" /> {t('api-keys:generate.button')}
              </Button>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3 text-amber-700 dark:text-amber-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
            <div>
              <span className="font-bold">{t('api-keys:security_warning.title')}</span>{' '}
              {t('api-keys:security_warning.message')}
            </div>
          </div>

          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg">{t('api-keys:key_list.title')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('api-keys:key_list.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {keysInitialLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('common:status.loading')}
                </div>
              ) : (
                <ApiKeyTable
                  apiKeys={apiKeys}
                  datasetId={selectedDatasetId}
                  loading={loading}
                  hasNext={hasNext}
                  onLoadMore={loadMore}
                  onRevoke={handleRevoke}
                  onEdit={handleEdit}
                  onReveal={handleReveal}
                />
              )}
            </CardContent>
          </Card>

          <CreateKeyDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            datasetId={selectedDatasetId}
            onCreated={handleCreateSuccess}
          />

          {editingKey && (
            <EditKeyDialog
              open={editDialogOpen}
              onOpenChange={(open) => {
                setEditDialogOpen(open);
                if (!open) setEditingKey(null);
              }}
              datasetId={selectedDatasetId}
              apiKey={editingKey}
              onUpdated={handleEditSuccess}
            />
          )}
        </>
      ) : (
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Key className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">{t('api-keys:dataset_selector.no_admin_datasets')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiKeysPage;
