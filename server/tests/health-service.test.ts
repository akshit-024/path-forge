import { describe, expect, it } from 'vitest';

import type { AppConfig } from '../src/config/env.js';
import { DefaultHealthService } from '../src/services/health-service.js';

describe('DefaultHealthService', () => {
  it('reports not_configured without attempting to create a database driver', async () => {
    const config: AppConfig = {
      nodeEnv: 'test',
      port: 3000,
      clientOrigin: 'http://localhost:5173',
      database: {
        configured: false,
        missing: ['COGNODB_URI', 'COGNODB_USERNAME', 'COGNODB_PASSWORD'],
        reason: 'Missing database variables',
      },
    };

    const result = await new DefaultHealthService(config).getHealth();
    expect(result.status).toBe('ok');
    expect(result.database.status).toBe('not_configured');
    expect(result.database.message).not.toContain('password');
  });
});
