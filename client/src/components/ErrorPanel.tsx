import { AlertTriangle, DatabaseZap, RefreshCw } from 'lucide-react';
import { ApiError } from '../api/client';

interface ErrorPanelProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  compact?: boolean;
}

function describeError(error: unknown) {
  if (error instanceof ApiError) {
    if (
      error.status === 503 ||
      error.code === 'DATABASE_UNAVAILABLE' ||
      error.code === 'DATABASE_NOT_CONFIGURED'
    ) {
      return {
        title:
          error.code === 'DATABASE_NOT_CONFIGURED'
            ? 'Career graph setup needed'
            : 'Career graph unavailable',
        message: error.message,
        database: true,
      };
    }
    if (error.status === 404) {
      return { title: 'Role not found', message: error.message, database: false };
    }
    if (error.status === 400) {
      return { title: 'Check your selections', message: error.message, database: false };
    }
    return { title: 'We hit an unexpected problem', message: error.message, database: false };
  }

  return {
    title: 'We hit an unexpected problem',
    message: 'PathForge could not complete this request. Please try again.',
    database: false,
  };
}

export function ErrorPanel({ error, onRetry, title, compact = false }: ErrorPanelProps) {
  const details = describeError(error);
  const Icon = details.database ? DatabaseZap : AlertTriangle;

  return (
    <div
      role="alert"
      className={`rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold">{title ?? details.title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-900/80">{details.message}</p>
          {details.database ? (
            <p className="mt-2 text-xs font-semibold text-amber-800/80">
              Your selections are safe in this browser. No sample results have been substituted.
            </p>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="button-secondary mt-4 border-amber-300 bg-white/80"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
