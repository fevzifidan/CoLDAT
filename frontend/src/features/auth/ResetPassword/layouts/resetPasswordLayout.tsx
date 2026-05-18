// src/features/password-reset/layout/PasswordResetLayout.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
    children: React.ReactNode;
}

export const PasswordResetLayout: React.FC<LayoutProps> = ({ children }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans transition-colors duration-300">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border shadow-sm">
                <div>
                    <span className="font-semibold text-[20px] text-primary">
                        {t("common:brand")}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-[17px] text-foreground">
                        {t("auth:resetPassword.title")}
                    </span>
                </div>
                <Button variant="link" className="text-primary hover:text-primary/80 font-medium text-sm">
                    {t("common:help")}
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="flex flex-col md:flex-row items-center justify-between px-8 py-6 bg-card border-t border-border mt-auto gap-4">
                <p className="text-sm text-muted-foreground">
                    {t('common:footer.copyright')}
                </p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">{t("common:footer.privacyPolicy")}</a>
                    <a href="#" className="hover:text-foreground transition-colors">{t("common:footer.termsOfUse")}</a>
                    <a href="#" className="hover:text-foreground transition-colors">{t("common:footer.contact")}</a>
                </div>
            </footer>
        </div>
    );
};