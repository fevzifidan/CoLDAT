import { apiService } from "@/shared/services/api/api.service";

export const forgotPasswordService = {
    /**
     * Sends password reset link to the user's email.
     */
        sendResetLink: async (email: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiService.post('/auth/forgot-password/', { email });
        return response;
    }
};