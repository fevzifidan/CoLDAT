import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AnnotatedObjectsList from './AnnotatedObjectsList';
import ObjectRelationsList from './ObjectRelationsList';
import { useAppStore } from '../../../../../store/hooks/useAppStore';

export default function OverviewTab() {
  const annotatedObjects = useAppStore(state => state.annotatedObjects);
  const objectRelations = useAppStore(state => state.objectRelations);

  return (
    <ScrollArea className="flex-1">
      {/* Annotated Objects */}
      <AnnotatedObjectsList objects={annotatedObjects} />

      <Separator className="my-1" />

      {/* Object Relations */}
      <ObjectRelationsList
        relations={objectRelations}
        objects={annotatedObjects}
      />
    </ScrollArea>
  );
}
