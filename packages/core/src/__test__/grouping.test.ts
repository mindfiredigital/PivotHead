import { describe, it, expect } from 'vitest';
import { PivotEngine } from '../engine/pivotEngine';
import { PivotTableConfig, GroupConfig } from '../types/interfaces';

describe('PivotEngine Grouping', () => {
  const sampleData = [
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
      date: '2024-01-02',
      product: 'Widget A',
      region: 'East',
      sales: 1200,
      quantity: 60,
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
  ];

  const config: PivotTableConfig<(typeof sampleData)[0]> = {
    data: sampleData,
    rows: [{ uniqueName: 'product', caption: 'Product' }],
    columns: [{ uniqueName: 'date', caption: 'Date' }],
    measures: [
      {
        uniqueName: 'sales',
        caption: 'Total Sales',
        aggregation: 'sum',
        format: { type: 'currency', currency: 'USD' },
      },
      {
        uniqueName: 'quantity',
        caption: 'Total Quantity',
        aggregation: 'sum',
        format: { type: 'number' },
      },
      {
        uniqueName: 'averageSale',
        caption: 'Average Sale',
        aggregation: 'avg',
        format: { type: 'currency', currency: 'USD' },
      },
    ],
    dimensions: [
      { field: 'product', label: 'Product', type: 'string' },
      { field: 'region', label: 'Region', type: 'string' },
      { field: 'date', label: 'Date', type: 'date' },
      { field: 'sales', label: 'Sales', type: 'string' },
      { field: 'quantity', label: 'Quantity', type: 'string' },
    ],
    defaultAggregation: 'sum',
    isResponsive: true,
    groupConfig: {
      rowFields: ['product'],
      columnFields: ['date'],
      grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
    },
  };

  it('should group data by a single row field', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      rowFields: ['region'],
      columnFields: [],
      grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groups = engine.getGroupedData();
    expect(groups).toHaveLength(4); // North, South, East, West
    expect(groups[0].key).toBe('North');
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].key).toBe('South');
    expect(groups[1].items).toHaveLength(2);
    expect(groups[2].key).toBe('East');
    expect(groups[2].items).toHaveLength(1);
    expect(groups[3].key).toBe('West');
    expect(groups[3].items).toHaveLength(1);
  });

  it('should group data by multiple row fields', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      rowFields: ['date', 'region'],
      columnFields: [],
      grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groups = engine.getGroupedData();
    expect(groups).toHaveLength(6); // 6 unique date-region combinations

    // Check first date group (2024-01-01)
    expect(groups[0]?.key).toBe('2024-01-01 - North');
    expect(groups[0]?.items).toHaveLength(1);
    expect(groups[1]?.key).toBe('2024-01-01 - South');
    expect(groups[1]?.items).toHaveLength(1);

    // Check second date group (2024-01-02)
    expect(groups[2]?.key).toBe('2024-01-02 - East');
    expect(groups[2]?.items).toHaveLength(1);
    expect(groups[3]?.key).toBe('2024-01-02 - West');
    expect(groups[3]?.items).toHaveLength(1);

    // Check third date group (2024-01-03)
    expect(groups[4]?.key).toBe('2024-01-03 - North');
    expect(groups[4]?.items).toHaveLength(1);
    expect(groups[5]?.key).toBe('2024-01-03 - South');
    expect(groups[5]?.items).toHaveLength(1);
  });

  // it('should group data by row and column fields', () => {
  //   const engine = new PivotEngine(config);
  //   const groupConfig: GroupConfig = {
  //     rowFields: ['region'],
  //     columnFields: ['date'],
  //     grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
  //   };
  //   engine.setGroupConfig(groupConfig);

  //   const groups = engine.getGroupedData();
  //   expect(groups).toHaveLength(4); // 4 regions

  //   // Check row groups
  //   expect(groups[0].key).toBe('North');
  //   expect(groups[1].key).toBe('South');
  //   expect(groups[2].key).toBe('East');
  //   expect(groups[3].key).toBe('West');

  //   // Check for subgroups (columns)
  //   groups.forEach((group) => {
  //     expect(group.subgroups).toBeDefined();
  //     expect(group.subgroups?.length).toBe(3); // 3 dates
  //     expect(group.subgroups?.[0].key).toBe('2024-01-01');
  //     expect(group.subgroups?.[1].key).toBe('2024-01-02');
  //     expect(group.subgroups?.[2].key).toBe('2024-01-03');
  //   });
  // });

  it('should return ungrouped data when group config is null', () => {
    const engine = new PivotEngine({ ...config, groupConfig: null });

    const groups = engine.getGroupedData();
    expect(groups).toHaveLength(0);
    expect(engine.getState().rawData).toEqual(sampleData);
  });

  // it('should maintain grouping after sorting', () => {
  //   const engine = new PivotEngine(config);
  //   const groupConfig: GroupConfig = {
  //     rowFields: ['region'],
  //     columnFields: [],
  //     grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
  //   };
  //   engine.setGroupConfig(groupConfig);
  //   engine.sort('sales', 'desc');

  //   const groups = engine.getGroupedData();
  //   expect(groups).toHaveLength(4);
  //   expect(groups[0].key).toBe('North');
  //   expect(groups[0].items[0].sales).toBe(1800); // Highest sales in North
  //   expect(groups[1].key).toBe('South');
  //   expect(groups[1].items[0].sales).toBe(1500); // Highest sales in South
  // });

  it('should handle empty data set', () => {
    const emptyConfig: PivotTableConfig<(typeof sampleData)[0]> = {
      ...config,
      data: [],
    };
    const engine = new PivotEngine(emptyConfig);

    const groups = engine.getGroupedData();
    expect(groups).toHaveLength(0);
  });

  it('should handle grouping by non-existent field', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      rowFields: ['nonExistentField'],
      columnFields: [],
      grouper: (item, fields) =>
        fields.map(field => item[field] || 'N/A').join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groups = engine.getGroupedData();
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe('N/A');
    expect(groups[0].items).toHaveLength(sampleData.length);
  });

  it('should calculate aggregates for grouped data', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      rowFields: ['region'],
      columnFields: [],
      grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groups = engine.getGroupedData();
    expect(groups).toHaveLength(4);

    groups.forEach(group => {
      expect(group).toHaveProperty('aggregates');
      expect(group.aggregates).toHaveProperty('sum_sales');
      expect(group.aggregates).toHaveProperty('sum_quantity');
    });

    // Check specific aggregate values
    expect(groups[0].aggregates.sum_sales).toBe(2800); // North: 1000 + 1800
    expect(groups[0].aggregates.sum_quantity).toBe(140); // North: 50 + 90
    expect(groups[1].aggregates.sum_sales).toBe(2600); // South: 1500 + 1100
    expect(groups[1].aggregates.sum_quantity).toBe(130); // South: 75 + 55
  });
});
