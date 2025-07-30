// Sample data for the pivot table
// export const sampleData = [
//   {
//     date: '2024-01-01',
//     product: 'Widget A',
//     region: 'North',
//     sales: 1000,
//     quantity: 50,
//   },
//   {
//     date: '2024-01-01',
//     product: 'Widget B',
//     region: 'South',
//     sales: 1500,
//     quantity: 75,
//   },
//   {
//     date: '2024-01-01',
//     product: 'Widget D',
//     region: 'North',
//     sales: 1300,
//     quantity: 70,
//   },
//   {
//     date: '2024-01-02',
//     product: 'Widget A',
//     region: 'East',
//     sales: 1200,
//     quantity: 60,
//   },
//   {
//     date: '2024-01-02',
//     product: 'Widget A',
//     region: 'East',
//     sales: 100,
//     quantity: 44,
//   },
//   {
//     date: '2024-01-02',
//     product: 'Widget C',
//     region: 'West',
//     sales: 800,
//     quantity: 40,
//   },
//   {
//     date: '2024-01-03',
//     product: 'Widget B',
//     region: 'North',
//     sales: 1800,
//     quantity: 90,
//   },
//   {
//     date: '2024-01-03',
//     product: 'Widget C',
//     region: 'South',
//     sales: 1100,
//     quantity: 55,
//   },
//   {
//     date: '2024-01-04',
//     product: 'Widget A',
//     region: 'West',
//     sales: 1300,
//     quantity: 65,
//   },
//   {
//     date: '2024-01-04',
//     product: 'Widget B',
//     region: 'East',
//     sales: 1600,
//     quantity: 80,
//   },
//   {
//     date: '2024-01-05',
//     product: 'Widget E',
//     region: 'North',
//     sales: 900,
//     quantity: 45,
//   },
//   {
//     date: '2024-01-05',
//     product: 'Widget F',
//     region: 'South',
//     sales: 1100,
//     quantity: 55,
//   },
//   {
//     date: '2024-01-06',
//     product: 'Widget G',
//     region: 'East',
//     sales: 1400,
//     quantity: 70,
//   },
//   {
//     date: '2024-01-06',
//     product: 'Widget H',
//     region: 'West',
//     sales: 1700,
//     quantity: 85,
//   },
//   {
//     date: '2024-01-07',
//     product: 'Widget I',
//     region: 'North',
//     sales: 1900,
//     quantity: 95,
//   },
//   {
//     date: '2024-01-07',
//     product: 'Widget J',
//     region: 'South',
//     sales: 2000,
//     quantity: 100,
//   },
// ];

