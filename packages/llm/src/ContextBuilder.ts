import type { PivotContext, FieldSchema } from './types.js';

type RawRow = Record<string, unknown>;

interface GroupConfig {
  rowFields?: string[];
  columnFields?: string[];
}

interface BuildOptions {
  groupConfig?: GroupConfig;
  sortConfig?: unknown;
  filters?: unknown;
}

/**
 * Builds a PivotContext from raw engine state.
 * Used internally by LLMAssistant so users never have to construct PivotContext manually.
 */
export class ContextBuilder {
  static fromRawData(
    rawData: RawRow[],
    options: BuildOptions = {}
  ): PivotContext {
    if (!rawData.length) {
      return { fields: [], sampleRows: [], pivotOutput: [], currentState: {} };
    }

    const firstRow = rawData[0];
    const allKeys = Object.keys(firstRow);

    const fields: FieldSchema[] = allKeys.map(name => {
      const val = firstRow[name];
      const type: FieldSchema['type'] =
        typeof val === 'number' ? 'number' : 'string';
      if (type === 'string') {
        const unique = [
          ...new Set(rawData.map(r => String(r[name])).filter(Boolean)),
        ];
        if (unique.length <= 20) return { name, type, values: unique };
      }
      return { name, type };
    });

    const rowField = options.groupConfig?.rowFields?.[0] ?? null;
    const colField = options.groupConfig?.columnFields?.[0] ?? null;
    const numericFields = fields
      .filter(f => f.type === 'number')
      .map(f => f.name);

    // Compute aggregated pivot output so the LLM has real numbers to reason about
    let pivotOutput: RawRow[] = [];
    if (rowField) {
      const groupMap = new Map<string, RawRow>();
      rawData.forEach(row => {
        const key = colField
          ? `${String(row[rowField])}||${String(row[colField])}`
          : String(row[rowField]);

        if (!groupMap.has(key)) {
          const entry: RawRow = { [rowField]: row[rowField] };
          if (colField) entry[colField] = row[colField];
          numericFields.forEach(f => (entry[`${f}_sum`] = 0));
          entry['_count'] = 0;
          groupMap.set(key, entry);
        }

        const entry = groupMap.get(key)!;
        numericFields.forEach(
          f =>
            (entry[`${f}_sum`] =
              (Number(entry[`${f}_sum`]) || 0) + (Number(row[f]) || 0))
        );
        entry['_count'] = (Number(entry['_count']) || 0) + 1;
      });

      pivotOutput = [...groupMap.values()];
      pivotOutput.forEach(row => {
        numericFields.forEach(f => {
          const key = `${f}_sum`;
          if (typeof row[key] === 'number') {
            row[key] = Math.round((row[key] as number) * 100) / 100;
          }
        });
      });
    }

    const sortConfig = Array.isArray(options.sortConfig)
      ? (options.sortConfig[0] as Record<string, unknown>)
      : (options.sortConfig as Record<string, unknown> | undefined);

    return {
      fields,
      sampleRows: rawData.slice(0, 5),
      pivotOutput: pivotOutput.slice(0, 10),
      currentState: {
        groupBy: rowField ?? undefined,
        sortBy: sortConfig?.['field'] as string | undefined,
        filters: (options.filters as Record<string, unknown>) ?? {},
      },
    };
  }
}
