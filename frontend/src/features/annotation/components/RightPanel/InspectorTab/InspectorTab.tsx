import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ObjectHeader from './ObjectHeader';
import BoundingBoxFields from './BoundingBoxFields';
import ClassSelector from './ClassSelector';
import ZIndexControl from './ZIndexControl';
import ClassList from './ClassList';
import RelationsList from './RelationsList';
import { useAppStore } from '../../../../../store/hooks/useAppStore';
import type { ClassDef, RelationType } from '../../../types/annotation.types';

interface InspectorTabProps {
  classes: ClassDef[];
  relationTypes: RelationType[];
  isLoading?: boolean;
}

export default function InspectorTab({ classes, relationTypes, isLoading = false }: InspectorTabProps) {
  const selectedObjectId = useAppStore(state => state.selectedObjectId);
  const annotatedObjects = useAppStore(state => state.annotatedObjects);
  const updateObject = useAppStore(state => state.updateObject);
  const deleteObject = useAppStore(state => state.deleteObject);
  const setSelectedObjectId = useAppStore(state => state.setSelectedObjectId);

  const { t } = useTranslation('annotation');

  const selectedObject = annotatedObjects.find((o) => o.id === selectedObjectId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* BBox Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        {/* Class Selector Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>

        <Separator />

        {/* List Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!selectedObject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">{t('rightPanel.inspector.noObjectSelected')}</p>
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
        onRename={(label) => updateObject(selectedObject.id, { label })}
        onDelete={() => {
          if (selectedObject) {
            deleteObject(selectedObject.id);
            setSelectedObjectId(null);
          }
        }}
      />

      {/* BBox */}
      {selectedObject.type === 'bbox' && (
        <BoundingBoxFields
          bbox={{
            xMin: selectedObject.coordinates[0],
            yMin: selectedObject.coordinates[1],
            xMax: selectedObject.coordinates[0] + selectedObject.coordinates[2],
            yMax: selectedObject.coordinates[1] + selectedObject.coordinates[3],
          }}
          onChange={(bbox) => updateObject(selectedObject.id, { 
            coordinates: [
              bbox.xMin, 
              bbox.yMin, 
              bbox.xMax - bbox.xMin, 
              bbox.yMax - bbox.yMin
            ] 
          })}
        />
      )}

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
      <RelationsList selectedObjectId={selectedObject.id} />
    </ScrollArea>
  );
}
