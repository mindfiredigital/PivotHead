import { calculateAggregates } from '../engine/aggregator';
import { Config, Row, AggregationType } from '../types/interfaces';

describe('processData', () => {
  const data: Row[] = [
    { col1: 10, col2: 20, col3: 30 },
    { col1: 15, col2: 25, col3: 35 },
    { col1: 20, col2: 30, col3: 40 },
  ];

  const config: Config = {
    data: data,
    columns: [
      { field: 'col1', label: 'Column 1', type: 'number' },
      { field: 'col2', label: 'Column 2', type: 'number' },
      { field: 'col3', label: 'Column 3', type: 'number' },
      { field: 'result', label: 'Result', type: 'number' },
    ],
  };

  it('should correctly calculate the sum of the numeric columns', () => {
    const result = calculateAggregates(
      data,
      'col1' as keyof Row,
      'sum' as AggregationType,
    );
    expect(result).toBe(45); // 10 + 15 + 20 = 45

    const result2 = calculateAggregates(
      data,
      'col2' as keyof Row,
      'sum' as AggregationType,
    );
    expect(result2).toBe(75); // 20 + 25 + 30 = 75

    const result3 = calculateAggregates(
      data,
      'col3' as keyof Row,
      'sum' as AggregationType,
    );
    expect(result3).toBe(105); // 30 + 35 + 40 = 105
  });

  it('should correctly calculate the average of the numeric columns', () => {
    const result = calculateAggregates(
      data,
      'col1' as keyof Row,
      'avg' as AggregationType,
    );
    expect(result).toBe(15); // (10 + 15 + 20) / 3 = 15

    const result2 = calculateAggregates(
      data,
      'col2' as keyof Row,
      'avg' as AggregationType,
    );
    expect(result2).toBe(25); // (20 + 25 + 30) / 3 = 25

    const result3 = calculateAggregates(
      data,
      'col3' as keyof Row,
      'avg' as AggregationType,
    );
    expect(result3).toBe(35); // (30 + 35 + 40) / 3 = 35
  });

  it('should correctly count the numeric columns', () => {
    const result = calculateAggregates(
      data,
      'col1' as keyof Row,
      'count' as AggregationType,
    );
    expect(result).toBe(3); // Three values in col1

    const result2 = calculateAggregates(
      data,
      'col2' as keyof Row,
      'count' as AggregationType,
    );
    expect(result2).toBe(3); // Three values in col2

    const result3 = calculateAggregates(
      data,
      'col3' as keyof Row,
      'count' as AggregationType,
    );
    expect(result3).toBe(3); // Three values in col3
  });

  it('should correctly calculate the minimum value of the numeric columns', () => {
    const result = calculateAggregates(
      data,
      'col1' as keyof Row,
      'min' as AggregationType,
    );
    expect(result).toBe(10); // min of col1 values = 10

    const result2 = calculateAggregates(
      data,
      'col2' as keyof Row,
      'min' as AggregationType,
    );
    expect(result2).toBe(20); // min of col2 values = 20

    const result3 = calculateAggregates(
      data,
      'col3' as keyof Row,
      'min' as AggregationType,
    );
    expect(result3).toBe(30); // min of col3 values = 30
  });

  it('should correctly calculate the maximum value of the numeric columns', () => {
    const result = calculateAggregates(
      data,
      'col1' as keyof Row,
      'max' as AggregationType,
    );
    expect(result).toBe(20); // max of col1 values = 20

    const result2 = calculateAggregates(
      data,
      'col2' as keyof Row,
      'max' as AggregationType,
    );
    expect(result2).toBe(30); // max of col2 values = 30

    const result3 = calculateAggregates(
      data,
      'col3' as keyof Row,
      'max' as AggregationType,
    );
    expect(result3).toBe(40); // max of col3 values = 40
  });

  it('should handle null and undefined values', () => {
    const dataWithNulls: Row[] = [
      { col1: 10, col2: null, col3: 30 },
      { col1: null, col2: 25, col3: undefined },
      { col1: 20, col2: undefined, col3: 40 },
    ];

    const result = calculateAggregates(
      dataWithNulls,
      'col1' as keyof Row,
      'sum' as AggregationType,
    );
    expect(result).toBe(30); // 10 + 20 = 30 (null ignored)

    const result2 = calculateAggregates(
      dataWithNulls,
      'col2' as keyof Row,
      'sum' as AggregationType,
    );
    expect(result2).toBe(25); // 25 (null and undefined ignored)
  });

  it('should handle empty data array', () => {
    const emptyData: Row[] = [];
    const result = calculateAggregates(
      emptyData,
      'col1' as keyof Row,
      'sum' as AggregationType,
    );
    expect(result).toBe(0);
  });

  it('should return 0 for unsupported operations', () => {
    const result = calculateAggregates(
      data,
      'col1' as keyof Row,
      'unsupported' as AggregationType,
    );
    expect(result).toBe(0);
  });
});
