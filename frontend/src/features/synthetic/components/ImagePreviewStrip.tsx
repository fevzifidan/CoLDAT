// frontend/src/features/synthetic/components/ImagePreviewStrip.tsx

import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSyntheticStore } from '../store/syntheticSlice';
// Using plain overflow div instead of Radix ScrollArea to avoid layout thrash during resize
import { ImageIcon, Loader2, XCircle, CheckSquare, Square } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ---- Sortable Preview Item ----
function SortablePreviewItem({
  image,
  isActive,
  isSelected,
  onSelect,
  onActivate,
  onRemove,
  t,
}: {
  image: { id: string; thumbnailUrl?: string; prompt: string };
  isActive: boolean;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onActivate: () => void;
  onRemove: () => void;
  t: (key: string, params?: object) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div className="relative">
        <button
          onClick={onActivate}
          className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
            isActive
              ? 'border-primary ring-1 ring-primary'
              : isSelected
                ? 'border-emerald-500 ring-1 ring-emerald-500'
                : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          {image.thumbnailUrl ? (
            <img
              src={image.thumbnailUrl}
              alt={image.prompt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon size={16} className="text-muted-foreground/50" />
            </div>
          )}
        </button>

        {/* Selection checkbox - top left */}
        <button
          onClick={onSelect}
          className={`absolute top-1 left-1 w-5 h-5 rounded flex items-center justify-center transition-opacity ${
            isSelected
              ? 'bg-emerald-500 text-white opacity-100'
              : 'bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100'
          } shadow-sm`}
          title={isSelected ? t('preview.deselectTooltip') : t('preview.selectTooltip')}
        >
          {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
        </button>

        {/* Drag handle - top right */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 w-5 h-5 rounded bg-background/80 text-muted-foreground 
                     flex items-center justify-center opacity-0 group-hover:opacity-100 
                     transition-opacity shadow-sm cursor-grab active:cursor-grabbing"
          title={t('preview.dragHandle')}
        >
          <span className="text-[10px] font-bold">⋮⋮</span>
        </button>

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full 
                     flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title={t('preview.discardTooltip')}
        >
          <XCircle size={12} />
        </button>

        {/* Active indicator dot */}
        {isActive && (
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
        )}

        {/* Selection count badge */}
        {isSelected && !isActive && (
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        )}
      </div>
    </div>
  );
}

export default function ImagePreviewStrip() {
  const { t } = useTranslation(['synthetic']);
  const {
    images,
    activeImageId,
    selectedImageIds,
    setActiveImage,
    removeImage,
    toggleImageSelection,
    selectRange,
    deselectAllImages,
    reorderImages,
    isGenerating,
  } = useSyntheticStore();

  const lastClickedRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum 5px hareket — click vs drag ayrımı
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderImages(oldIndex, newIndex);
      }
    },
    [images, reorderImages]
  );

  const handleItemClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      // Ctrl/Cmd+Click → toggle multi-select
      if (e.ctrlKey || e.metaKey) {
        toggleImageSelection(id);
        lastClickedRef.current = id;
        return;
      }

      // Shift+Click → range select
      if (e.shiftKey && lastClickedRef.current) {
        selectRange(lastClickedRef.current, id);
        return;
      }

      // Normal click → single select + clear multi
      deselectAllImages();
      setActiveImage(id);
      lastClickedRef.current = id;
    },
    [toggleImageSelection, selectRange, deselectAllImages, setActiveImage]
  );

  const handleSelectClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      toggleImageSelection(id);
      lastClickedRef.current = id;
    },
    [toggleImageSelection]
  );

  return (
    <div className="flex flex-col h-full border-l border-border bg-muted/10">
      {/* Header */}
      <div className="shrink-0 px-2.5 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {t('preview.header', { count: images.length })}
          </p>
          {selectedImageIds.length > 0 && (
            <span className="text-[10px] font-medium text-emerald-500">
              {t('preview.selectedCount', { count: selectedImageIds.length })}
            </span>
          )}
        </div>
        {selectedImageIds.length > 0 && (
          <button
            onClick={() => deselectAllImages()}
            className="text-[9px] text-muted-foreground hover:text-foreground mt-1 transition"
          >
            {t('preview.clearSelection')}
          </button>
        )}
      </div>

      {/* Preview List */}
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-2 space-y-2">
              {images.length === 0 && !isGenerating && (
                <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
                  <ImageIcon size={20} className="opacity-30" />
                  <span className="text-[10px]">{t('preview.empty')}</span>
                </div>
              )}

              {isGenerating && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}

              {images.map((image) => (
                <SortablePreviewItem
                  key={image.id}
                  image={image}
                  isActive={activeImageId === image.id}
                  isSelected={selectedImageIds.includes(image.id)}
                  onSelect={(e) => handleSelectClick(image.id, e)}
                  onActivate={() => {
                    deselectAllImages();
                    setActiveImage(image.id);
                    lastClickedRef.current = image.id;
                  }}
                  onRemove={() => removeImage(image.id)}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
