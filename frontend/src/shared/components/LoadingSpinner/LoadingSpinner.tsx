import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import i18n from "../../../i18n";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  text?: string | null;
  fullScreen?: boolean;
  localOverlay?: boolean;
}

const LoadingSpinner = ({
  className,
  size = 32,
  text = i18n.t("common:status.loading"),
  fullScreen = false,
  localOverlay = false,
}: LoadingSpinnerProps) => {
  
  // Saf yükleme içeriği (Sadece ikon ve varsa metin)
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 
        className="animate-spin text-current" 
        size={size} 
      />
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );

  // 1. DURUM: Tam Ekran
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-6">
        {content}
      </div>
    );
  }

  // 2. DURUM: Bulunduğu Komponenti Kaplayan (Local Overlay)
  // Örn: Bir Data Table veya Card yüklenirken üzerini buğulamak için
  if (localOverlay) {
    return (
      // absolute inset-0: Parent'ın tüm genişlik ve yüksekliğini kaplar
      // Not: Parent elemana "relative" class'ı verilmelidir
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-inherit">
        {content}
      </div>
    );
  }

  // 3. DURUM: Inline (Satır İçi / Buton İçi)
  // Örn: Bir butonun içine koyarken veya yan yana dizerken
  return content;
};

export default LoadingSpinner;