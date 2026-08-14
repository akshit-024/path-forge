import { CircleAlert, CircleCheck, LoaderCircle, RefreshCw } from 'lucide-react';
import type { DatabaseState } from '../types/domain';

interface DatabaseStatusProps {
  status: DatabaseState | 'checking';
  message: string;
  onRetry: () => void;
}

const labels = {
  checking: 'Checking database',
  connected: 'Graph connected',
  unavailable: 'Graph unavailable',
  not_configured: 'Setup needed',
} as const;

export function DatabaseStatus({ status, message, onRetry }: DatabaseStatusProps) {
  const isHealthy = status === 'connected';
  const tone = isHealthy
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'checking'
      ? 'border-slate-200 bg-slate-50 text-slate-600'
      : 'border-amber-200 bg-amber-50 text-amber-800';

  const Icon = isHealthy ? CircleCheck : status === 'checking' ? LoaderCircle : CircleAlert;

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold ${tone}`}
    >
      <Icon
        size={14}
        className={status === 'checking' ? 'animate-spin' : undefined}
        aria-hidden="true"
      />
      <span className="hidden lg:inline">{labels[status]}</span>
      <span className="sr-only">{message}</span>
      {!isHealthy && status !== 'checking' ? (
        <button
          type="button"
          className="rounded-full p-0.5 hover:bg-black/5"
          onClick={onRetry}
          aria-label="Check database status again"
          title={message}
        >
          <RefreshCw size={13} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
