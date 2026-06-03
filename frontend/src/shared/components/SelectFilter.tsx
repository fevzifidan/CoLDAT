import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ReactNode } from 'react';

export interface SelectFilterOption {
  value: string;
  label: string;
  icon?: ReactNode;       // Lucide ikon component'i
  description?: string;
}

interface SelectFilterProps {
  value: string;
  options: SelectFilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function SelectFilter({
  value,
  options,
  onChange,
  placeholder,
  triggerClassName = 'w-44',
  contentClassName,
  disabled = false,
}: SelectFilterProps) {
  // Seçili option'ı bul ve varsa ikonunu göster
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={`h-9 text-xs bg-card border-border font-medium ${triggerClassName}`}
      >
        <SelectValue placeholder={placeholder}>
          {selectedOption && (
            <div className="flex items-center gap-2">
              {selectedOption.icon && (
                <span className="h-3.5 w-3.5 text-muted-foreground shrink-0">
                  {selectedOption.icon}
                </span>
              )}
              <span>{selectedOption.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            <div className="flex items-center gap-2">
              {opt.icon && (
                <span className="h-3.5 w-3.5 text-muted-foreground shrink-0">
                  {opt.icon}
                </span>
              )}
              <span>{opt.label}</span>
              {opt.description && (
                <span className="text-[10px] text-muted-foreground">
                  {opt.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
