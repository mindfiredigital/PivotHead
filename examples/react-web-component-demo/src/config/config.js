export const data = [
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'North',
    sales: 1000,
    quantity: 50,
  },
  {
    date: '2024-01-01',
    product: 'Widget B',
    region: 'South',
    sales: 1500,
    quantity: 75,
  },
  {
    date: '2024-01-01',
    product: 'Widget D',
    region: 'North',
    sales: 1300,
    quantity: 70,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'East',
    sales: 1200,
    quantity: 60,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'East',
    sales: 100,
    quantity: 44,
  },
  {
    date: '2024-01-02',
    product: 'Widget C',
    region: 'West',
    sales: 800,
    quantity: 40,
  },
  {
    date: '2024-01-03',
    product: 'Widget B',
    region: 'North',
    sales: 1800,
    quantity: 90,
  },
  {
    date: '2024-01-03',
    product: 'Widget C',
    region: 'South',
    sales: 1100,
    quantity: 55,
  },
  {
    date: '2024-01-04',
    product: 'Widget A',
    region: 'West',
    sales: 1300,
    quantity: 65,
  },
  {
    date: '2024-01-04',
    product: 'Widget B',
    region: 'East',
    sales: 1600,
    quantity: 80,
  },
];

export const options = {
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      sortable: true,
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 0,
        locale: 'en-US',
      },
      sortable: false,
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      formula: item => item.sales / item.quantity,
      sortable: true,
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string', sortable: true },
    { field: 'region', label: 'Region', type: 'string', sortable: false },
    { field: 'date', label: 'Date', type: 'date', sortable: true },
    { field: 'sales', label: 'Sales', type: 'number', sortable: true },
    { field: 'quantity', label: 'Quantity', type: 'number', sortable: false },
  ],
  defaultAggregation: 'sum',
  isResponsive: true,
  toolbar: true,
  initialSort: [
    {
      field: 'sales',
      direction: 'desc',
      type: 'measure',
      aggregation: 'sum',
    },
  ],
  groupConfig: {
    rowFields: ['product'],
    columnFields: ['region'],
    grouper: (item, fields) => fields.map(field => item[field]).join('|'),
  },
  formatting: {
    sales: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
    quantity: {
      type: 'number',
      decimals: 0,
      locale: 'en-US',
    },
    averageSale: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
  },
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1000',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#4CAF50',
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Less than',
        value1: '500',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#F44336',
      },
    },
  ],
};
