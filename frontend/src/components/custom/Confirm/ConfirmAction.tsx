import React, { useState } from 'react';
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
    title = "Bu işlemi onaylıyor musunuz?",
    confirmText = "Delete",
    cancelText = "Cancel",
    className
}: ConfirmActionProps) {
    const [open, setOpen] = useState(false);

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
                        {title}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setOpen(false)}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}