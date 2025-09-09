import { describe, it, expect, beforeEach } from 'vitest';
import { PivotHeadService } from '../pivot-head.service';

describe('PivotHeadService', () => {
  let service: PivotHeadService;

  beforeEach(() => {
    service = new PivotHeadService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate data correctly', () => {
    expect(service.validateData([{ test: 'data' }])).toBe(true);
    expect(service.validateData([])).toBe(true);
    expect(service.validateData(['not', 'objects'] as any)).toBe(false);
    expect(service.validateData('not an array' as unknown as unknown[])).toBe(
      false
    );
  });

  it('should extract field names', () => {
    const data = [
      { name: 'John', age: 30, city: 'NY' },
      { name: 'Jane', age: 25, country: 'US' },
    ];
    const fields = service.getFieldNames(data);
    expect(fields).toContain('name');
    expect(fields).toContain('age');
    expect(fields).toContain('city');
    expect(fields).toContain('country');
  });

  it('should calculate aggregates correctly', () => {
    const data = [{ sales: 100 }, { sales: 200 }, { sales: 150 }];

    expect(service.calculateAggregates(data, 'sales', 'sum')).toBe(450);
    expect(service.calculateAggregates(data, 'sales', 'avg')).toBe(150);
    expect(service.calculateAggregates(data, 'sales', 'count')).toBe(3);
    expect(service.calculateAggregates(data, 'sales', 'min')).toBe(100);
    expect(service.calculateAggregates(data, 'sales', 'max')).toBe(200);
  });

  it('should filter data correctly', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const filtered = service.filterData(data, 'age', 'greaterThan', 30);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Bob');
  });
});
