export const demoData = [
  {
    Category: 'Furniture',
    SubCategory: 'Chairs',
    Sales: 1200,
    Region: 'North',
  },
  {
    Category: 'Furniture',
    SubCategory: 'Tables',
    Sales: 1500,
    Region: 'South',
  },
  {
    Category: 'Electronics',
    SubCategory: 'Phones',
    Sales: 3000,
    Region: 'East',
  },
  {
    Category: 'Electronics',
    SubCategory: 'Laptops',
    Sales: 4500,
    Region: 'West',
  },
];

export const demoOptions = {
  rows: [{ uniqueName: 'Category', caption: 'Category' }],
  columns: [{ uniqueName: 'SubCategory', caption: 'SubCategory' }],
  measures: [
    { uniqueName: 'Sales', aggregation: 'sum', caption: 'Total Sales' },
  ],
} as const;