// Pivot table configuration
// export const config = {
//   data: sampleData,
//   rows: [{ uniqueName: 'product', caption: 'Product' }],
//   columns: [{ uniqueName: 'region', caption: 'Region' }],
//   measures: [
//     {
//       uniqueName: 'sales',
//       caption: 'Total Sales',
//       aggregation: 'sum',
//       format: {
//         type: 'currency',
//         currency: 'USD',
//         locale: 'en-US',
//         decimals: 2,
//       },
//       sortable: true,
//     },
//     {
//       uniqueName: 'quantity',
//       caption: 'Total Quantity',
//       aggregation: 'sum',
//       format: {
//         type: 'number',
//         decimals: 0,
//         locale: 'en-US',
//       },
//       sortable: false,
//     },
//     {
//       uniqueName: 'averageSale',
//       caption: 'Average Sale',
//       aggregation: 'avg',
//       format: {
//         type: 'currency',
//         currency: 'USD',
//         locale: 'en-US',
//         decimals: 2,
//       },
//       formula: item => item.sales / item.quantity,
//       sortable: true,
//     },
//   ],
//   dimensions: [
//     { field: 'product', label: 'Product', type: 'string', sortable: true },
//     { field: 'region', label: 'Region', type: 'string', sortable: false },
//     { field: 'date', label: 'Date', type: 'date', sortable: true },
//     { field: 'sales', label: 'Sales', type: 'number', sortable: true },
//     { field: 'quantity', label: 'Quantity', type: 'number', sortable: false },
//   ],
//   defaultAggregation: 'sum',
//   isResponsive: true,
//   toolbar: true,
//   // Add initial sort configuration
//   initialSort: [
//     {
//       field: 'sales',
//       direction: 'desc',
//       type: 'measure',
//       aggregation: 'sum',
//     },
//   ],
//   groupConfig: {
//     rowFields: ['product'],
//     columnFields: ['region'],
//     grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
//   },
//   formatting: {
//     sales: {
//       type: 'currency',
//       currency: 'USD',
//       locale: 'en-US',
//       decimals: 2,
//     },
//     quantity: {
//       type: 'number',
//       decimals: 0,
//       locale: 'en-US',
//     },
//     averageSale: {
//       type: 'currency',
//       currency: 'USD',
//       locale: 'en-US',
//       decimals: 2,
//     },
//   },
//   conditionalFormatting: [
//     {
//       value: {
//         type: 'Number',
//         operator: 'Greater than',
//         value1: '1000',
//         value2: '',
//       },
//       format: {
//         font: 'Arial',
//         size: '14px',
//         color: '#ffffff',
//         backgroundColor: '#4CAF50',
//       },
//     },
//     {
//       value: {
//         type: 'Number',
//         operator: 'Less than',
//         value1: '500',
//         value2: '',
//       },
//       format: {
//         font: 'Arial',
//         size: '14px',
//         color: '#ffffff',
//         backgroundColor: '#F44336',
//       },
//     },
//   ],
//   onRowDragEnd: (fromIndex, toIndex, newData) => {
//     console.log('Row dragged:', { fromIndex, toIndex, newData });
//   },
//   onColumnDragEnd: (fromIndex, toIndex, newColumns) => {
//     console.log('Column dragged:', { fromIndex, toIndex, newColumns });
//   },
// };

