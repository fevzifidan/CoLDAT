import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AnnotatedObject } from '../../../types/annotation.types';
import { ConfirmAction } from '@/components/custom/Confirm/ConfirmAction';

interface ObjectHeaderProps {
  object: AnnotatedObject;
  onToggleVisible: () => void;
  onToggleLocked: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

export default function ObjectHeader({
  object,
  onToggleVisible,
  onToggleLocked,
  onRename,
  onDelete,
}: ObjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(object.label);

  useEffect(() => {
    setEditValue(object.label);
  }, [object.label]);

  const handleSave = () => {
    if (editValue.trim()) {
      onRename(editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(object.label);
    setIsEditing(false);
  };

  return (
    <div className="px-4 py-3 border-b shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-1 pr-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="h-8 text-xs font-semibold py-1 px-2"
                autoFocus
              />
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-50"
                  onClick={handleSave}
                >
                  <Check size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleCancel}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: object.color }}
              />
              <h3 className="text-sm font-semibold truncate max-w-[120px]">{object.label}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={11} />
              </Button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            ID: #{object.id}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onToggleVisible}
            title={object.visible ? 'Hide' : 'Show'}
          >
            {object.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onToggleLocked}
            title={object.locked ? 'Unlock' : 'Lock'}
          >
            {object.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </Button>
          <ConfirmAction
            onConfirm={onDelete}
            title="Bu nesneyi silmek istediğinizden emin misiniz?"
            confirmText="Delete"
            cancelText="Cancel"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 size={13} />
            </Button>
          </ConfirmAction>
        </div>
      </div>
    </div>
  );
}
