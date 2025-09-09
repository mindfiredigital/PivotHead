import { Injectable } from '@angular/core';
import type { PivotDataRecord, FormatOptions } from './types';

/**
 * Service providing utility functions for PivotHead operations
 */

@Injectable({
  // <--- CORRECT POSITION
  providedIn: 'root',
})
export class PivotHeadService {
  // @Injectable({
  //   providedIn: 'root',
  // })
  /**
   * Validates pivot data format
   */
  validateData(data: unknown[]): data is PivotDataRecord[] {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return true;

    return data.every(
      item => item !== null && typeof item === 'object' && !Array.isArray(item)
    );
  }

  /**
   * Extracts unique field names from data
   */
  getFieldNames(data: PivotDataRecord[]): string[] {
    if (!data.length) return [];

    const fieldSet = new Set<string>();
    data.forEach(record => {
      Object.keys(record).forEach(key => fieldSet.add(key));
    });

    return Array.from(fieldSet);
  }

  /**
   * Groups data by specified fields
   */
  groupDataBy(
    data: PivotDataRecord[],
    fields: string[]
  ): Record<string, PivotDataRecord[]> {
    const groups: Record<string, PivotDataRecord[]> = {};

    data.forEach(record => {
      const groupKey = fields
        .map(field => String(record[field] ?? ''))
        .join('|');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(record);
    });

    return groups;
  }

  /**
   * Calculates aggregate values for grouped data
   */
  calculateAggregates(
    data: PivotDataRecord[],
    field: string,
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
  ): number {
    if (!data.length) return 0;

    const values = data
      .map(record => Number(record[field]))
      .filter(val => !isNaN(val));

    switch (aggregation) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.length
          ? values.reduce((sum, val) => sum + val, 0) / values.length
          : 0;
      case 'count':
        return values.length;
      case 'min':
        return values.length ? Math.min(...values) : 0;
      case 'max':
        return values.length ? Math.max(...values) : 0;
      default:
        return 0;
    }
  }

  /**
   * Creates format options for different data types
   */
  createFormatOptions(
    type: 'currency' | 'percentage' | 'number' | 'date',
    options?: Partial<FormatOptions>
  ): FormatOptions {
    const baseOptions: FormatOptions = {
      type,
      decimals: 2,
      decimalSeparator: '.',
      thousandSeparator: ',',
      align: 'right',
      nullValue: '-',
      ...options,
    };

    switch (type) {
      case 'currency':
        return {
          ...baseOptions,
          currency: 'USD',
          currencyAlign: 'left',
        };
      case 'percentage':
        return {
          ...baseOptions,
          percent: true,
        };
      case 'date':
        return {
          ...baseOptions,
          align: 'left',
          decimals: 0,
        };
      default:
        return baseOptions;
    }
  }

  /**
   * Exports data to CSV format
   */
  exportToCsv(data: PivotDataRecord[], filename = 'export.csv'): void {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : String(value ?? '');
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Filters data based on simple criteria
   */
  filterData(
    data: PivotDataRecord[],
    field: string,
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan',
    value: string | number
  ): PivotDataRecord[] {
    return data.filter(record => {
      const recordValue = record[field];

      switch (operator) {
        case 'equals':
          return String(recordValue) === String(value);
        case 'contains':
          return String(recordValue)
            .toLowerCase()
            .includes(String(value).toLowerCase());
        case 'greaterThan':
          return Number(recordValue) > Number(value);
        case 'lessThan':
          return Number(recordValue) < Number(value);
        default:
          return true;
      }
    });
  }
}
