import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BoundingBox } from '../../../types/annotation.types';

interface BoundingBoxFieldsProps {
  bbox: BoundingBox;
  onChange: (bbox: BoundingBox) => void;
}

export default function BoundingBoxFields({ bbox, onChange }: BoundingBoxFieldsProps) {
  const handleChange = (key: keyof BoundingBox, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      onChange({ ...bbox, [key]: num });
    }
  };

  return (
    <div className="px-4 py-3 border-b shrink-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Bounding Box
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { key: 'xMin', label: 'X MIN' },
            { key: 'yMin', label: 'Y MIN' },
            { key: 'xMax', label: 'X MAX' },
            { key: 'yMax', label: 'Y MAX' },
          ] as { key: keyof BoundingBox; label: string }[]
        ).map(({ key, label }) => (
          <div key={key}>
            <Label className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 block">
              {label}
            </Label>
            <Input
              type="number"
              value={bbox[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="h-7 text-xs font-mono bg-muted/40 border-transparent focus-visible:border-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
