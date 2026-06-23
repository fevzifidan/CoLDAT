import apiService from '@/shared/services/api/api.service';

export interface VerificationResponse {
    success: boolean;
    message: string;
}

export const verificationService = {
    verifyEmail: async (token: string): Promise<VerificationResponse> => {
        const response = await apiService.post('/auth/verify-email/', { token });
        return response;
    }
};