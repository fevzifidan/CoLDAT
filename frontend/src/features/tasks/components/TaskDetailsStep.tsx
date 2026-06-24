import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Database, AlertCircle, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// --- Types ---
export interface TaskFormData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: Date | undefined;
}

interface TaskDetailsStepProps {
  formData: TaskFormData;
  onChange: (data: Partial<TaskFormData>) => void;
  datasetName?: string;
}

// Priority yapılandırması
const PRIORITY_OPTIONS: {
  value: TaskFormData['priority'];
  label: string;
  color: string;
}[] = [
  { value: 'low', label: 'Low', color: 'bg-emerald-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-amber-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const TaskDetailsStep = ({
  formData,
  onChange,
  datasetName,
}: TaskDetailsStepProps) => {
  const { t } = useTranslation(['tasks']);

  const selectedPriority = PRIORITY_OPTIONS.find(
    (p) => p.value === formData.priority
  );

  return (
    <div className="space-y-6">
      {/* Dataset bilgisi */}
      {datasetName && (
        <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1">
          <Database size={12} />
          {datasetName}
        </Badge>
      )}

      {/* Task Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('tasks:create.details.name_label', 'Task Name')}
          <span className="text-xs text-muted-foreground ml-1">
            ({t('tasks:create.details.optional', 'optional')})
          </span>
        </label>
        <Input
          placeholder={t(
            'tasks:create.details.name_placeholder',
            'e.g. Bounding box annotation for vehicle detection'
          )}
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="bg-background"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('tasks:create.details.description_label', 'Description')}
          <span className="text-xs text-muted-foreground ml-1">
            ({t('tasks:create.details.optional', 'optional')})
          </span>
        </label>
        <Textarea
          placeholder={t(
            'tasks:create.details.description_placeholder',
            'Provide additional context or instructions for this task...'
          )}
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="min-h-[80px] bg-background resize-y"
        />
      </div>

      {/* Priority + Deadline Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Priority */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('tasks:create.details.priority_label', 'Priority')}
          </label>
          <Select
            value={formData.priority}
            onValueChange={(v) =>
              onChange({ priority: v as TaskFormData['priority'] })
            }
          >
            <SelectTrigger className="w-full h-11 bg-background">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {selectedPriority && (
                    <>
                      <div
                        className={`h-3 w-3 rounded-full ${selectedPriority.color}`}
                      />
                      <span>{selectedPriority.label}</span>
                    </>
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('tasks:create.details.deadline_label', 'Deadline')}
            <span className="text-xs text-muted-foreground ml-1">
              ({t('tasks:create.details.optional', 'optional')})
            </span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full h-11 justify-start text-left font-normal bg-background',
                  !formData.deadline && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.deadline ? (
                  format(formData.deadline, 'PPP')
                ) : (
                  <span>
                    {t(
                      'tasks:create.details.deadline_placeholder',
                      'Pick a date'
                    )}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 min-w-[280px]" align="start">
              <Calendar
                mode="single"
                selected={formData.deadline}
                onSelect={(date) => onChange({ deadline: date })}
                disabled={(date) => date < new Date()}
                className="w-full"
              />
            </PopoverContent>
          </Popover>
          {formData.deadline && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onChange({ deadline: undefined })}
            >
              {t('tasks:create.details.clear_deadline', 'Clear deadline')}
            </Button>
          )}
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
        <AlertCircle size={14} className="shrink-0 mt-0.5 text-primary" />
        <span>
          {t(
            'tasks:create.details.hint',
            'Priority and deadline help organize and track task progress. These fields are optional.'
          )}
        </span>
      </div>
    </div>
  );
};

export default TaskDetailsStep;
