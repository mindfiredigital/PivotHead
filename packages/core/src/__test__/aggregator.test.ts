import { processData } from '../engine/aggregator';
import { Config, Row } from '../types/interfaces';

describe('processData', () => {
    const data: Row[] = [
        { col1: 10, col2: 20, col3: 30 },
        { col1: 15, col2: 25, col3: 35 },
        { col1: 20, col2: 30, col3: 40 }
    ];

    const config: Config = {
        data: data,
        columns: [
            { field: 'col1', label: 'Column 1', type: 'number' },
            { field: 'col2', label: 'Column 2', type: 'number' },
            { field: 'col3', label: 'Column 3', type: 'number' },
            { field: 'result', label: 'Result', type: 'number' }  // Result column will store the computed value
        ]
    };


    it('should correctly calculate the sum of the numeric columns', () => {
        const result = processData(config, data, 'sum');
        expect(result[0].result).toBe(60); // 10 + 20 + 30 = 60
        expect(result[1].result).toBe(75); // 15 + 25 + 35 = 75
        expect(result[2].result).toBe(90); // 20 + 30 + 40 = 90
    });

    it('should correctly calculate the average of the numeric columns', () => {
        const result = processData(config, data, 'avg');
        expect(result[0].result).toBe(20); // (10 + 20 + 30) / 3 = 20
        expect(result[1].result).toBe(25); // (15 + 25 + 35) / 3 = 25
        expect(result[2].result).toBe(30); // (20 + 30 + 40) / 3 = 30
    });

    it('should correctly count the numeric columns', () => {
        const result = processData(config, data, 'count');
        expect(result[0].result).toBe(3); // Three numeric columns: col1, col2, col3
        expect(result[1].result).toBe(3); // Three numeric columns
        expect(result[2].result).toBe(3); // Three numeric columns
    });

    it('should correctly calculate the minimum value of the numeric columns', () => {
        const result = processData(config, data, 'min');
        expect(result[0].result).toBe(10); // min(10, 20, 30) = 10
        expect(result[1].result).toBe(15); // min(15, 25, 35) = 15
        expect(result[2].result).toBe(20); // min(20, 30, 40) = 20
    });

    it('should correctly calculate the maximum value of the numeric columns', () => {
        const result = processData(config, data, 'max');
        expect(result[0].result).toBe(30); // max(10, 20, 30) = 30
        expect(result[1].result).toBe(35); // max(15, 25, 35) = 35
        expect(result[2].result).toBe(40); // max(20, 30, 40) = 40
    });

    it('should return 0 for unsupported operations', () => {
        const result = processData(config, data, 'unsupported');
        expect(result[0].result).toBe(0); // Unsupported operation should return 0
        expect(result[1].result).toBe(0); // Unsupported operation should return 0
        expect(result[2].result).toBe(0); // Unsupported operation should return 0
    });
});
