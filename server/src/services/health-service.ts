import type { AppConfig } from '../config/env.js';
import { verifyDatabaseConnectivity } from '../db/driver.js';
import type { HealthResponse } from '../types/api.js';
import type { HealthService } from '../types/services.js';

export class DefaultHealthService implements HealthService {
  public constructor(private readonly config: AppConfig) {}

  public async getHealth(): Promise<HealthResponse> {
    if (!this.config.database.configured) {
      return this.response(
        'not_configured',
        'CognoDB is not configured. The application is running, but graph features are unavailable.',
      );
    }

    try {
      await verifyDatabaseConnectivity(this.config);
      return this.response('connected', 'CognoDB is configured and reachable.');
    } catch {
      return this.response(
        'unavailable',
        'CognoDB is configured but currently unreachable. Check the service and credentials.',
      );
    }
  }

  private response(status: HealthResponse['database']['status'], message: string): HealthResponse {
    return {
      status: 'ok',
      database: { status, message },
      timestamp: new Date().toISOString(),
    };
  }
}
