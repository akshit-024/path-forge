import { Check } from 'lucide-react';

interface PlannerStepsProps {
  currentStep: 1 | 2 | 3;
  onStepChange: (step: 1 | 2 | 3) => void;
  hasRole: boolean;
  hasAnalysis: boolean;
}

const steps = [
  { number: 1 as const, label: 'Target role' },
  { number: 2 as const, label: 'Current skills' },
  { number: 3 as const, label: 'Your route' },
];

export function PlannerSteps({
  currentStep,
  onStepChange,
  hasRole,
  hasAnalysis,
}: PlannerStepsProps) {
  return (
    <ol className="grid grid-cols-3" aria-label="Planner progress">
      {steps.map((step, index) => {
        const complete = currentStep > step.number;
        const active = currentStep === step.number;
        const enabled =
          step.number === 1 || (step.number === 2 && hasRole) || (step.number === 3 && hasAnalysis);

        return (
          <li key={step.number} className="relative flex flex-col items-center">
            {index > 0 ? (
              <span
                className={`absolute right-1/2 top-4 h-0.5 w-full ${currentStep >= step.number ? 'bg-teal-600' : 'bg-slate-200'}`}
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              disabled={!enabled}
              onClick={() => onStepChange(step.number)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Go to step ${step.number}: ${step.label}`}
              className="relative z-10 flex flex-col items-center gap-2 rounded-lg px-1 py-1 transition-colors enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:cursor-default"
            >
              <span
                className={`grid size-8 place-items-center rounded-full border-2 text-xs font-black ${
                  active || complete
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {complete ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : step.number}
              </span>
              <span
                className={`text-[0.7rem] font-extrabold sm:text-xs ${active ? 'text-teal-800' : 'text-slate-500'}`}
              >
                {step.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
