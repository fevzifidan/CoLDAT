import apiService from '@/shared/services/api/api.service';

export interface ResendVerificationResponse {
    success: boolean;
    message: string;
}

export const resendVerificationService = {
    resendVerification: async (email: string): Promise<ResendVerificationResponse> => {
        const response = await apiService.post('/auth/resend-verify-email/', { email }, { silent: true });
        return response;
    }
};
