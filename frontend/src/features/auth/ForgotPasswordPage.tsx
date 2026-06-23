import React from 'react';
import { useForgotPassword } from './hooks/useForgotPassword';
import { ForgotPasswordLayout } from './components/ForgorPasswordLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ForgotPasswordPage: React.FC = () => {
    const { form, isLoading, isSuccess, onSubmit } = useForgotPassword();
    const { register, handleSubmit, formState: { errors } } = form;
    const { t } = useTranslation();

    return (
        <ForgotPasswordLayout>
            <Card className="w-full max-w-[460px] shadow-lg border-border/50 rounded-2xl bg-card text-card-foreground">
                <CardContent className="p-8 sm:p-10 flex flex-col items-center">

                    <div className="mb-6 relative flex items-center justify-center text-primary">
                        <RotateCcw className="w-10 h-10" strokeWidth={1.5} />
                        <Lock className="w-4 h-4 absolute bg-card rounded-full" strokeWidth={2.5} />
                    </div>

                    <h1 className="text-[26px] font-semibold text-foreground mb-2 text-center">
                        {t('auth:forgotPassword.title')}
                    </h1>
                    <p className="text-muted-foreground text-[15px] mb-8 text-center px-4">
                        {t('auth:forgotPassword.description')}
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[14px] font-medium text-foreground">
                                {t('auth:forgotPassword.email')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('auth:forgotPassword.email')}
                                className={`h-12 bg-background border-border placeholder:text-muted-foreground/60 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                {...register('email')}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                            )}
                            {!errors.email && (
                                <p className="text-[13px] text-muted-foreground/80 mt-1">
                                    {t('auth:forgotPassword.description2')}
                                </p>
                            )}
                        </div>

                        {isSuccess && (
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{t('auth:forgotPassword.successMessage')}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-[15px] font-medium rounded-xl flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? t('auth:forgotPassword.sending') : t('auth:forgotPassword.sendLink')}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </Button>

                    </form>

                    <div className="w-full h-px bg-border my-6" />

                    <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary/10 hover:text-primary font-medium text-[14px] flex items-center gap-2"
                        onClick={() => window.location.href = '/login'}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('auth:forgotPassword.backToLogin')}
                    </Button>

                </CardContent>
            </Card>
        </ForgotPasswordLayout>
    );
};