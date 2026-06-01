// src/features/email-verification/pages/VerificationPage.tsx
import React, { useState } from 'react';
import { useEmailVerification } from './hooks/useEmailVerification';
import { VerificationLayout } from './layouts/emailVerificationLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resendVerificationService } from './services/resendVerificationFromEmail.service';
import notificationService from '@/shared/services/notification';

type ResendStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate-limit';

export const VerificationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const token = searchParams.get('token');

    const { status } = useEmailVerification(token);

    // Resend state
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [email, setEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<ResendStatus>('idle');

    const handleResend = async () => {
        if (!email) return;

        setResendStatus('loading');
        try {
            await resendVerificationService.resendVerification(email);
            setResendStatus('success');
            notificationService.success(t('auth:verifyEmail.resendSuccessMessage'));
        } catch (error: any) {
            if (error.response?.status === 429) {
                setResendStatus('rate-limit');
            } else {
                setResendStatus('error');
            }
        }
    };

    const handleShowEmailInput = () => {
        setShowEmailInput(true);
        setResendStatus('idle');
    };

    const handleBackToError = () => {
        setShowEmailInput(false);
        setEmail('');
        setResendStatus('idle');
    };

    return (
        <VerificationLayout>
            <Card className="w-full max-w-[480px] shadow-lg border-border/50 rounded-[2rem] bg-card text-card-foreground">
                <CardContent className="p-10 text-center flex flex-col items-center">

                    {status === 'loading' && (
                        <div className="py-20 text-muted-foreground animate-pulse">
                            {t('auth:verifyEmail.verifying')}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="animate-in fade-in zoom-in duration-500 w-full">
                            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm">
                                    <Check className="w-6 h-6 text-primary" strokeWidth={3} />
                                </div>
                            </div>

                            <h1 className="text-[28px] leading-tight font-semibold text-foreground mb-3">
                                {t('auth:verifyEmail.successTitle')}
                            </h1>

                            <p className="text-muted-foreground text-[15px] mb-8 leading-relaxed">
                                {t('auth:verifyEmail.successMessage')}
                            </p>

                            <Button
                                className="w-full h-14 text-[15px] rounded-xl font-medium"
                                onClick={() => window.location.href = '/login'}
                            >
                                {t('auth:verifyEmail.toLogin')}
                            </Button>
                        </div>
                    )}

                    {status === 'error' && !showEmailInput && (
                        <div className="animate-in fade-in zoom-in duration-500 w-full">
                            <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-destructive" strokeWidth={2.5} />
                            </div>

                            <h1 className="text-[28px] leading-tight font-semibold text-foreground mb-3">
                                {t('auth:verifyEmail.errorTitle')}
                            </h1>

                            <p className="text-muted-foreground text-[15px] mb-8 leading-relaxed">
                                {t('auth:verifyEmail.errorMessage')}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <Button
                                    className="w-full h-14 text-[15px] rounded-xl font-medium flex gap-2"
                                    onClick={handleShowEmailInput}
                                >
                                    <Send className="w-4 h-4" />
                                    {t('auth:verifyEmail.buttonNewLink')}
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full h-14 text-primary hover:bg-primary/10 hover:text-primary text-[15px] rounded-xl font-medium"
                                >
                                    {t('auth:verifyEmail.buttonSupport')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && showEmailInput && (
                        <div className="animate-in fade-in zoom-in duration-500 w-full">
                            <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-destructive" strokeWidth={2.5} />
                            </div>

                            <h1 className="text-[28px] leading-tight font-semibold text-foreground mb-3">
                                {t('auth:verifyEmail.resendTitle')}
                            </h1>

                            <p className="text-muted-foreground text-[15px] mb-8 leading-relaxed">
                                {t('auth:verifyEmail.resendDescription')}
                            </p>

                            <div className="space-y-4 w-full">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="resend-email" className="text-[14px] font-medium text-foreground">
                                        {t('auth:verifyEmail.emailLabel')}
                                    </Label>
                                    <Input
                                        id="resend-email"
                                        type="email"
                                        placeholder={t('auth:verifyEmail.emailPlaceholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-background border-border placeholder:text-muted-foreground/60"
                                        disabled={resendStatus === 'loading' || resendStatus === 'success'}
                                    />
                                </div>

                                {resendStatus === 'success' && (
                                    <div className="p-4 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                        {t('auth:verifyEmail.resendSuccessMessage')}
                                    </div>
                                )}

                                {resendStatus === 'rate-limit' && (
                                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
                                        {t('auth:verifyEmail.rateLimitMessage')}
                                    </div>
                                )}

                                {resendStatus === 'error' && (
                                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
                                        {t('auth:verifyEmail.resendErrorMessage')}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="w-full h-14 text-[15px] rounded-xl font-medium flex gap-2"
                                        onClick={handleResend}
                                        disabled={!email || resendStatus === 'loading' || resendStatus === 'success'}
                                    >
                                        <Send className="w-4 h-4" />
                                        {resendStatus === 'loading'
                                            ? t('auth:verifyEmail.sending')
                                            : t('auth:verifyEmail.buttonNewLink')}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full h-14 text-primary hover:bg-primary/10 hover:text-primary text-[15px] rounded-xl font-medium flex gap-2"
                                        onClick={handleBackToError}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t('auth:verifyEmail.backButton')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </VerificationLayout>
    );
};