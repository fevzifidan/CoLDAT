import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ObjectHeader from './ObjectHeader';
import BoundingBoxFields from './BoundingBoxFields';
import ClassSelector from './ClassSelector';
import ZIndexControl from './ZIndexControl';
import ClassList from './ClassList';
import RelationsList from './RelationsList';
import { useAnnotationStore } from '../../../store/useAnnotationStore';
import type { ClassDef, RelationType } from '../../../types/annotation.types';

interface InspectorTabProps {
  classes: ClassDef[];
  relationTypes: RelationType[];
}

export default function InspectorTab({ classes, relationTypes }: InspectorTabProps) {
  const {
    selectedObjectId,
    annotatedObjects,
    updateObject,
    setSelectedObjectId,
  } = useAnnotationStore();

  const selectedObject = annotatedObjects.find((o) => o.id === selectedObjectId);

  if (!selectedObject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">No object selected</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      {/* Object header */}
      <ObjectHeader
        object={selectedObject}
        onToggleVisible={() =>
          updateObject(selectedObject.id, { visible: !selectedObject.visible })
        }
        onToggleLocked={() =>
          updateObject(selectedObject.id, { locked: !selectedObject.locked })
        }
        onDelete={() => setSelectedObjectId(null)}
      />

      {/* BBox */}
      <BoundingBoxFields
        bbox={selectedObject.bbox}
        onChange={(bbox) => updateObject(selectedObject.id, { bbox })}
      />

      {/* Class selector */}
      <ClassSelector
        classes={classes}
        selectedClassId={selectedObject.classId}
        onChange={(classId) => {
          const cls = classes.find((c) => c.id === classId);
          updateObject(selectedObject.id, {
            classId,
            color: cls?.color ?? selectedObject.color,
          });
        }}
      />

      {/* Z-Index */}
      <ZIndexControl
        value={selectedObject.zIndex}
        onChange={(zIndex) => updateObject(selectedObject.id, { zIndex })}
      />

      <Separator className="my-1" />

      {/* Classes list */}
      <ClassList
        classes={classes}
        selectedClassId={selectedObject.classId}
        onSelect={(classId) => {
          const cls = classes.find((c) => c.id === classId);
          updateObject(selectedObject.id, {
            classId,
            color: cls?.color ?? selectedObject.color,
          });
        }}
      />

      <Separator className="my-1" />

      {/* Relations */}
      <RelationsList relationTypes={relationTypes} />
    </ScrollArea>
  );
}
