import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/hooks/useAppStore';
import type { ClassDef } from '../../../types/annotation.types';

interface ClassListProps {
  classes: ClassDef[];
  selectedClassId?: string;
  onSelect?: (classId: string) => void;
}

export default function ClassList({ classes, selectedClassId, onSelect }: ClassListProps) {
  const { t } = useTranslation('annotation');
  const isReadOnly = useAppStore(state => state.isReadOnly);
  const [search, setSearch] = useState('');

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-3 border-b shrink-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {t('rightPanel.inspector.classes')}
      </p>

      {/* Search */}
      <div className="relative mb-2">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('rightPanel.inspector.filterClasses')}
          className="h-7 pl-7 text-xs bg-muted/40 border-transparent focus-visible:border-input"
        />
      </div>

      {/* Class rows */}
      <div className="space-y-0.5">
        {filtered.map((cls) => (
          <button
            key={cls.id}
            onClick={() => !isReadOnly && onSelect?.(cls.id)}
            disabled={isReadOnly}
            className={cn(
              'w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all',
              !isReadOnly && 'hover:bg-accent hover:text-accent-foreground',
              selectedClassId === cls.id
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cls.color }}
              />
              <span>{cls.name}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{cls.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
