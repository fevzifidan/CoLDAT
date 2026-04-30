import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/hooks/useAppStore';

interface ZIndexControlProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ZIndexControl({ value, onChange }: ZIndexControlProps) {
  const { t } = useTranslation('annotation');
  const isReadOnly = useAppStore(state => state.isReadOnly);

  return (
    <div className="px-4 py-3 border-b shrink-0">
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
        {t('rightPanel.inspector.zIndex')}
      </Label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(value - 1)}
          disabled={isReadOnly || value <= 1}
          title={t('rightPanel.inspector.sendBackward')}
        >
          <ChevronDown size={13} />
        </Button>
        <span className="text-sm font-mono font-semibold w-8 text-center">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(value + 1)}
          disabled={isReadOnly}
          title={t('rightPanel.inspector.bringForward')}
        >
          <ChevronUp size={13} />
        </Button>
      </div>
    </div>
  );
}
