import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import i18n from "../../../i18n";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({
  className,
  size = 32,
  text = i18n.t("common:status.loading"),
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 
        className="animate-spin text-primary" 
        size={size} 
      />
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
      <LanguageSelector />
      <ThemeToggle />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;