export const sampleData = [
  // Australia - Accessories
  {
    country: 'Australia',
    category: 'Accessories',
    price: 174.0,
    discount: 23.0,
  },
  {
    country: 'Australia',
    category: 'Accessories',
    price: 680.0,
    discount: 80.0,
  },
  { country: 'Australia', category: 'Accessories', price: 9.0, discount: 8.0 },
  {
    country: 'Australia',
    category: 'Accessories',
    price: 174.0,
    discount: 43.0,
  },
  {
    country: 'Australia',
    category: 'Accessories',
    price: 680.0,
    discount: 11.0,
  },
  { country: 'Australia', category: 'Accessories', price: 9.0, discount: 90.0 },
  {
    country: 'Australia',
    category: 'Accessories',
    price: 174.0,
    discount: 0.0,
  },
  {
    country: 'Australia',
    category: 'Accessories',
    price: 680.0,
    discount: 0.0,
  },
  { country: 'Australia', category: 'Accessories', price: 9.0, discount: 0.0 },
  {
    country: 'Australia',
    category: 'Accessories',
    price: 174.0,
    discount: 0.0,
  },
  {
    country: 'Australia',
    category: 'Accessories',
    price: 680.0,
    discount: 0.0,
  },
  { country: 'Australia', category: 'Accessories', price: 9.0, discount: 0.0 },

  // Australia - Bikes
  { country: 'Australia', category: 'Bikes', price: 2749.0, discount: 25.0 },
  { country: 'Australia', category: 'Bikes', price: 1200.0, discount: 45.0 },
  { country: 'Australia', category: 'Bikes', price: 3250.0, discount: 180.0 },
  { country: 'Australia', category: 'Bikes', price: 890.0, discount: 1.0 },

  // Australia - Cars
  { country: 'Australia', category: 'Cars', price: 28500.0, discount: 1200.0 },
  { country: 'Australia', category: 'Cars', price: 32000.0, discount: 336.0 },

  // Australia - Clothing
  { country: 'Australia', category: 'Clothing', price: 89.0, discount: 12.0 },
  { country: 'Australia', category: 'Clothing', price: 125.0, discount: 8.0 },
  { country: 'Australia', category: 'Clothing', price: 67.0, discount: 5.0 },
  { country: 'Australia', category: 'Clothing', price: 234.0, discount: 45.0 },
  { country: 'Australia', category: 'Clothing', price: 156.0, discount: 15.0 },
  { country: 'Australia', category: 'Clothing', price: 78.0, discount: 8.0 },
  { country: 'Australia', category: 'Clothing', price: 345.0, discount: 89.0 },
  { country: 'Australia', category: 'Clothing', price: 234.0, discount: 67.0 },
  { country: 'Australia', category: 'Clothing', price: 156.0, discount: 45.0 },
  { country: 'Australia', category: 'Clothing', price: 89.0, discount: 23.0 },
  { country: 'Australia', category: 'Clothing', price: 67.0, discount: 12.0 },
  { country: 'Australia', category: 'Clothing', price: 234.0, discount: 67.0 },
  { country: 'Australia', category: 'Clothing', price: 156.0, discount: 89.0 },
  { country: 'Australia', category: 'Clothing', price: 89.0, discount: 12.0 },
  { country: 'Australia', category: 'Clothing', price: 125.0, discount: 34.0 },
  { country: 'Australia', category: 'Clothing', price: 78.0, discount: 23.0 },
  { country: 'Australia', category: 'Clothing', price: 345.0, discount: 45.0 },
  { country: 'Australia', category: 'Clothing', price: 234.0, discount: 12.0 },
  { country: 'Australia', category: 'Clothing', price: 89.0, discount: 8.0 },
  { country: 'Australia', category: 'Clothing', price: 156.0, discount: 67.0 },

  // Australia - Components
  {
    country: 'Australia',
    category: 'Components',
    price: 450.0,
    discount: 25.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 380.0,
    discount: 18.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 620.0,
    discount: 45.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 290.0,
    discount: 12.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 540.0,
    discount: 67.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 780.0,
    discount: 89.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 320.0,
    discount: 23.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 450.0,
    discount: 34.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 680.0,
    discount: 45.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 290.0,
    discount: 12.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 540.0,
    discount: 23.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 380.0,
    discount: 67.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 620.0,
    discount: 89.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 450.0,
    discount: 12.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 780.0,
    discount: 34.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 320.0,
    discount: 45.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 680.0,
    discount: 23.0,
  },
  {
    country: 'Australia',
    category: 'Components',
    price: 540.0,
    discount: 67.0,
  },

  // Canada - Accessories
  { country: 'Canada', category: 'Accessories', price: 156.0, discount: 12.0 },
  { country: 'Canada', category: 'Accessories', price: 89.0, discount: 23.0 },
  { country: 'Canada', category: 'Accessories', price: 234.0, discount: 45.0 },
  { country: 'Canada', category: 'Accessories', price: 67.0, discount: 8.0 },
  { country: 'Canada', category: 'Accessories', price: 345.0, discount: 67.0 },
  { country: 'Canada', category: 'Accessories', price: 123.0, discount: 12.0 },
  { country: 'Canada', category: 'Accessories', price: 78.0, discount: 23.0 },
  { country: 'Canada', category: 'Accessories', price: 234.0, discount: 45.0 },
  { country: 'Canada', category: 'Accessories', price: 156.0, discount: 67.0 },
  { country: 'Canada', category: 'Accessories', price: 89.0, discount: 89.0 },
  { country: 'Canada', category: 'Accessories', price: 345.0, discount: 12.0 },
  { country: 'Canada', category: 'Accessories', price: 234.0, discount: 34.0 },
  { country: 'Canada', category: 'Accessories', price: 123.0, discount: 23.0 },
  { country: 'Canada', category: 'Accessories', price: 67.0, discount: 45.0 },
  { country: 'Canada', category: 'Accessories', price: 156.0, discount: 67.0 },
  { country: 'Canada', category: 'Accessories', price: 89.0, discount: 12.0 },
  { country: 'Canada', category: 'Accessories', price: 234.0, discount: 23.0 },
  { country: 'Canada', category: 'Accessories', price: 345.0, discount: 45.0 },
  { country: 'Canada', category: 'Accessories', price: 78.0, discount: 67.0 },
  { country: 'Canada', category: 'Accessories', price: 123.0, discount: 89.0 },

  // Canada - Bikes
  { country: 'Canada', category: 'Bikes', price: 1850.0, discount: 45.0 },
  { country: 'Canada', category: 'Bikes', price: 2340.0, discount: 67.0 },
  { country: 'Canada', category: 'Bikes', price: 3100.0, discount: 89.0 },
  { country: 'Canada', category: 'Bikes', price: 1567.0, discount: 123.0 },
  { country: 'Canada', category: 'Bikes', price: 2890.0, discount: 67.0 },

  // Canada - Cars
  { country: 'Canada', category: 'Cars', price: 24500.0, discount: 890.0 },
  { country: 'Canada', category: 'Cars', price: 28900.0, discount: 456.0 },
  { country: 'Canada', category: 'Cars', price: 32500.0, discount: 67.0 },

  // Canada - Clothing
  { country: 'Canada', category: 'Clothing', price: 67.0, discount: 8.0 },
  { country: 'Canada', category: 'Clothing', price: 89.0, discount: 12.0 },
  { country: 'Canada', category: 'Clothing', price: 123.0, discount: 23.0 },
  { country: 'Canada', category: 'Clothing', price: 156.0, discount: 34.0 },
  { country: 'Canada', category: 'Clothing', price: 234.0, discount: 45.0 },
  { country: 'Canada', category: 'Clothing', price: 345.0, discount: 67.0 },
  { country: 'Canada', category: 'Clothing', price: 78.0, discount: 12.0 },
  { country: 'Canada', category: 'Clothing', price: 123.0, discount: 23.0 },
  { country: 'Canada', category: 'Clothing', price: 234.0, discount: 45.0 },
  { country: 'Canada', category: 'Clothing', price: 156.0, discount: 67.0 },
  { country: 'Canada', category: 'Clothing', price: 89.0, discount: 12.0 },
  { country: 'Canada', category: 'Clothing', price: 345.0, discount: 23.0 },
  { country: 'Canada', category: 'Clothing', price: 234.0, discount: 45.0 },
  { country: 'Canada', category: 'Clothing', price: 67.0, discount: 8.0 },

  // Canada - Components
  { country: 'Canada', category: 'Components', price: 380.0, discount: 23.0 },
  { country: 'Canada', category: 'Components', price: 540.0, discount: 45.0 },
  { country: 'Canada', category: 'Components', price: 620.0, discount: 67.0 },
  { country: 'Canada', category: 'Components', price: 780.0, discount: 89.0 },
  { country: 'Canada', category: 'Components', price: 450.0, discount: 12.0 },
  { country: 'Canada', category: 'Components', price: 320.0, discount: 23.0 },
  { country: 'Canada', category: 'Components', price: 680.0, discount: 45.0 },
  { country: 'Canada', category: 'Components', price: 290.0, discount: 8.0 },
  { country: 'Canada', category: 'Components', price: 540.0, discount: 67.0 },
  { country: 'Canada', category: 'Components', price: 380.0, discount: 12.0 },
  { country: 'Canada', category: 'Components', price: 620.0, discount: 23.0 },
  { country: 'Canada', category: 'Components', price: 450.0, discount: 45.0 },
  { country: 'Canada', category: 'Components', price: 780.0, discount: 67.0 },
  { country: 'Canada', category: 'Components', price: 320.0, discount: 8.0 },
  { country: 'Canada', category: 'Components', price: 680.0, discount: 89.0 },

  // France - Accessories
  { country: 'France', category: 'Accessories', price: 123.0, discount: 12.0 },
  { country: 'France', category: 'Accessories', price: 234.0, discount: 23.0 },
  { country: 'France', category: 'Accessories', price: 345.0, discount: 45.0 },
  { country: 'France', category: 'Accessories', price: 67.0, discount: 8.0 },
  { country: 'France', category: 'Accessories', price: 156.0, discount: 67.0 },
  { country: 'France', category: 'Accessories', price: 89.0, discount: 12.0 },
  { country: 'France', category: 'Accessories', price: 234.0, discount: 23.0 },
  { country: 'France', category: 'Accessories', price: 345.0, discount: 45.0 },
  { country: 'France', category: 'Accessories', price: 123.0, discount: 67.0 },
  { country: 'France', category: 'Accessories', price: 78.0, discount: 8.0 },
  { country: 'France', category: 'Accessories', price: 156.0, discount: 89.0 },
  { country: 'France', category: 'Accessories', price: 234.0, discount: 12.0 },
  { country: 'France', category: 'Accessories', price: 345.0, discount: 23.0 },
  { country: 'France', category: 'Accessories', price: 89.0, discount: 45.0 },
  { country: 'France', category: 'Accessories', price: 67.0, discount: 8.0 },

  // France - Bikes
  { country: 'France', category: 'Bikes', price: 2100.0, discount: 89.0 },
  { country: 'France', category: 'Bikes', price: 2850.0, discount: 123.0 },
  { country: 'France', category: 'Bikes', price: 1950.0, discount: 67.0 },
  { country: 'France', category: 'Bikes', price: 3200.0, discount: 234.0 },
  { country: 'France', category: 'Bikes', price: 1750.0, discount: 45.0 },

  // France - Cars
  { country: 'France', category: 'Cars', price: 26800.0, discount: 567.0 },
  { country: 'France', category: 'Cars', price: 31200.0, discount: 789.0 },
  { country: 'France', category: 'Cars', price: 29500.0, discount: 234.0 },

  // France - Clothing
  { country: 'France', category: 'Clothing', price: 78.0, discount: 8.0 },
  { country: 'France', category: 'Clothing', price: 123.0, discount: 12.0 },
  { country: 'France', category: 'Clothing', price: 156.0, discount: 23.0 },
  { country: 'France', category: 'Clothing', price: 234.0, discount: 34.0 },
  { country: 'France', category: 'Clothing', price: 89.0, discount: 45.0 },
  { country: 'France', category: 'Clothing', price: 345.0, discount: 67.0 },
  { country: 'France', category: 'Clothing', price: 67.0, discount: 8.0 },
  { country: 'France', category: 'Clothing', price: 234.0, discount: 12.0 },
  { country: 'France', category: 'Clothing', price: 156.0, discount: 23.0 },
  { country: 'France', category: 'Clothing', price: 89.0, discount: 34.0 },
  { country: 'France', category: 'Clothing', price: 345.0, discount: 45.0 },
  { country: 'France', category: 'Clothing', price: 123.0, discount: 8.0 },
  { country: 'France', category: 'Clothing', price: 78.0, discount: 67.0 },

  // France - Components
  { country: 'France', category: 'Components', price: 290.0, discount: 12.0 },
  { country: 'France', category: 'Components', price: 450.0, discount: 23.0 },
  { country: 'France', category: 'Components', price: 620.0, discount: 45.0 },
  { country: 'France', category: 'Components', price: 380.0, discount: 67.0 },
  { country: 'France', category: 'Components', price: 540.0, discount: 8.0 },
  { country: 'France', category: 'Components', price: 780.0, discount: 89.0 },
  { country: 'France', category: 'Components', price: 320.0, discount: 12.0 },
  { country: 'France', category: 'Components', price: 680.0, discount: 23.0 },
  { country: 'France', category: 'Components', price: 450.0, discount: 45.0 },
  { country: 'France', category: 'Components', price: 290.0, discount: 8.0 },
  { country: 'France', category: 'Components', price: 620.0, discount: 67.0 },
  { country: 'France', category: 'Components', price: 380.0, discount: 12.0 },

  // Germany - Accessories
  { country: 'Germany', category: 'Accessories', price: 89.0, discount: 12.0 },
  { country: 'Germany', category: 'Accessories', price: 156.0, discount: 23.0 },
  { country: 'Germany', category: 'Accessories', price: 234.0, discount: 45.0 },
  { country: 'Germany', category: 'Accessories', price: 123.0, discount: 8.0 },
  { country: 'Germany', category: 'Accessories', price: 345.0, discount: 67.0 },
  { country: 'Germany', category: 'Accessories', price: 67.0, discount: 12.0 },
  { country: 'Germany', category: 'Accessories', price: 78.0, discount: 23.0 },
  { country: 'Germany', category: 'Accessories', price: 234.0, discount: 45.0 },
  { country: 'Germany', category: 'Accessories', price: 156.0, discount: 8.0 },
  { country: 'Germany', category: 'Accessories', price: 89.0, discount: 67.0 },
  { country: 'Germany', category: 'Accessories', price: 345.0, discount: 12.0 },
  { country: 'Germany', category: 'Accessories', price: 123.0, discount: 23.0 },

  // Germany - Bikes
  { country: 'Germany', category: 'Bikes', price: 1980.0, discount: 123.0 },
  { country: 'Germany', category: 'Bikes', price: 2750.0, discount: 234.0 },
  { country: 'Germany', category: 'Bikes', price: 3150.0, discount: 89.0 },
  { country: 'Germany', category: 'Bikes', price: 1650.0, discount: 45.0 },

  // Germany - Cars
  { country: 'Germany', category: 'Cars', price: 27500.0, discount: 890.0 },
  { country: 'Germany', category: 'Cars', price: 33200.0, discount: 567.0 },
  { country: 'Germany', category: 'Cars', price: 30800.0, discount: 206.0 },

  // Germany - Clothing
  { country: 'Germany', category: 'Clothing', price: 67.0, discount: 8.0 },
  { country: 'Germany', category: 'Clothing', price: 123.0, discount: 12.0 },
  { country: 'Germany', category: 'Clothing', price: 89.0, discount: 23.0 },
  { country: 'Germany', category: 'Clothing', price: 234.0, discount: 34.0 },
  { country: 'Germany', category: 'Clothing', price: 156.0, discount: 45.0 },
  { country: 'Germany', category: 'Clothing', price: 345.0, discount: 8.0 },
  { country: 'Germany', category: 'Clothing', price: 78.0, discount: 67.0 },

  // Germany - Components
  { country: 'Germany', category: 'Components', price: 320.0, discount: 12.0 },
  { country: 'Germany', category: 'Components', price: 540.0, discount: 23.0 },
  { country: 'Germany', category: 'Components', price: 780.0, discount: 45.0 },
  { country: 'Germany', category: 'Components', price: 450.0, discount: 67.0 },
  { country: 'Germany', category: 'Components', price: 290.0, discount: 8.0 },
  { country: 'Germany', category: 'Components', price: 620.0, discount: 89.0 },
  { country: 'Germany', category: 'Components', price: 380.0, discount: 12.0 },
  { country: 'Germany', category: 'Components', price: 680.0, discount: 23.0 },
];

// Also update your config.js to match the new data structure:

export const config = {
  data: sampleData,
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    {
      uniqueName: 'price',
      caption: 'Sum of Price',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
    },
    {
      uniqueName: 'discount',
      caption: 'Sum of Discount',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
    },
  ],
  // Keep your existing conditionalFormatting, toolbar, etc.
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: 1000,
      },
      format: {
        backgroundColor: '#d4edda',
        color: '#155724',
      },
    },
  ],
  toolbar: true,
  isResponsive: true,
  pageSize: 10,
  // Add callback for drill-down
  onRowDragEnd: (fromIndex, toIndex, newData) => {
    console.log('Row dragged:', { fromIndex, toIndex, newData });
  },
  onColumnDragEnd: (fromIndex, toIndex, newColumns) => {
    console.log('Column dragged:', { fromIndex, toIndex, newColumns });
  },
};
