import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QueuePaginationProps {
    currentPage: number;
    onNext: () => void;
    onPrev: () => void;
    hasNext: boolean;
    disabled?: boolean;
}

export default function QueuePagination({
    currentPage,
    onNext,
    onPrev,
    hasNext,
    disabled
}: QueuePaginationProps) {
    return (
        <div className="flex items-center justify-center gap-4 py-3 px-2 border-t bg-background/50 backdrop-blur-sm shrink-0">
            <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                disabled={currentPage === 1 || disabled}
                className="text-muted-foreground hover:text-foreground transition-colors gap-1 text-xs"
            >
                <ChevronLeft size={14} />
                Previous
            </Button>

            <div className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-colors",
                "bg-secondary text-secondary-foreground dark:bg-muted dark:text-white"
                // Görseldeki gibi oval ve belirgin durması için özel padding ve renk
            )}>
                Page {currentPage}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext || disabled}
                className="text-muted-foreground hover:text-foreground transition-colors gap-1 text-xs"
            >
                Next
                <ChevronRight size={14} />
            </Button>
        </div>
    );
}