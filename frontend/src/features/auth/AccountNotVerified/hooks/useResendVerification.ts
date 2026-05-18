import { useState } from 'react';
import apiService from '@/shared/services/api/api.service';

export const useResendVerification = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'rate-limit'>('idle');

    const resendVerification = async (email: string) => {
        setLoading(true);
        setStatus('idle');
        try {
            await apiService.post('/auth/resend-verify-email', { email }, { silent: true });
            setStatus('success');
        } catch (error: any) {
            if (error.response?.status === 429) {
                setStatus('rate-limit');
            } else {
                setStatus('error');
            }
        } finally {
            setLoading(false);
        }
    };

    return { resendVerification, loading, status };
};
