// Utility functions for the PivotHead Vue wrapper
import { toRaw } from 'vue';

/**
 * Safely converts a value to JSON string for HTML attributes
 * @param value - The value to convert
 * @returns JSON string or undefined if conversion fails
 */
export function toJsonAttr(value: unknown): string | undefined {
  try {
    // Use toRaw to convert Vue reactive objects to plain objects
    const rawValue = toRaw(value);
    return JSON.stringify(rawValue);
  } catch {
    return undefined;
  }
}
