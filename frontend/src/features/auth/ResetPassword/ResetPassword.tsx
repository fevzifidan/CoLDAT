import React from 'react';
import { usePasswordReset } from './hooks/usePasswordReset';
import { PasswordResetLayout } from './layouts/resetPasswordLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, RotateCcw, Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PasswordResetPage: React.FC = () => {
    const {
        form,
        isLoading,
        onSubmit,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        criteria
    } = usePasswordReset();

    const { register, handleSubmit, formState: { errors } } = form;
    const { t } = useTranslation();

    return (
        <PasswordResetLayout>
            <Card className="w-full max-w-[440px] shadow-lg border-border/50 rounded-2xl bg-card text-card-foreground">
                <CardContent className="p-8 sm:p-10 flex flex-col items-center">

                    {/* İkon Kombinasyonu */}
                    <div className="w-14 h-14 bg-muted border border-border rounded-[14px] flex items-center justify-center mb-6 relative">
                        <RotateCcw className="w-6 h-6 text-foreground" strokeWidth={2} />
                        <div className="absolute bg-card rounded-full p-[2px] right-2 bottom-2 shadow-sm border border-border">
                            <Lock className="w-3 h-3 text-foreground" strokeWidth={2.5} />
                        </div>
                    </div>

                    <h1 className="text-[26px] font-semibold text-foreground mb-2 text-center">
                        {t('auth:resetPassword.title')}
                    </h1>
                    <p className="text-muted-foreground text-[15px] mb-8 text-center">
                        {t('auth:resetPassword.description')}
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">

                        {/* Yeni Şifre */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="password" className="text-[14px] font-medium text-foreground">
                                {t('auth:resetPassword.password')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Yeni şifrenizi girin"
                                    className={`pr-10 h-12 bg-background border-border placeholder:text-muted-foreground/60 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Yeni Şifre Onay */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="confirmPassword" className="text-[14px] font-medium text-foreground">
                                {t('auth:resetPassword.confirmPassword')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Yeni şifrenizi tekrar girin"
                                    className={`pr-10 h-12 bg-background border-border placeholder:text-muted-foreground/60 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Kurallar Kutucuğu (Validation Criteria Box) */}
                        <div className="bg-muted/40 border border-border/50 rounded-xl p-4 space-y-3 mt-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    className={`w-[18px] h-[18px] transition-colors duration-300 ${criteria.isLengthMet ? 'text-green-500 dark:text-green-400' : 'text-muted-foreground'}`}
                                />
                                <span className={`text-[13px] ${criteria.isLengthMet ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {t('auth:resetPassword.passwordLength')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    className={`w-[18px] h-[18px] transition-colors duration-300 ${criteria.isCaseMet ? 'text-green-500 dark:text-green-400' : 'text-muted-foreground'}`}
                                />
                                <span className={`text-[13px] ${criteria.isCaseMet ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {t('auth:resetPassword.passwordCase')}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-[15px] font-medium rounded-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? t('auth:resetPassword.resetting') : t('auth:resetPassword.resetPassword')}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </PasswordResetLayout>
    );
};