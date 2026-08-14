const items = [
  { label: 'Target role', shape: 'rounded-md', color: 'bg-slate-900' },
  { label: 'Specialization track', shape: 'rounded-sm', color: 'bg-orange-700' },
  { label: 'Skill', shape: 'rounded-full', color: 'bg-teal-600' },
  { label: 'Project', shape: 'rounded-sm rotate-45', color: 'bg-indigo-600' },
];

const edges = [
  { label: 'Has track', color: 'bg-orange-600', dashed: false },
  { label: 'Requires', color: 'bg-slate-500', dashed: false },
  { label: 'Prerequisite for', color: 'bg-teal-500', dashed: true },
  { label: 'Builds', color: 'bg-indigo-500', dashed: false },
];

export function GraphLegend() {
  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.68rem] font-bold text-slate-500"
      aria-label="Graph legend"
    >
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`size-3 ${item.shape} ${item.color}`} aria-hidden="true" />
          {item.label}
        </span>
      ))}
      <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden="true" />
      {edges.map((edge) => (
        <span key={edge.label} className="flex items-center gap-1.5">
          <span
            className={`h-0.5 w-5 ${edge.color} ${edge.dashed ? 'border-t border-dashed border-white' : ''}`}
            aria-hidden="true"
          />
          {edge.label}
        </span>
      ))}
      <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden="true" />
      <span className="flex items-center gap-1.5">
        <span
          className="size-3 rounded-full border-2 border-amber-500 bg-white"
          aria-hidden="true"
        />
        Selected and connected
      </span>
    </div>
  );
}
