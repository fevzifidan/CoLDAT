import { useState, useEffect } from 'react';
import { verificationService } from '../services/emailVerification.service';
import { useTranslation } from 'react-i18next';

type VerificationStatus = 'loading' | 'success' | 'error' | 'idle';

export const useEmailVerification = (token: string | null) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage(t('auth:verifyEmail.noTokenFound'));
            return;
        }

        const verify = async () => {
            setStatus('loading');
            try {
                await verificationService.verifyEmail(token);
                setStatus('success');
            } catch (error) {
                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : t('auth:verifyEmail.unknownError'));
            }
        };

        verify();
    }, [token, t]);  // t eklendi
    return {
        status,
        errorMessage
    };
};