import type {
  AxisConfig,
  MeasureConfig,
  AutoLayoutResult,
  DataRecord,
} from '../../types/interfaces';
import { logger } from '../../logger/logger.js';
import {
  MAX_CARDINALITY_FOR_DIMENSIONS,
  COMMON_ROW_FIELDS,
  COMMON_COLUMN_FIELDS,
} from '../../config/constants.js';
import { inferFieldTypes } from './fieldTypeInference';

/**
 * Build automatic layout based on CSV/JSON data per product rules
 */
export function buildAutoLayout(data: DataRecord[]): AutoLayoutResult {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  let workingData = data;

  // Single-column CSV special-case
  if (columns.length === 1) {
    const [only] = columns;
    const measures: MeasureConfig[] = [];
    // If the only column is numeric -> add __all__ and make it a measure
    const types = inferFieldTypes(workingData, columns);
    if (types[only] === 'number') {
      // OPTIMIZED: Mutate in place
      for (let i = 0; i < workingData.length; i++) {
        workingData[i].__all__ = 'All';
      }
      const rows: AxisConfig[] = [{ uniqueName: '__all__', caption: 'All' }];
      // Changed: ensure there is always a column axis
      const columnsAxis: AxisConfig[] = [
        { uniqueName: '__all__', caption: 'All' },
      ];
      measures.push({
        uniqueName: only,
        caption: `Sum of ${only}`,
        aggregation: 'sum',
        format: {
          type: 'number',
          decimals: 2,
          locale: 'en-US',
        },
      });
      return {
        rows,
        columns: columnsAxis,
        measures,
        data: workingData,
        columnsList: ['__all__', ...columns],
      };
    }
    // Otherwise treat it as a row dimension but still create a single synthetic column
    // OPTIMIZED: Mutate in place
    for (let i = 0; i < workingData.length; i++) {
      workingData[i].__all__ = 'All';
    }
    const rows: AxisConfig[] = [{ uniqueName: only, caption: only }];
    const columnsAxis: AxisConfig[] = [
      { uniqueName: '__all__', caption: 'All' },
    ];
    return {
      rows,
      columns: columnsAxis,
      measures,
      data: workingData,
      columnsList: ['__all__', ...columns],
    };
  }

  // General case
  const types = inferFieldTypes(workingData, columns);
  const numericFields = columns.filter(c => types[c] === 'number');
  const nonNumericFields = columns.filter(c => types[c] !== 'number');

  // Measures: all numeric columns -> sum with proper formatting
  // Apply rule: If a column has all numeric values, set it as a measure
  const measures: MeasureConfig[] = numericFields.map(f => {
    // Detect if the field might contain currency values
    const isCurrency = workingData.some(row => {
      const value = row[f];
      return typeof value === 'string' && /[$€£¥₹]/.test(value);
    });

    return {
      uniqueName: f,
      caption: `Sum of ${f}`,
      aggregation: 'sum',
      format: {
        type: isCurrency ? 'currency' : 'number',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      sortabled: true,
    };
  });

  // Decide rows/columns
  let rows: AxisConfig[] = [];
  let columnsAxis: AxisConfig[] = [];

  // Utility to compute cardinality - OPTIMIZED for large datasets
  const totalRows = workingData.length || 1;
  const shouldSample = totalRows > 10000; // Sample if more than 10k rows
  const sampleSize = shouldSample ? Math.min(5000, totalRows) : totalRows;
  const sampleData = shouldSample
    ? workingData.slice(0, sampleSize)
    : workingData;

  const uniqueCount = (field: string) => {
    // For large datasets, estimate cardinality from sample
    const uniqueInSample = new Set(sampleData.map(r => r?.[field])).size;
    if (!shouldSample) return uniqueInSample;

    // Estimate total unique count: unique_in_sample * (total_rows / sample_size)
    // But cap at total rows
    const estimated = Math.round(uniqueInSample * (totalRows / sampleSize));
    return Math.min(estimated, totalRows);
  };

  // Raw sample cardinality — used only for the dimension filter so that
  // inflated estimates don't incorrectly exclude low-cardinality fields
  const uniqueCountInSample = (field: string) =>
    new Set(sampleData.map(r => r?.[field])).size;

  if (nonNumericFields.length === 0) {
    // All numeric -> add __all__ and set both rows and columns as All
    // OPTIMIZED: Mutate in place instead of creating new array
    for (let i = 0; i < workingData.length; i++) {
      workingData[i].__all__ = 'All';
    }
    rows = [{ uniqueName: '__all__', caption: 'All' }];
    columnsAxis = [{ uniqueName: '__all__', caption: 'All' }];
    return {
      rows,
      columns: columnsAxis,
      measures,
      data: workingData,
      columnsList: ['__all__', ...columns],
    };
  }

  // Rank non-numeric fields by cardinality (low to high), prefer repetitive fields
  // Apply rule: If the table has repetitive records for non-numeric columns
  const ranked = nonNumericFields
    .map(f => ({ f, u: uniqueCount(f) }))
    .sort((a, b) => a.u - b.u);

  // Debug logging
  logger.info('DEBUG: Non-numeric fields:', nonNumericFields);
  logger.info('DEBUG: Ranked fields:', ranked);
  logger.info('DEBUG: Total rows:', totalRows);

  // Select candidate dimensions - fields that have more than one unique value
  // but fewer than the total number of rows (indicating repetition)
  // IMPORTANT: Limit cardinality to prevent performance issues with large tables
  // Max 100 unique values prevents creating pivot tables with hundreds of rows/columns
  const candidateDims = ranked.filter(x => {
    // Use raw sample count for the upper bound check — the estimated total can be
    // amplified (sample * scale-factor) and falsely exclude low-cardinality fields
    const rawU = uniqueCountInSample(x.f);
    return x.u > 1 && x.u < totalRows && rawU <= MAX_CARDINALITY_FOR_DIMENSIONS;
  });

  logger.info(
    'DEBUG: Candidate dimensions (filtered by max cardinality):',
    candidateDims
  );
  logger.info(
    'DEBUG: Detailed ranked fields:',
    ranked.map(r => ({ field: r.f, unique: r.u }))
  );

  if (candidateDims.length >= 2) {
    // Use first two most repetitive fields for rows and columns
    // Sort by cardinality first, then apply business logic for common field names
    const sortedCandidates = candidateDims.sort((a, b) => {
      if (a.u !== b.u) return a.u - b.u; // Sort by cardinality first

      // Apply business logic for common field patterns
      const aField = a.f.toLowerCase().trim();
      const bField = b.f.toLowerCase().trim();

      // Common row fields (geographical, organizational hierarchy)
      const rowFields = COMMON_ROW_FIELDS;
      // Common column fields (products, time periods, categories)
      const columnFields = COMMON_COLUMN_FIELDS;

      const aIsRow = rowFields.some(rf => aField.includes(rf));
      const bIsRow = rowFields.some(rf => bField.includes(rf));
      const aIsColumn = columnFields.some(cf => aField.includes(cf));
      const bIsColumn = columnFields.some(cf => bField.includes(cf));

      logger.info('DEBUG: Field comparison:', {
        aField,
        bField,
        aIsRow,
        bIsRow,
        aIsColumn,
        bIsColumn,
      });

      // If one is clearly a row field and the other is not, prioritize the row field
      if (aIsRow && !bIsRow) return -1;
      if (bIsRow && !aIsRow) return 1;

      // If one is clearly a column field and the other is not, the column field goes second
      if (aIsColumn && !bIsColumn) return 1;
      if (bIsColumn && !aIsColumn) return -1;

      // Fall back to alphabetical ordering
      return aField.localeCompare(bField);
    });

    logger.info(
      'DEBUG: Sorted candidates:',
      sortedCandidates.map(c => ({ field: c.f, unique: c.u }))
    );

    // Assign the first field to rows, second to columns
    // Ensure we use the exact field names from the data (preserve case and whitespace)
    rows = [
      { uniqueName: sortedCandidates[0].f, caption: sortedCandidates[0].f },
    ];
    columnsAxis = [
      { uniqueName: sortedCandidates[1].f, caption: sortedCandidates[1].f },
    ];

    logger.info(
      'DEBUG: Final assignment - Rows:',
      rows,
      'Columns:',
      columnsAxis
    );
  } else if (candidateDims.length === 1) {
    // Only one repetitive non-numeric -> set as rows only
    rows = [
      { uniqueName: candidateDims[0].f, caption: candidateDims[0].f.trim() },
    ];
  } else if (nonNumericFields.length >= 2) {
    // If we have at least 2 non-numeric fields, use the first two even if not highly repetitive
    // Apply the same business logic as above
    const sortedByCardinality = ranked.sort((a, b) => {
      if (a.u !== b.u) return a.u - b.u;

      const aField = a.f.toLowerCase().trim();
      const bField = b.f.toLowerCase().trim();

      const rowFields = [
        'region',
        'country',
        'state',
        'city',
        'category',
        'department',
      ];
      const columnFields = [
        'product',
        'item',
        'month',
        'quarter',
        'year',
        'type',
      ];

      const aIsRow = rowFields.some(rf => aField.includes(rf));
      const bIsRow = rowFields.some(rf => bField.includes(rf));
      const aIsColumn = columnFields.some(cf => aField.includes(cf));
      const bIsColumn = columnFields.some(cf => bField.includes(cf));

      if (aIsRow && !bIsRow) return -1;
      if (bIsRow && !aIsRow) return 1;
      if (aIsColumn && !bIsColumn) return 1;
      if (bIsColumn && !aIsColumn) return -1;

      return aField.localeCompare(bField);
    });
    rows = [
      {
        uniqueName: sortedByCardinality[0].f,
        caption: sortedByCardinality[0].f.trim(),
      },
    ];
    columnsAxis = [
      {
        uniqueName: sortedByCardinality[1].f,
        caption: sortedByCardinality[1].f.trim(),
      },
    ];
  } else {
    // No repetitive non-numeric -> use first non-numeric as rows
    rows = [{ uniqueName: ranked[0].f, caption: ranked[0].f.trim() }];
  }

  // NEW: If no column axis was selected, synthesize a single '__all__' column
  if (!columnsAxis || columnsAxis.length === 0) {
    // OPTIMIZED: Mutate in place
    for (let i = 0; i < workingData.length; i++) {
      workingData[i].__all__ = 'All';
    }
    columnsAxis = [{ uniqueName: '__all__', caption: 'All' }];
  }

  return {
    rows,
    columns: columnsAxis,
    measures,
    data: workingData,
    columnsList: Object.keys(workingData[0] || {}),
  };
}
