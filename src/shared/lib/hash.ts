// ID generation utilities

export function getUuid(): string {
  return crypto.randomUUID();
}

export function getSnowId(): string {
  // Simple snowflake-like ID: timestamp + random
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
