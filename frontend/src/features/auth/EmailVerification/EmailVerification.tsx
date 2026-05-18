// src/features/email-verification/pages/VerificationPage.tsx
import React from 'react';
import { useEmailVerification } from './hooks/useEmailVerification';
import { VerificationLayout } from './layouts/emailVerificationLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const VerificationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const token = searchParams.get('token');

    const { status } = useEmailVerification(token);

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

                    {status === 'error' && (
                        <div className="animate-in fade-in zoom-in duration-500 w-full">
                            {/* bg-destructive/10 temanızdaki hata (kırmızı) renginin açık/transparan halini oluşturur */}
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

                </CardContent>
            </Card>
        </VerificationLayout>
    );
};