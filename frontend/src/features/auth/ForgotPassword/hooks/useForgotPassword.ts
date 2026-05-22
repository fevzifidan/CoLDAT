// src/features/forgot-password/hooks/useForgotPassword.ts
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { forgotPasswordService } from '../services/forgotPassword.service';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import notificationService from '@/shared/services/notification';
import { Logger } from '@/shared/services/logging/logging';

const schema = yup.object().shape({
    email: yup.string()
        .required(t('auth:forgotPassword.emailRequired'))
        .email(t('auth:forgotPassword.emailInvalid'))
});

export type ForgotPasswordFormValues = yup.InferType<typeof schema>;

export const useForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { t } = useTranslation();
    const form = useForm<ForgotPasswordFormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        setIsSuccess(false);
                try {
            await forgotPasswordService.sendResetLink(data.email);
            Logger.info("Password reset email requested", { traceId: Logger.getTraceId() });
            setIsSuccess(true);
            form.reset();
        } catch (error) {
            Logger.info("Password reset email request failed", {
              errorCode: error.response?.data?.errorCode,
              status: error.response?.status,
            });
            notificationService.error(t('auth:forgotPassword.errorMessage'));
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        isSuccess,
        onSubmit
    };
};