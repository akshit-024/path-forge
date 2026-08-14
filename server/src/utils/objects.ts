export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Expected ${label} to be an object.`);
  }
  return value;
}

export function asString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Expected ${label} to be a string.`);
  }
  return value;
}

export function asNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Expected ${label} to be a finite number.`);
  }
  return value;
}

export function asBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Expected ${label} to be a boolean.`);
  }
  return value;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
