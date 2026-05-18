import apiService from '@/shared/services/api/api.service';

export interface VerificationResponse {
    success: boolean;
    message: string;
}

export const verificationService = {
    verifyEmail: async (token: string): Promise<VerificationResponse> => {
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(5000);
        const response = await apiService.post('/auth/verify-email', { token });
        return response.data;
    }
};