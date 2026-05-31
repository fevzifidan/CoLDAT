import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Eye, AlertCircle, User as UserIcon } from 'lucide-react';
import type { DatasetMember } from './MemberSelectionStep';

interface RoleSelectionStepProps {
  selectedMember: DatasetMember;
  selectedRole: 'Annotator' | 'Viewer';
  onRoleChange: (role: 'Annotator' | 'Viewer') => void;
}

const RoleSelectionStep = ({
  selectedMember,
  selectedRole,
  onRoleChange,
}: RoleSelectionStepProps) => {
  const { t } = useTranslation(['tasks']);

  const roleOptions: { value: 'Annotator' | 'Viewer'; icon: React.ReactNode; hint: string }[] = [
    {
      value: 'Annotator',
      icon: <Pencil size={14} className="shrink-0" />,
      hint: t('tasks:create.role.annotator_hint', 'Annotators can edit annotations. An asset cannot be assigned to two different annotators.'),
    },
    {
      value: 'Viewer',
      icon: <Eye size={14} className="shrink-0" />,
      hint: t('tasks:create.role.viewer_hint', 'Viewers can only view annotations. Multiple viewers can view the same asset.'),
    },
  ];

  const currentRole = roleOptions.find((r) => r.value === selectedRole)!;

  return (
    <div className="space-y-6">
      {/* Selected Member Card - shows dataset role info */}
      <div className="p-4 rounded-xl border bg-muted/30 flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
            {selectedMember.username[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg truncate">@{selectedMember.username}</p>
            <Badge variant="secondary" className="text-[10px] h-5">
              {t('tasks:create.role.selected_user', 'Selected User')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {t('tasks:create.role.dataset_role', 'Dataset role:')}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase ${
                selectedMember.role === 'owner'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                  : selectedMember.role === 'annotator'
                  ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/20 dark:text-sky-400'
                  : 'border-muted-foreground/20'
              }`}
            >
              {selectedMember.role === 'owner'
                ? t('tasks:create.member_role_owner', 'Owner')
                : selectedMember.role === 'annotator'
                ? t('tasks:create.role.annotator', 'Annotator')
                : t('tasks:create.role.viewer', 'Viewer')}
            </Badge>
          </div>
        </div>
        <div className="hidden sm:block p-2 rounded-full bg-primary/5 text-primary">
          <UserIcon size={20} />
        </div>
      </div>

      {/* Role Selector */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {t('tasks:create.role.label', 'Task Role')}
        </p>

        <Select
          value={selectedRole}
          onValueChange={(v) => onRoleChange(v as 'Annotator' | 'Viewer')}
        >
          <SelectTrigger className="w-full sm:w-64 h-11">
            <SelectValue>
              <div className="flex items-center gap-2">
                {currentRole.icon}
                <span>
                  {selectedRole === 'Annotator'
                    ? t('tasks:create.role.annotator', 'Annotator')
                    : t('tasks:create.role.viewer', 'Viewer')}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                <div className="flex items-center gap-2">
                  {role.icon}
                  <span>
                    {role.value === 'Annotator'
                      ? t('tasks:create.role.annotator', 'Annotator')
                      : t('tasks:create.role.viewer', 'Viewer')}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role hint showing constraint based on dataset role */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-primary" />
          <span>
            {selectedMember.role === 'viewer' && selectedRole === 'Annotator'
              ? t('tasks:create.role.viewer_cannot_annotate', 'This user is a Viewer in the dataset. Annotator task role may not be allowed. Please add them as Annotator to the dataset first.')
              : selectedMember.role === 'annotator' || selectedMember.role === 'owner'
              ? t('tasks:create.role.allowed_hint', 'This user can be assigned both Annotator and Viewer tasks.')
              : currentRole.hint}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionStep;
