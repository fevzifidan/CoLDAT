import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/hooks/useAppStore';
import type { BoundingBox } from '../../../types/annotation.types';

interface BoundingBoxFieldsProps {
  bbox: BoundingBox;
  onChange: (bbox: BoundingBox) => void;
}

export default function BoundingBoxFields({ bbox, onChange }: BoundingBoxFieldsProps) {
  const { t } = useTranslation('annotation');
  const isReadOnly = useAppStore(state => state.isReadOnly);

  const handleChange = (key: keyof BoundingBox, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      onChange({ ...bbox, [key]: num });
    }
  };

  return (
    <div className="px-4 py-3 border-b shrink-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {t('rightPanel.inspector.boundingBox')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { key: 'xMin', labelKey: 'xMin' },
            { key: 'yMin', labelKey: 'yMin' },
            { key: 'xMax', labelKey: 'xMax' },
            { key: 'yMax', labelKey: 'yMax' },
          ] as { key: keyof BoundingBox; labelKey: string }[]
        ).map(({ key, labelKey }) => (
          <div key={key}>
            <Label className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 block">
              {t(`rightPanel.inspector.fields.${labelKey}`)}
            </Label>
            <Input
              type="number"
              value={bbox[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              disabled={isReadOnly}
              className="h-7 text-xs font-mono bg-muted/40 border-transparent focus-visible:border-input disabled:opacity-80"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
