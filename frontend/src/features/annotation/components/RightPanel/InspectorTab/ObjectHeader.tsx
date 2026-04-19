import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnnotatedObject } from '../../../types/annotation.types';
import { ConfirmAction } from '@/components/custom/Confirm/ConfirmAction';

interface ObjectHeaderProps {
  object: AnnotatedObject;
  onToggleVisible: () => void;
  onToggleLocked: () => void;
  onDelete: () => void;
}

export default function ObjectHeader({
  object,
  onToggleVisible,
  onToggleLocked,
  onDelete,
}: ObjectHeaderProps) {
  return (
    <div className="px-4 py-3 border-b shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: object.color }}
            />
            <h3 className="text-sm font-semibold truncate">{object.label}</h3>
          </div>
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
