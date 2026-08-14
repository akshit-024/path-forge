interface LoadingStateProps {
  label?: string;
  cards?: number;
}

export function LoadingState({ label = 'Loading', cards = 3 }: LoadingStateProps) {
  return (
    <div role="status" aria-label={label} aria-live="polite" className="space-y-4 py-2">
      <span className="sr-only">{label}</span>
      <div className="skeleton h-5 w-40 rounded-md" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="skeleton mb-4 h-4 w-24 rounded" />
            <div className="skeleton mb-2 h-6 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton mt-2 h-4 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GraphLoadingState() {
  return (
    <div
      role="status"
      aria-label="Loading graph data"
      aria-live="polite"
      className="grid min-h-[430px] place-items-center bg-slate-50 px-6 text-center"
    >
      <div>
        <div className="mx-auto mb-5 flex items-center justify-center gap-2" aria-hidden="true">
          <span className="skeleton size-12 rounded-full" />
          <span className="h-px w-14 bg-slate-300" />
          <span className="skeleton size-16 rounded-2xl" />
          <span className="h-px w-14 bg-slate-300" />
          <span className="skeleton size-11 rounded-lg" />
        </div>
        <p className="font-bold text-slate-800">Building the role neighborhood…</p>
        <p className="mt-1 text-sm text-slate-500">
          Tracing requirements, prerequisites and projects.
        </p>
      </div>
    </div>
  );
}
