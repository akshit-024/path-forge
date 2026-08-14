import { useCallback, useEffect, useState } from 'react';
import { pathforgeApi } from '../api/client';
import type { DatabaseState } from '../types/domain';

interface DatabaseStatusValue {
  status: DatabaseState | 'checking';
  message: string;
  retry: () => void;
}

export function useDatabaseStatus(): DatabaseStatusValue {
  const [status, setStatus] = useState<DatabaseState | 'checking'>('checking');
  const [message, setMessage] = useState('Checking career graph connection…');
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    void pathforgeApi
      .getHealth(controller.signal)
      .then((health) => {
        setStatus(health.database.status);
        setMessage(health.database.message);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('unavailable');
        setMessage('The application server could not be reached.');
      });

    return () => controller.abort();
  }, [attempt]);

  return { status, message, retry };
}
