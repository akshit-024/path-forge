import neo4j, { type Driver, type QueryResult, type RecordShape } from 'neo4j-driver';

import { getConfig, type AppConfig, type DatabaseConfig } from '../config/env.js';
import { DatabaseNotConfiguredError } from '../errors/app-error.js';
import { classifyDatabaseError } from '../errors/database-error.js';
import { normalizeNeo4jValue } from '../utils/normalize-neo4j.js';

let driver: Driver | undefined;
let driverConfigurationKey: string | undefined;

function requireDatabaseConfig(config: AppConfig): DatabaseConfig {
  if (!config.database.configured) {
    throw new DatabaseNotConfiguredError();
  }
  return config.database;
}

export function getDriver(config: AppConfig = getConfig()): Driver {
  const database = requireDatabaseConfig(config);
  const configurationKey = `${database.uri}\0${database.username}`;

  if (driver && driverConfigurationKey === configurationKey) {
    return driver;
  }

  if (driver) {
    void driver.close().catch(() => undefined);
  }

  driver = neo4j.driver(database.uri, neo4j.auth.basic(database.username, database.password), {
    maxConnectionPoolSize: 10,
    connectionAcquisitionTimeout: 5_000,
    maxConnectionLifetime: 30 * 60 * 1_000,
  });
  driverConfigurationKey = configurationKey;
  return driver;
}

export async function verifyDatabaseConnectivity(config: AppConfig = getConfig()): Promise<void> {
  try {
    await getDriver(config).verifyConnectivity();
  } catch (error) {
    throw classifyDatabaseError(error);
  }
}

export async function closeDriver(): Promise<void> {
  const activeDriver = driver;
  driver = undefined;
  driverConfigurationKey = undefined;
  if (activeDriver) {
    await activeDriver.close();
  }
}

export async function runRead(
  query: string,
  parameters: Record<string, unknown> = {},
  config: AppConfig = getConfig(),
): Promise<Record<string, unknown>[]> {
  const session = getDriver(config).session({ defaultAccessMode: neo4j.session.READ });
  try {
    const result = await session.executeRead((transaction) => transaction.run(query, parameters));
    return normalizeResult(result);
  } catch (error) {
    throw classifyDatabaseError(error);
  } finally {
    await session.close();
  }
}

export async function runWrite(
  query: string,
  parameters: Record<string, unknown> = {},
  config: AppConfig = getConfig(),
): Promise<Record<string, unknown>[]> {
  const session = getDriver(config).session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    const result = await session.executeWrite((transaction) => transaction.run(query, parameters));
    return normalizeResult(result);
  } catch (error) {
    throw classifyDatabaseError(error);
  } finally {
    await session.close();
  }
}

function normalizeResult(result: QueryResult<RecordShape>): Record<string, unknown>[] {
  return result.records.map(
    (record) => normalizeNeo4jValue(record.toObject()) as Record<string, unknown>,
  );
}
