import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmActionProps {
    children: React.ReactNode;
    onConfirm: () => void;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    className?: string;
}

export function ConfirmAction({
    children,
    onConfirm,
    title,
    confirmText,
    cancelText,
    className
}: ConfirmActionProps) {
    const { t } = useTranslation('annotation');
    const [open, setOpen] = useState(false);

    const displayTitle = title || t('rightPanel.inspector.objectHeader.deleteConfirmTitle');
    const displayConfirm = confirmText || t('rightPanel.inspector.objectHeader.confirmDelete');
    const displayCancel = cancelText || t('rightPanel.inspector.objectHeader.cancel');

    const handleConfirm = () => {
        onConfirm();
        setOpen(false); // İşlemden sonra kapat
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className={cn("w-[200px] p-3 shadow-md", className)}
            >
                <div className="space-y-3">
                    <p className="text-[13px] font-medium leading-tight text-foreground/90">
                        {displayTitle}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setOpen(false)}
                        >
                            {displayCancel}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={handleConfirm}
                        >
                            {displayConfirm}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}