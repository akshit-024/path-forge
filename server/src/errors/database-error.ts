import neo4j from 'neo4j-driver';

import { AppError, DatabaseUnavailableError } from './app-error.js';

const authenticationCodes = new Set([
  'Neo.ClientError.Security.Unauthorized',
  'Neo.ClientError.Security.AuthenticationRateLimit',
  'Neo.ClientError.Security.CredentialsExpired',
]);

const unavailableCodeFragments = [
  'ServiceUnavailable',
  'SessionExpired',
  'ConnectionAcquisitionTimeout',
  'DatabaseUnavailable',
];

export function classifyDatabaseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

  if (authenticationCodes.has(code)) {
    return new DatabaseUnavailableError('authentication', { cause: error });
  }

  if (unavailableCodeFragments.some((fragment) => code.includes(fragment))) {
    return new DatabaseUnavailableError('unavailable', { cause: error });
  }

  if (neo4j.isRetriableError(error)) {
    return new DatabaseUnavailableError('unavailable', { cause: error });
  }

  return new DatabaseUnavailableError('query', { cause: error });
}
