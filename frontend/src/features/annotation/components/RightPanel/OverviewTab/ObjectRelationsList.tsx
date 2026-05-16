import { ArrowRight, Trash2 } from 'lucide-react';
import type { ObjectRelation, AnnotatedObject } from '../../../types/annotation.types';
import { useAppStore } from '../../../../../store/hooks/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ObjectRelationsListProps {
  relations: ObjectRelation[];
  objects: AnnotatedObject[];
}

export default function ObjectRelationsList({ relations, objects }: ObjectRelationsListProps) {
  // Helper to get object color by id
  const getColor = (id: string) =>
    objects.find((o) => o.id === id)?.color ?? '#94a3b8';

  const { objectRelations, setObjectRelations, isReadOnly } = useAppStore(useShallow(state => ({
    objectRelations: state.objectRelations,
    setObjectRelations: state.setObjectRelations,
    isReadOnly: state.isReadOnly,
  })));
  const { t } = useTranslation('annotation');

  const handleDelete = (id: string) => {
    setObjectRelations(objectRelations.filter(rel => rel.id !== id));
  };

  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {t('rightPanel.overview.objectRelations')}
      </p>

      <div className="space-y-2">
        {relations.map((rel) => (
          <div
            key={rel.id}
            className="group relative flex items-center gap-1.5 bg-muted/40 rounded-lg px-3 py-2 text-xs hover:bg-muted/60 transition-colors"
          >
            {/* Source */}
            <span
              className="font-semibold truncate max-w-[80px]"
              style={{ color: getColor(rel.sourceId) }}
              title={rel.sourceLabel}
            >
              {rel.sourceLabel}
            </span>

            {/* Arrow + relation type */}
            <div className="flex items-center gap-1 shrink-0 text-primary">
              <ArrowRight size={11} />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {rel.relationTypeName}
              </span>
              <ArrowRight size={11} />
            </div>

            {/* Target */}
            <span
              className="font-semibold truncate max-w-[80px]"
              style={{ color: getColor(rel.targetId) }}
              title={rel.targetLabel}
            >
              {rel.targetLabel}
            </span>

            {/* Delete Button */}
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 opacity-0 group-hover:opacity-100 h-6 w-6 text-muted-foreground hover:text-destructive transition-all"
                title={t('rightPanel.inspector.objectHeader.delete')}
                onClick={() => handleDelete(rel.id)}
              >
                <Trash2 size={12} />
              </Button>
            )}
          </div>
        ))}

        {relations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            {t('rightPanel.overview.noRelations')}
          </p>
        )}
      </div>
    </div>
  );
}
