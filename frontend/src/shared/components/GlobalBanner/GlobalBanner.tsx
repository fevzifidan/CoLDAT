// GlobalBanner.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBanner } from "./BannerContext";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlobalBanner() {
  const { banner, hideBanner } = useBanner();

  if (!banner.show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] w-full animate-in fade-in slide-in-from-top duration-300">
      <Alert variant={banner.variant} className={cn("rounded-none border-t-0 border-x-0 shadow-md py-3 px-6 flex items-center relative justify-center min-h-[36px]", banner.className)}>
        <div className="flex items-center gap-3">
          {banner.icon && <span className="h-5 w-5">{banner.icon}</span>}
          <AlertDescription className="font-medium">
            {banner.text}
          </AlertDescription>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
                "absolute right-2 h-8 w-8",
                banner.variant === 'info' 
                ? "text-white hover:bg-white/20 hover:text-white" 
                : "hover:bg-foreground/10"
            )} 
            onClick={hideBanner}
            >
            <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}