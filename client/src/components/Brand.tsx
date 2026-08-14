import { Waypoints } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-lg text-slate-950 no-underline"
      aria-label="PathForge home"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-white shadow-sm">
        <Waypoints size={20} strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span
        className={
          compact
            ? 'hidden font-extrabold tracking-tight sm:inline'
            : 'font-extrabold tracking-tight'
        }
      >
        Path<span className="text-teal-700">Forge</span>
      </span>
    </Link>
  );
}
