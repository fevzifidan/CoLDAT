// src/features/email-verification/layout/VerificationLayout.tsx
import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VerificationLayoutProps {
    children: React.ReactNode;
}

export const VerificationLayout: React.FC<VerificationLayoutProps> = ({ children }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
            <header className="flex items-center justify-between px-8 py-5 bg-card border-b border-border shadow-sm">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-lg text-foreground">{t('common:brand')}</span>
                </div>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {t('common:support')}
                    <HelpCircle className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-8 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground underline underline-offset-4 decoration-border transition-colors">{t('common:footer.privacyPolicy')}</a>
                    <a href="#" className="hover:text-foreground underline underline-offset-4 decoration-border transition-colors">{t('common:footer.termsOfUse')}</a>
                    <a href="#" className="hover:text-foreground underline underline-offset-4 decoration-border transition-colors">{t('common:footer.contact')}</a>
                </div>
                <p className="text-xs text-muted-foreground/60">
                    {t('common:footer.copyright')}
                </p>
            </footer>
        </div>
    );
};