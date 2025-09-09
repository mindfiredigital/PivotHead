// Utility functions for the PivotHead Angular wrapper

/**
 * Safely converts a value to JSON string for HTML attributes
 * @param value - The value to convert
 * @returns JSON string or undefined if conversion fails
 */
export function toJsonAttr(value: unknown): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}
