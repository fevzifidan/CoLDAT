import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ZIndexControlProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ZIndexControl({ value, onChange }: ZIndexControlProps) {
  return (
    <div className="px-4 py-3 border-b shrink-0">
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
        Z-Index
      </Label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(value - 1)}
          disabled={value <= 1}
        >
          <ChevronDown size={13} />
        </Button>
        <span className="text-sm font-mono font-semibold w-8 text-center">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(value + 1)}
        >
          <ChevronUp size={13} />
        </Button>
      </div>
    </div>
  );
}
