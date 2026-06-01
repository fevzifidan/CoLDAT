import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '@/shared/services/api/api.service';
import { Button } from "@/components/ui/button";
import notificationService from '@/shared/services/notification/notification.service';
import {
  Trash2,
  Loader2,
  Lock,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

/* ------------------------------------------------ */
/* TYPES                                             */
/* ------------------------------------------------ */

type DeleteStep = 'request' | 'loading' | 'email-sent' | 'confirm-delete' | 'validation-error' | 'deleting' | 'deleted';

interface ValidationResult {
  valid: boolean;
  expires_at: string | null;
}

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** If provided from URL, validation happens immediately on mount */
  initialToken?: string | null;
}

/* ------------------------------------------------ */
/* COMPONENT                                         */
/* ------------------------------------------------ */

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  initialToken,
}) => {
  const { t } = useTranslation(['accounts']);

  /* ---------- State ---------- */

  const [step, setStep] = useState<DeleteStep>('request');
  const [password, setPassword] = useState('');
  const [deleteToken, setDeleteToken] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ---------- Reset state when modal opens / closes ---------- */

  useEffect(() => {
    if (isOpen) {
      // If opened with a token from URL, skip password step and validate
      if (initialToken) {
        setDeleteToken(initialToken);
        setStep('loading');
        validateToken(initialToken);
      } else {
        resetState();
      }
    }
  }, [isOpen, initialToken]);

  const resetState = () => {
    setStep('request');
    setPassword('');
    setDeleteToken('');
    setValidationResult(null);
    setActionLoading(false);
  };

  /* ---------- Token Validation ---------- */

  const validateToken = useCallback(async (token: string) => {
    setActionLoading(true);
    try {
      const response = await apiService.get(
        `/account/delete-confirm/validate?token=${encodeURIComponent(token)}`
      );
      const data: ValidationResult = response.data ?? response;

      if (data?.valid === true) {
        setValidationResult(data);
        setStep('confirm-delete');
      } else {
        setValidationResult(data);
        setStep('validation-error');
      }
    } catch (_error) {
      setValidationResult(null);
      setStep('validation-error');
    } finally {
      setActionLoading(false);
    }
  }, []);

  /* ---------- Step 1: Send deletion request ---------- */

  const handleSendRequest = async () => {
    if (!password.trim()) {
      notificationService.error(t('accounts:profile.deleteModal.errors.emptyPassword'));
      return;
    }

    setActionLoading(true);
    try {
      await apiService.post('/account/delete-request', {
        identifier: password,
      });

      notificationService.success(t('accounts:profile.deleteModal.success.requestCreated'));
      setStep('email-sent');
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        t('accounts:profile.deleteModal.errors.requestFailed');
      notificationService.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- Step 3: Confirm deletion ---------- */

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await apiService.post('/account/delete-confirm', {
        token: deleteToken,
      });

      setStep('deleted');

      // Clear local storage and redirect after brief delay
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 1500);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        t('accounts:profile.deleteModal.errors.confirmFailed');
      notificationService.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- Cleanup on close ---------- */

  const handleClose = () => {
    resetState();
    onClose();
  };

  /* ------------------------------------------------ */
  /* RENDER                                            */
  /* ------------------------------------------------ */

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">

        {/* ---------- HEADER ---------- */}
        <div className="flex justify-between items-center pb-2 border-b dark:border-slate-800">
          <h4 className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Trash2 size={16} className="text-red-500" />
            {t('accounts:profile.deleteModal.title')}
          </h4>
          <button
            onClick={handleClose}
            disabled={actionLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ---------- STEP: Loading (initial token validation spinner) ---------- */}
        {step === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500">
              {t('common:loading', 'Verifying...')}
            </p>
          </div>
        )}

        {/* ---------- STEP: Request (password input) ---------- */}
        {step === 'request' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('accounts:profile.deleteModal.requestDescription')}
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                {t('accounts:profile.deleteModal.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !actionLoading) {
                      handleSendRequest();
                    }
                  }}
                  placeholder={t('accounts:profile.deleteModal.passwordPlaceholder')}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  autoFocus
                />
                <Lock size={14} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={actionLoading}
              >
                {t('accounts:profile.deleteModal.cancel')}
              </Button>
              <Button
                onClick={handleSendRequest}
                disabled={actionLoading || !password.trim()}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {t('accounts:profile.deleteModal.sendRequest')}
              </Button>
            </div>
          </div>
        )}

        {/* ---------- STEP: Email Sent ---------- */}
        {step === 'email-sent' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-sm text-emerald-800 dark:text-emerald-400 flex flex-col gap-2 text-center">
              <CheckCircle2 size={32} className="mx-auto" />
              <span className="font-bold">
                {t('accounts:profile.deleteModal.emailSentTitle')}
              </span>
              <span>
                {t('accounts:profile.deleteModal.emailSentMessage')}
              </span>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                {t('accounts:profile.deleteModal.close')}
              </Button>
            </div>
          </div>
        )}

        {/* ---------- STEP: Validation Error ---------- */}
        {step === 'validation-error' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-800 dark:text-red-400 flex flex-col gap-2 text-center">
              <XCircle size={32} className="mx-auto" />
              <span className="font-bold">
                {t('accounts:profile.deleteModal.validationErrorTitle')}
              </span>
              <span>
                {t('accounts:profile.deleteModal.validationErrorMessage')}
              </span>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                {t('accounts:profile.deleteModal.close')}
              </Button>
            </div>
          </div>
        )}

        {/* ---------- STEP: Confirm Delete ---------- */}
        {step === 'confirm-delete' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex flex-col gap-1">
              <span className="font-bold">
                {t('accounts:profile.deleteModal.confirmTitle')}
              </span>
              <span>
                {t('accounts:profile.deleteModal.confirmNormalMessage')}
              </span>
              {validationResult?.expires_at && (
                <span className="text-amber-600 dark:text-amber-500 text-[11px]">
                  {t('accounts:profile.deleteModal.expiresAt', {
                    date: new Date(validationResult.expires_at).toLocaleString(),
                  })}
                </span>
              )}
            </div>
            <div className="flex gap-2 pt-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={actionLoading}
              >
                {t('accounts:profile.deleteModal.cancel')}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {actionLoading
                  ? t('common:loading', 'Deleting...')
                  : t('accounts:profile.deleteModal.deleteAccount')}
              </Button>
            </div>
          </div>
        )}

        {/* ---------- STEP: Deleted (success animation before redirect) ---------- */}
        {step === 'deleted' && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-sm text-emerald-800 dark:text-emerald-400 flex flex-col gap-2 text-center">
              <CheckCircle2 size={40} className="mx-auto" />
              <span className="font-bold text-base">
                {t('accounts:profile.deleteModal.success.accountDeleted')}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DeleteAccountModal;
