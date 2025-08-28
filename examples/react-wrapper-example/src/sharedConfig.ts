export type DataRecord = Record<string, unknown>;

export const demoData: DataRecord[] = [
  { country: 'Australia', category: 'Accessories', price: 174, discount: 23 },
  { country: 'Australia', category: 'Accessories', price: 680, discount: 80 },
  { country: 'Australia', category: 'Cars', price: 900, discount: 50 },
  { country: 'Australia', category: 'Electronics', price: 1200, discount: 120 },
  { country: 'Canada', category: 'Cars', price: 180, discount: 80 },
  { country: 'Canada', category: 'Electronics', price: 850, discount: 85 },
  { country: 'Canada', category: 'Accessories', price: 320, discount: 40 },
  { country: 'USA', category: 'Electronics', price: 1500, discount: 150 },
  { country: 'USA', category: 'Cars', price: 2200, discount: 220 },
  { country: 'USA', category: 'Accessories', price: 450, discount: 45 },
  { country: 'Germany', category: 'Cars', price: 1800, discount: 90 },
  { country: 'Germany', category: 'Electronics', price: 950, discount: 95 },
  { country: 'France', category: 'Accessories', price: 380, discount: 38 },
  { country: 'France', category: 'Cars', price: 1600, discount: 160 },
  { country: 'UK', category: 'Electronics', price: 1100, discount: 110 },
];

import type { PivotOptions } from '@mindfiredigital/pivothead-react';

export const baseOptions: PivotOptions = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    { uniqueName: 'price', caption: 'Sum of Price', aggregation: 'sum' },
    { uniqueName: 'discount', caption: 'Sum of Discount', aggregation: 'sum' },
  ],
  pageSize: 10,
};
