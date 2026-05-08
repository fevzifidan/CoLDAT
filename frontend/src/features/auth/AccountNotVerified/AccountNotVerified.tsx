import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MailWarning, Send, Headset, HelpCircle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResendVerification } from './hooks/useResendVerification';

const AccountNotVerified: React.FC = () => {
    const { t } = useTranslation(['auth', 'common']);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const brand = t('common:brand');

    const { resendVerification, loading, status } = useResendVerification();

    React.useEffect(() => {
        if (!email) {
            navigate('/login', { replace: true });
        }
    }, [email, navigate]);

    const handleResend = () => {
        if (email) {
            resendVerification(email);
        }
    };

    return (
        <div className="bg-background text-foreground h-[100dvh] overflow-y-auto flex flex-col antialiased">
            {/* TopAppBar Component */}
            <header className="bg-background shadow-sm w-full top-0 z-50 border-b border-border/40 shrink-0">
                <div className="flex justify-between items-center w-full px-4 md:px-10 py-3 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">{brand}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-secondary/50">
                            <HelpCircle className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-secondary/50" onClick={() => navigate('/login')}>
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-6 md:py-8 px-4 md:px-10">
                <div className="max-w-[480px] w-full bg-card rounded-xl p-6 md:p-8 text-center shadow-sm border border-border/40">
                    
                    {/* Icon Container */}
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <MailWarning className="w-8 h-8" strokeWidth={1.5} />
                    </div>

                    {/* Typography */}
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                        {t('auth:accountNotVerified.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                        {t('auth:accountNotVerified.description')}
                    </p>

                    {status === 'success' && (
                        <div className="mb-8 p-4 bg-primary/10 text-primary rounded-lg text-sm font-medium animate-in slide-in-from-top-2">
                            {t('auth:accountNotVerified.successMessage')}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium animate-in slide-in-from-top-2">
                            {t('auth:accountNotVerified.errorMessage')}
                        </div>
                    )}

                    {status === 'rate-limit' && (
                        <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium animate-in slide-in-from-top-2">
                            {t('auth:accountNotVerified.rateLimitMessage')}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3 items-center w-full max-w-sm mx-auto">
                        {status !== 'success' && (
                            <Button 
                                onClick={handleResend}
                                disabled={loading}
                                className="w-full h-11 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? t('auth:accountNotVerified.resending') : t('auth:accountNotVerified.buttonResend')}
                            </Button>
                        )}
                        
                        <Button 
                            variant="outline"
                            className="w-full h-11 text-sm bg-transparent text-muted-foreground border-border hover:bg-secondary/50 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                            <Headset className="w-4 h-4" />
                            {t('auth:accountNotVerified.buttonSupport')}
                        </Button>
                    </div>

                    {/* Additional Help Text */}
                    <div className="mt-6 pt-5 border-t border-border/50 text-left">
                        <p className="text-sm text-muted-foreground">
                            {t('auth:accountNotVerified.description2')}
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer Component */}
            <footer className="bg-card border-t border-border/40 w-full mt-auto shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-10 py-4 md:py-6 max-w-7xl mx-auto gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-primary">{brand}</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('common:footer.privacyPolicy')}</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('common:footer.termsOfUse')}</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('common:support')}</a>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-center md:text-right">
                        {t('common:footer.copyright')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AccountNotVerified;
