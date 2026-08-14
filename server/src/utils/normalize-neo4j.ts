import neo4j from 'neo4j-driver';

export function normalizeNeo4jValue(value: unknown): unknown {
  if (neo4j.isInt(value)) {
    return value.inSafeRange() ? value.toNumber() : value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeNeo4jValue);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeNeo4jValue(nestedValue)]),
    );
  }

  return value;
}
