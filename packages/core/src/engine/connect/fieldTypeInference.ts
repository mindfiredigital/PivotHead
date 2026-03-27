import type { FieldType, DataRecord } from '../../types/interfaces';
import { parseCurrencyToNumber } from './currencyParser';

/**
 * Infer field types from data sample
 */
export function inferFieldTypes(
  data: DataRecord[],
  columns: string[]
): Record<string, FieldType> {
  const result: Record<string, FieldType> = {};
  const sample = data.slice(0, Math.min(200, data.length));

  for (const col of columns) {
    let num = 0,
      str = 0,
      date = 0,
      bool = 0,
      nul = 0;
    for (const row of sample) {
      const v = row?.[col];
      if (v === null || v === undefined || v === '') {
        nul++;
        continue;
      }
      if (typeof v === 'number') num++;
      else if (typeof v === 'boolean') bool++;
      else if (typeof v === 'string') {
        // Currency-like strings should count as numbers
        const currencyNum = parseCurrencyToNumber(v);
        if (currencyNum !== null) {
          num++;
          continue;
        }
        const ts = Date.parse(v);
        if (!isNaN(ts) && /\d{4}-\d{2}-\d{2}|\//.test(v)) date++;
        else if (!isNaN(Number(v))) num++;
        else str++;
      } else if (v instanceof Date) date++;
      else str++;
    }
    const counts = { num, str, date, bool, nul } as const;
    const maxKey = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [
      'str',
    ])[0];
    switch (maxKey) {
      case 'num':
        result[col] = 'number';
        break;
      case 'date':
        result[col] = 'date';
        break;
      case 'bool':
        result[col] = 'boolean';
        break;
      case 'str':
        result[col] = 'string';
        break;
      default:
        result[col] = 'unknown';
    }
  }
  return result;
}
