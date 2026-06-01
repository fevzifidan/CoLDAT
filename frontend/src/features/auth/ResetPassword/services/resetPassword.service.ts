import { apiService } from "@/shared/services/api/api.service";

export const passwordResetService = {
    resetPassword: async (token: string, new_password: string): Promise<{ success: boolean; message: string }> => {
        const result = await apiService.post("/auth/reset-password/", { token, new_password });
        return result;
    }
};

export const forgetPasswordService = {
    forgetPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
        const result = await apiService.post("/auth/forgot-password/", { email });
        return result;
    }
};