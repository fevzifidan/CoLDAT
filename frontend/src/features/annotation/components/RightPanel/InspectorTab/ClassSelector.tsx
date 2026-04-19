import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ClassDef } from '../../../types/annotation.types';

interface ClassSelectorProps {
  classes: ClassDef[];
  selectedClassId: string;
  onChange: (classId: string) => void;
}

export default function ClassSelector({
  classes,
  selectedClassId,
  onChange,
}: ClassSelectorProps) {
  return (
    <div className="px-4 py-3 border-b shrink-0">
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
        Class
      </Label>
      <Select value={selectedClassId} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs bg-muted/40 border-transparent focus:border-input">
          <SelectValue placeholder="Select a class…" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id} className="text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cls.color }}
                />
                {cls.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
