import neo4j from 'neo4j-driver';
import { describe, expect, it } from 'vitest';

import { normalizeNeo4jValue } from '../src/utils/normalize-neo4j.js';

describe('normalizeNeo4jValue', () => {
  it('recursively converts safe Neo4j integers into JSON-safe numbers', () => {
    expect(
      normalizeNeo4jValue({ count: neo4j.int(12), nested: [neo4j.int(3), 'unchanged'] }),
    ).toEqual({ count: 12, nested: [3, 'unchanged'] });
  });

  it('preserves unsafe integer precision as a string', () => {
    expect(normalizeNeo4jValue(neo4j.int('9007199254740993'))).toBe('9007199254740993');
  });
});
