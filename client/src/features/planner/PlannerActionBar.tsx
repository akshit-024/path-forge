import { ArrowLeft, BarChart3 } from 'lucide-react';

interface PlannerActionBarProps {
  roleName: string;
  selectedCount: number;
  totalCount: number | null;
  loading: boolean;
  disabled: boolean;
  onBack: () => void;
  onAnalyze: () => void;
}

export function PlannerActionBar({
  roleName,
  selectedCount,
  totalCount,
  loading,
  disabled,
  onBack,
  onAnalyze,
}: PlannerActionBarProps) {
  return (
    <aside
      className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mt-8 rounded-2xl border border-slate-300 bg-white/95 p-3 shadow-[0_14px_35px_rgb(15_42_67/18%)] backdrop-blur-xl sm:p-4"
      aria-label="Planner analysis actions"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-extrabold text-slate-800" aria-live="polite">
          {roleName} ·{' '}
          {totalCount === null
            ? 'Loading requirements…'
            : `${selectedCount} of ${totalCount} requirements selected`}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            className="button-secondary"
            onClick={onBack}
            aria-label="Back to target role selection"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back
          </button>
          <button type="button" className="button-primary" disabled={disabled} onClick={onAnalyze}>
            {loading ? (
              <>
                <span
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                Analyzing your route…
              </>
            ) : (
              <>
                <BarChart3 size={17} aria-hidden="true" /> Analyze my readiness
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
