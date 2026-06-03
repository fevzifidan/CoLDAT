import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssetItem } from './AssetSelectionStep';

interface AssetTableRowProps {
  asset: AssetItem;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  loadingImage?: boolean;
}

const AssetTableRow = ({
  asset,
  selected,
  disabled,
  onToggle,
}: AssetTableRowProps) => {
  const { t } = useTranslation(['tasks']);

  const assignedToOther = disabled && !selected;
  const willBeAssigned = selected && !disabled;

  return (
    <TableRow
      className={cn(
        'transition-colors',
        selected && 'bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Checkbox */}
      <TableCell className="w-12">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          disabled={disabled}
          title={
            assignedToOther
              ? t('tasks:create.asset_table.assigned_to_other_tooltip', {
                  user: asset.assigned_to || '',
                })
              : undefined
          }
        />
      </TableCell>

      {/* Preview */}
      <TableCell className="w-[52px]">
        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex items-center justify-center border">
          {asset.asset_url ? (
            <img
              src={asset.asset_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <ImageIcon size={16} className="text-muted-foreground" />
          )}
        </div>
      </TableCell>

      {/* Filename */}
      <TableCell>
        <p className="text-sm font-medium truncate max-w-[280px]">
          {asset.filename || '—'}
        </p>
        <p className="text-[10px] text-muted-foreground font-mono">
          {asset.asset_id.slice(0, 8)}...
        </p>
      </TableCell>

      {/* Assignment Status */}
      <TableCell className="w-48">
        {assignedToOther ? (
          <Badge
            variant="outline"
            className="text-destructive border-destructive/20 bg-destructive/5 gap-1 whitespace-nowrap"
          >
            <AlertCircle size={12} />
            {t('tasks:create.asset_table.assigned_to', {
              user: asset.assigned_to || '',
            })}
          </Badge>
        ) : willBeAssigned ? (
          <Badge
            variant="outline"
            className="text-primary border-primary/20 bg-primary/5 whitespace-nowrap"
          >
            {t('tasks:create.asset_table.will_be_assigned', 'Will be assigned')}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            {t('tasks:create.asset_table.available', 'Available')}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default AssetTableRow;
