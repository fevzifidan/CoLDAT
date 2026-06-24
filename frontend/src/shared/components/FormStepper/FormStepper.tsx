// src/shared/components/FormStepper/FormStepper.tsx
import { CheckCircle2 } from 'lucide-react';

export interface Step {
  /** Unique step number (1-based) */
  number: number;
  /** Display label for the step */
  label: string;
}

interface FormStepperProps {
  /** Ordered list of all steps */
  steps: Step[];
  /** Current active step (1-based) */
  currentStep: number;
}

/**
 * Generic multi-step form indicator.
 *
 * Renders a horizontal progress bar with numbered circles,
 * used across task creation, dataset member addition, etc.
 *
 * Design matches the existing stepper in CreateTaskPage.
 */
const FormStepper = ({ steps, currentStep }: FormStepperProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.number} className="flex items-center gap-2">
            {index > 0 && <div className="h-px w-6 bg-border" />}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                    ? 'bg-primary/10 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={14} />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Only add connector after this step if not last */}
            {!isLast && <div className="h-px w-6 bg-border hidden sm:block" />}
          </div>
        );
      })}
    </div>
  );
};

export default FormStepper;
