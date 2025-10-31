import {
  PivotDataRecord,
  PivotOptions,
} from '@mindfiredigital/pivothead-angular';

export const sampleData: PivotDataRecord[] = [
  { country: 'USA', product: 'Laptop', sales: 1500 },
  { country: 'USA', product: 'Mouse', sales: 120 },
  { country: 'Canada', product: 'Laptop', sales: 900 },
  { country: 'Canada', product: 'Mouse', sales: 75 },
  { country: 'USA', product: 'Keyboard', sales: 250 },
  { country: 'Canada', product: 'Keyboard', sales: 150 },
];

export const sampleOptions: PivotOptions = {
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'country', caption: 'Country' }],
  measures: [
    { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
  ],
};
