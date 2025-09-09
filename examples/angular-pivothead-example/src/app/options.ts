export type PivotOptions = {
  rows?: unknown[];
  columns?: unknown[];
  measures?: unknown[];
  pageSize?: number;
  [k: string]: unknown;
};

export const baseOptions: PivotOptions = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    { uniqueName: 'price', caption: 'Sum of Price', aggregation: 'sum' },
    { uniqueName: 'discount', caption: 'Sum of Discount', aggregation: 'sum' },
  ],
  pageSize: 10,
};
