import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { RelationType } from '../../../types/annotation.types';

interface RelationsListProps {
  relationTypes: RelationType[];
}

export default function RelationsList({ relationTypes }: RelationsListProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const filtered = relationTypes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Relations (Ontology)
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
          placeholder="Search relation types..."
          className="h-7 pl-7 text-xs bg-muted/40 border-transparent focus-visible:border-input"
        />
      </div>

      {/* Relation rows */}
      <div className="space-y-0.5">
        {filtered.map((rel) => {
          const isOpen = expanded.includes(rel.id);
          return (
            <div key={rel.id}>
              <button
                onClick={() => toggle(rel.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all',
                  'hover:bg-accent hover:text-accent-foreground text-left'
                )}
              >
                {isOpen ? (
                  <ChevronDown size={11} className="text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight size={11} className="text-muted-foreground shrink-0" />
                )}
                <ArrowRight size={11} className="text-primary shrink-0" />
                <span className="font-medium tracking-wide">{rel.name}</span>
              </button>

              {isOpen && (
                <div className="ml-8 mt-0.5 mb-1 px-2 py-1.5 rounded-md bg-muted/40 text-[10px] text-muted-foreground">
                  {rel.directed
                    ? 'Directed relation — source → target'
                    : 'Undirected relation — bidirectional'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
