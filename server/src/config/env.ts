import 'dotenv/config';

import { z } from 'zod';

const portSchema = z.preprocess(
  (value) => (value === undefined || value === '' ? 3000 : Number(value)),
  z.number().int().min(1).max(65_535),
);

const runtimeEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: portSchema,
    CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
    COGNODB_URI: z.string().trim().optional(),
    COGNODB_USERNAME: z.string().trim().optional(),
    COGNODB_PASSWORD: z.string().optional(),
  })
  .passthrough();

export interface DatabaseConfig {
  configured: true;
  uri: string;
  username: string;
  password: string;
}

export interface MissingDatabaseConfig {
  configured: false;
  missing: Array<'COGNODB_URI' | 'COGNODB_USERNAME' | 'COGNODB_PASSWORD'>;
  reason: string;
}

export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  clientOrigin: string;
  database: DatabaseConfig | MissingDatabaseConfig;
}

const databaseVariableNames = ['COGNODB_URI', 'COGNODB_USERNAME', 'COGNODB_PASSWORD'] as const;

function createDatabaseConfig(
  values: z.infer<typeof runtimeEnvSchema>,
): DatabaseConfig | MissingDatabaseConfig {
  const missing = databaseVariableNames.filter((name) => !values[name]);
  if (missing.length > 0) {
    return {
      configured: false,
      missing,
      reason: `Missing required database configuration: ${missing.join(', ')}`,
    };
  }

  const uri = values.COGNODB_URI as string;
  if (!/^bolt\+s:\/\//i.test(uri)) {
    return {
      configured: false,
      missing: [],
      reason: 'COGNODB_URI must use the bolt+s:// scheme.',
    };
  }

  return {
    configured: true,
    uri,
    username: values.COGNODB_USERNAME as string,
    password: values.COGNODB_PASSWORD as string,
  };
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = runtimeEnvSchema.safeParse(environment);
  if (!parsed.success) {
    const reason = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid server configuration: ${reason}`);
  }

  return {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    clientOrigin: parsed.data.CLIENT_ORIGIN,
    database: createDatabaseConfig(parsed.data),
  };
}

let cachedConfig: AppConfig | undefined;

export function getConfig(): AppConfig {
  cachedConfig ??= loadConfig();
  return cachedConfig;
}

export function resetConfigForTests(): void {
  cachedConfig = undefined;
}
