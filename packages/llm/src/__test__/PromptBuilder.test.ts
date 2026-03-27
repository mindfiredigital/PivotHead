import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../PromptBuilder.js';
import type { PivotContext } from '../types.js';

describe('PromptBuilder', () => {
  const builder = new PromptBuilder();

  const baseContext: PivotContext = {
    fields: [
      { name: 'category', type: 'string', values: ['Electronics', 'Clothing'] },
      { name: 'sales', type: 'number' },
      { name: 'date', type: 'date' },
    ],
    sampleRows: [
      { category: 'Electronics', sales: 1500, date: '2024-01-01' },
      { category: 'Clothing', sales: 800, date: '2024-01-02' },
    ],
    pivotOutput: [{ category: 'Electronics', sales: 3000 }],
    currentState: {
      groupBy: 'category',
      sortBy: 'sales',
      filters: {},
    },
  };

  describe('build() — field names in output', () => {
    it('includes all field names', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('category');
      expect(prompt).toContain('sales');
      expect(prompt).toContain('date');
    });

    it('includes field types', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('[string]');
      expect(prompt).toContain('[number]');
      expect(prompt).toContain('[date]');
    });

    it('includes distinct values for low-cardinality string fields', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('Electronics');
      expect(prompt).toContain('Clothing');
    });

    it('does not add values section for fields without values', () => {
      const prompt = builder.build(baseContext);
      // sales field has no values array — line should not have "(values:" for sales
      const salesLine = prompt
        .split('\n')
        .find(l => l.includes('sales [number]'));
      expect(salesLine).toBeDefined();
      expect(salesLine).not.toContain('values:');
    });
  });

  describe('build() — pivot state in output', () => {
    it('includes groupBy state', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('Group By: category');
    });

    it('includes sortBy state', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('Sort By: sales');
    });

    it('shows "none" when groupBy is absent', () => {
      const ctx: PivotContext = {
        ...baseContext,
        currentState: { filters: {} },
      };
      const prompt = builder.build(ctx);
      expect(prompt).toContain('Group By: none');
    });

    it('shows filters as JSON when present', () => {
      const ctx: PivotContext = {
        ...baseContext,
        currentState: {
          ...baseContext.currentState,
          filters: { category: 'Electronics' },
        },
      };
      const prompt = builder.build(ctx);
      expect(prompt).toContain('"category"');
      expect(prompt).toContain('Electronics');
    });

    it('shows "none" when filters is empty', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('Filters: none');
    });
  });

  describe('build() — sample data', () => {
    it('includes sample data headers as markdown table', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('| category | sales | date |');
    });

    it('includes sample row values', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('1500');
      expect(prompt).toContain('2024-01-01');
    });

    it('shows fallback when no sample rows', () => {
      const ctx: PivotContext = { ...baseContext, sampleRows: [] };
      const prompt = builder.build(ctx);
      expect(prompt).toContain('No sample data available.');
    });
  });

  describe('build() — pivot output', () => {
    it('includes pivot output section', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('Current Pivot Output');
    });

    it('shows fallback when pivot output is empty', () => {
      const ctx: PivotContext = { ...baseContext, pivotOutput: [] };
      const prompt = builder.build(ctx);
      expect(prompt).toContain('No pivot output available.');
    });
  });

  describe('build() — instructions', () => {
    it('instructs the model to respond with JSON only', () => {
      const prompt = builder.build(baseContext);
      expect(prompt).toContain('Respond ONLY with a single valid JSON object');
    });

    it('lists all supported action types', () => {
      const prompt = builder.build(baseContext);
      const actionTypes = [
        'sort',
        'filter',
        'removeFilter',
        'groupBy',
        'topN',
        'aggregate',
        'resetAll',
        'export',
        'switchTab',
        'chartType',
        'answer',
        'clarify',
        'style',
        'resetStyle',
      ];
      for (const actionType of actionTypes) {
        expect(prompt).toContain(`"type": "${actionType}"`);
      }
    });
  });
});
