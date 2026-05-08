import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { passwordResetService } from '../services/resetPassword.service';
import { useSearchParams } from 'react-router-dom';
import notificationService from '@/shared/services/notification';

const schema = yup.object().shape({
    password: yup.string()
        .required('Password is required.')
        .min(8, 'Password must be at least 8 characters long.')
        .matches(/(?=.*[a-z])(?=.*[A-Z])/, 'Password must contain at least one uppercase and one lowercase letter.'),
    confirmPassword: yup.string()
        .required('Şifre onayı zorunludur.')
        .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor.')
});

export type PasswordResetFormValues = yup.InferType<typeof schema>;

export const usePasswordReset = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<PasswordResetFormValues>({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    });

    // Şifrenin anlık değerini alıp kural kutucuğu (criteria box) için kontrol ediyoruz
    const currentPassword = form.watch('password') || '';
    const isLengthMet = currentPassword.length >= 8;
    const isCaseMet = /(?=.*[a-z])(?=.*[A-Z])/.test(currentPassword);

    const onSubmit = async (data: PasswordResetFormValues) => {
        setIsLoading(true);
        try {
            await passwordResetService.resetPassword(token ? token : "", data.password);
            notificationService.success('Password reset successful!');
        } catch (error) {
            notificationService.error(`Error during password reset: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        onSubmit,
        criteria: {
            isLengthMet,
            isCaseMet
        }
    };
};