import type { LucideIcon } from 'lucide-react';
import { RouteOff } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon: Icon = RouteOff,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50/75 text-center ${compact ? 'p-5' : 'p-9'}`}
    >
      <span className="mx-auto grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
        <Icon size={21} aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-extrabold text-slate-800">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
