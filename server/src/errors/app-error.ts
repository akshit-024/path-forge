export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly expose: boolean;

  public constructor(
    statusCode: number,
    code: string,
    message: string,
    options: { details?: unknown; expose?: boolean; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
    this.expose = options.expose ?? true;
  }
}

export class ValidationError extends AppError {
  public constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, { details });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  public constructor(message: string) {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseNotConfiguredError extends AppError {
  public constructor() {
    super(
      503,
      'DATABASE_NOT_CONFIGURED',
      'The graph database is not configured. Add the CognoDB environment variables and retry.',
    );
    this.name = 'DatabaseNotConfiguredError';
  }
}

export type DatabaseFailureKind = 'authentication' | 'unavailable' | 'query';

export class DatabaseUnavailableError extends AppError {
  public readonly kind: DatabaseFailureKind;

  public constructor(kind: DatabaseFailureKind, options: { cause?: unknown } = {}) {
    const descriptor = {
      authentication: {
        status: 503,
        code: 'DATABASE_AUTHENTICATION_FAILED',
        message: 'The graph database rejected the configured credentials.',
      },
      unavailable: {
        status: 503,
        code: 'DATABASE_UNAVAILABLE',
        message: 'The graph database is currently unavailable. Please retry shortly.',
      },
      query: {
        status: 500,
        code: 'DATABASE_QUERY_FAILED',
        message: 'The graph database could not complete the request.',
      },
    }[kind];

    super(descriptor.status, descriptor.code, descriptor.message, {
      cause: options.cause,
      expose: true,
    });
    this.name = 'DatabaseUnavailableError';
    this.kind = kind;
  }
}
