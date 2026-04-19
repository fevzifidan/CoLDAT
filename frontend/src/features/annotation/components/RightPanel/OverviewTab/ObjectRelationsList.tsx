import { ArrowRight } from 'lucide-react';
import type { ObjectRelation, AnnotatedObject } from '../../../types/annotation.types';

interface ObjectRelationsListProps {
  relations: ObjectRelation[];
  objects: AnnotatedObject[];
}

export default function ObjectRelationsList({ relations, objects }: ObjectRelationsListProps) {
  // Helper to get object color by id
  const getColor = (id: string) =>
    objects.find((o) => o.id === id)?.color ?? '#94a3b8';

  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Object Relations
      </p>

      <div className="space-y-2">
        {relations.map((rel) => (
          <div
            key={rel.id}
            className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-3 py-2 text-xs"
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
          </div>
        ))}

        {relations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            No relations defined
          </p>
        )}
      </div>
    </div>
  );
}
