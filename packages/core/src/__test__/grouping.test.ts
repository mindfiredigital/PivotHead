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
    columns: [
      { field: 'date', label: 'Date' },
      { field: 'product', label: 'Product' },
      { field: 'region', label: 'Region' },
      { field: 'sales', label: 'Sales' },
      { field: 'quantity', label: 'Quantity' },
    ],
    groupConfig: null,
  };

  it('should group data by a single field', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      fields: ['region'],
      grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groupedData = engine.getGroupedData();
    expect(groupedData).toHaveLength(4); // North, South, East, West
    expect(groupedData[0].key).toBe('North');
    expect(groupedData[0].items).toHaveLength(2);
    expect(groupedData[1].key).toBe('South');
    expect(groupedData[1].items).toHaveLength(2);
    expect(groupedData[2].key).toBe('East');
    expect(groupedData[2].items).toHaveLength(1);
    expect(groupedData[3].key).toBe('West');
    expect(groupedData[3].items).toHaveLength(1);
  });

  it('should group data by multiple fields', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      fields: ['date', 'region'],
      grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groupedData = engine.getGroupedData();
    expect(groupedData).toHaveLength(6); // 6 unique date-region combinations

    // Check first date group (2024-01-01)
    expect(groupedData[0]?.key).toBe('2024-01-01 - North');
    expect(groupedData[0]?.items).toHaveLength(1); // Only one item in this group
    expect(groupedData[1]?.key).toBe('2024-01-01 - South');
    expect(groupedData[1]?.items).toHaveLength(1); // Only one item in this group

    // Check second date group (2024-01-02)
    expect(groupedData[2]?.key).toBe('2024-01-02 - East');
    expect(groupedData[2]?.items).toHaveLength(1); // Only one item in this group
    expect(groupedData[3]?.key).toBe('2024-01-02 - West');
    expect(groupedData[3]?.items).toHaveLength(1); // Only one item in this group

    // Check third date group (2024-01-03)
    expect(groupedData[4]?.key).toBe('2024-01-03 - North');
    expect(groupedData[4]?.items).toHaveLength(1); // Only one item in this group
    expect(groupedData[5]?.key).toBe('2024-01-03 - South');
    expect(groupedData[5]?.items).toHaveLength(1); // Only one item in this group
  });

  it('should return ungrouped data when group config is null', () => {
    const engine = new PivotEngine(config);
    engine.setGroupConfig(null);

    const groupedData = engine.getGroupedData();
    expect(groupedData).toHaveLength(0);
    expect(engine.getState().data).toEqual(sampleData);
  });

  it('should maintain grouping after sorting', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      fields: ['region'],
      grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
    };
    engine.setGroupConfig(groupConfig);
    engine.sort('sales', 'desc');

    const groupedData = engine.getGroupedData();
    expect(groupedData).toHaveLength(4);
    expect(groupedData[0].key).toBe('North');
    expect(groupedData[0].items[0].sales).toBe(1800); // Highest sales in North
    expect(groupedData[1].key).toBe('South');
    expect(groupedData[1].items[0].sales).toBe(1500); // Highest sales in South
  });

  it('should handle empty data set', () => {
    const emptyConfig: PivotTableConfig<(typeof sampleData)[0]> = {
      ...config,
      data: [],
    };
    const engine = new PivotEngine(emptyConfig);
    const groupConfig: GroupConfig = {
      fields: ['region'],
      grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groupedData = engine.getGroupedData();
    expect(groupedData).toHaveLength(0);
  });

  it('should handle grouping by non-existent field', () => {
    const engine = new PivotEngine(config);
    const groupConfig: GroupConfig = {
      fields: ['nonExistentField'],
      grouper: (item, fields) =>
        fields.map((field) => item[field] || 'N/A').join(' - '),
    };
    engine.setGroupConfig(groupConfig);

    const groupedData = engine.getGroupedData();
    expect(groupedData).toHaveLength(1);
    expect(groupedData[0].key).toBe('N/A');
    expect(groupedData[0].items).toHaveLength(sampleData.length);
  });
});
