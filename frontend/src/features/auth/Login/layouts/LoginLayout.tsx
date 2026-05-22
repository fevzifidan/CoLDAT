import React from 'react';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
    children: React.ReactNode;
}

export const LoginLayout: React.FC<LayoutProps> = ({ children }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans transition-colors duration-300">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-5 bg-card border-b border-border shadow-sm">
                <div className="font-bold text-xl text-primary tracking-tight">
                    {t('common:brand')}
                </div>
                <a href="/register" className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                    {t('auth:login.signUp')}
                </a>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="flex flex-col md:flex-row items-center justify-center md:justify-between px-8 py-8 bg-card border-t border-border mt-auto gap-4">
                <div className="text-sm text-muted-foreground text-center md:text-left">
                    <p>{t('common:footer.copyright')}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground underline underline-offset-4 decoration-border transition-colors">{t('common:footer.privacyPolicy')}</a>
                    <a href="#" className="hover:text-foreground underline underline-offset-4 decoration-border transition-colors">{t('common:footer.termsOfUse')}</a>
                    <a href="#" className="hover:text-foreground underline underline-offset-4 decoration-border transition-colors">{t('common:footer.contact')}</a>
                </div>
            </footer>
        </div>
    );
};
