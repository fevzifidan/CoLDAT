import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, ChevronLeft, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';
import type { AnnotatedObject, ObjectRelation } from '../../../types/annotation.types';
import type { PredicateDef } from '../../../../../shared/store/contextSlice';

interface ObjectMenuProps {
  object: AnnotatedObject;
}

export function ObjectMenu({ object }: ObjectMenuProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'main' | 'relation_target' | 'relation_type'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<AnnotatedObject | null>(null);

  const { t } = useTranslation('annotation');

  const annotatedObjects = useAppStore(state => state.annotatedObjects);
  const objectRelations = useAppStore(state => state.objectRelations);
  const setObjectRelations = useAppStore(state => state.setObjectRelations);
  const predicates = useAppStore(state => state.taxonomy.predicates);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setView('main');
        setSearchQuery('');
        setTypeSearchQuery('');
        setSelectedTarget(null);
      }, 200);
    }
  };

  const handleTargetSelect = (targetObj: AnnotatedObject) => {
    setSelectedTarget(targetObj);
    setView('relation_type');
    setSearchQuery('');
  };

  const handleCreateRelation = (predicate: PredicateDef) => {
    if (!selectedTarget) return;

    // Prevent duplicates
    const exists = objectRelations.some(
      (rel) =>
        rel.sourceId === object.id &&
        rel.targetId === selectedTarget.id &&
        rel.relationTypeId === predicate.id
    );

    if (exists) {
      setOpen(false);
      return;
    }

    const newRelation: ObjectRelation = {
      id: crypto.randomUUID(),
      sourceId: object.id,
      sourceLabel: object.label,
      targetId: selectedTarget.id,
      targetLabel: selectedTarget.label,
      relationTypeId: predicate.id,
      relationTypeName: predicate.name,
    };

    setObjectRelations([...objectRelations, newRelation]);
    setOpen(false);
  };

  const filteredObjects = useMemo(() => {
    return annotatedObjects.filter(
      obj =>
        obj.id !== object.id &&
        obj.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [annotatedObjects, object.id, searchQuery]);

  const filteredRelationTypes = useMemo(() => {
    if (!selectedTarget) return [];

    // Find already existing relations between these two specific objects
    const existingTypeIds = objectRelations
      .filter((rel) => rel.sourceId === object.id && rel.targetId === selectedTarget.id)
      .map((rel) => rel.relationTypeId);

    return predicates.filter(
      (p) =>
        !existingTypeIds.includes(p.id) &&
        p.name.toLowerCase().includes(typeSearchQuery.toLowerCase())
    );
  }, [predicates, typeSearchQuery, object.id, selectedTarget, objectRelations]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title={t('rightPanel.objectMenu.menu')}
        >
          <MoreVertical size={13} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end" side="right" sideOffset={5}>
        {view === 'main' && (
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-8"
              onClick={() => setView('relation_target')}
            >
              {t('rightPanel.objectMenu.relation')}
            </Button>
          </div>
        )}

        {view === 'relation_target' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setView('main')}
              >
                <ChevronLeft size={14} />
              </Button>
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('rightPanel.objectMenu.selectTarget')}
                  className="h-7 pl-6 text-xs"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1">
              {filteredObjects.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-2">{t('rightPanel.objectMenu.noObjectsFound')}</p>
              ) : (
                filteredObjects.map(obj => (
                  <Button
                    key={obj.id}
                    variant="ghost"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => handleTargetSelect(obj)}
                  >
                    <div className="flex items-center gap-2 truncate w-full">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: obj.color }}
                      />
                      <span className="truncate">{obj.label}</span>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'relation_type' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setView('relation_target')}
              >
                <ChevronLeft size={14} />
              </Button>
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={typeSearchQuery}
                  onChange={(e) => setTypeSearchQuery(e.target.value)}
                  placeholder={t('rightPanel.objectMenu.selectRelationType')}
                  className="h-7 pl-6 text-xs"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1">
              {filteredRelationTypes.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-2">{t('rightPanel.objectMenu.noTypesFound')}</p>
              ) : (
                filteredRelationTypes.map(rt => (
                  <Button
                    key={rt.id}
                    variant="ghost"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => handleCreateRelation(rt)}
                  >
                    <span className="truncate">{rt.name}</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
