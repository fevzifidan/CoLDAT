import * as React from "react";
import { cn } from "@/lib/utils";

export const Dialog = ({ 
  children, 
  open, 
  onOpenChange 
}: { 
  children: React.ReactNode; 
  open: boolean; 
  onOpenChange?: (open: boolean) => void 
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay: Arkaya tıklandığında kapanması için */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange?.(false)} 
      />
      <div className="bg-background border p-6 rounded-lg shadow-lg max-w-md w-full relative z-50 animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative", className)}>{children}</div>
);

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">{children}</div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>
);

export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">{children}</div>
);