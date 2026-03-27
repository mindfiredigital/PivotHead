import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionExecutor } from '../ActionExecutor.js';
import type { PivotEngineRef, ChartEngineRef } from '../ActionExecutor.js';
import type { PivotAction } from '../types.js';

function makePivotEngine(): PivotEngineRef {
  return {
    applyFilter: vi.fn(),
    removeFilter: vi.fn(),
    sortData: vi.fn(),
    groupData: vi.fn(),
    applyTopN: vi.fn(),
    setAggregation: vi.fn(),
    reset: vi.fn(),
    export: vi.fn(),
    applyStyle: vi.fn(),
    resetStyle: vi.fn(),
  };
}

function makeChartEngine(): ChartEngineRef {
  return {
    updateChartType: vi.fn(),
  };
}

describe('ActionExecutor', () => {
  let pivotEngine: ReturnType<typeof makePivotEngine>;
  let chartEngine: ReturnType<typeof makeChartEngine>;
  let onActionApplied: ReturnType<typeof vi.fn>;
  let onError: ReturnType<typeof vi.fn>;
  let executor: ActionExecutor;

  beforeEach(() => {
    pivotEngine = makePivotEngine();
    chartEngine = makeChartEngine();
    onActionApplied = vi.fn();
    onError = vi.fn();
    executor = new ActionExecutor({
      pivotEngine,
      chartEngine,
      onActionApplied,
      onError,
    });
  });

  describe('filter action', () => {
    it('calls pivotEngine.applyFilter with correct args', async () => {
      const action: PivotAction = {
        type: 'filter',
        field: 'category',
        operator: 'equals',
        value: 'Electronics',
      };
      await executor.execute(action);
      expect(pivotEngine.applyFilter).toHaveBeenCalledWith({
        field: 'category',
        operator: 'equals',
        value: 'Electronics',
      });
      expect(onActionApplied).toHaveBeenCalledWith(
        action,
        expect.objectContaining({ success: true })
      );
    });
  });

  describe('removeFilter action', () => {
    it('calls pivotEngine.removeFilter with the field', async () => {
      const action: PivotAction = { type: 'removeFilter', field: 'category' };
      await executor.execute(action);
      expect(pivotEngine.removeFilter).toHaveBeenCalledWith('category');
      expect(onActionApplied).toHaveBeenCalledWith(
        action,
        expect.objectContaining({ success: true })
      );
    });
  });

  describe('sort action', () => {
    it('calls pivotEngine.sortData with field and direction', async () => {
      const action: PivotAction = {
        type: 'sort',
        field: 'sales',
        direction: 'desc',
      };
      await executor.execute(action);
      expect(pivotEngine.sortData).toHaveBeenCalledWith('sales', 'desc');
      expect(onActionApplied).toHaveBeenCalledWith(
        action,
        expect.objectContaining({ success: true })
      );
    });
  });

  describe('groupBy action', () => {
    it('calls pivotEngine.groupData with field', async () => {
      const action: PivotAction = { type: 'groupBy', field: 'region' };
      await executor.execute(action);
      expect(pivotEngine.groupData).toHaveBeenCalledWith('region');
    });
  });

  describe('topN action', () => {
    it('calls pivotEngine.applyTopN with n, measure, order', async () => {
      const action: PivotAction = {
        type: 'topN',
        n: 10,
        measure: 'revenue',
        order: 'asc',
      };
      await executor.execute(action);
      expect(pivotEngine.applyTopN).toHaveBeenCalledWith(10, 'revenue', 'asc');
    });
  });

  describe('aggregate action', () => {
    it('calls pivotEngine.setAggregation with field and func', async () => {
      const action: PivotAction = {
        type: 'aggregate',
        field: 'sales',
        func: 'avg',
      };
      await executor.execute(action);
      expect(pivotEngine.setAggregation).toHaveBeenCalledWith('sales', 'avg');
    });
  });

  describe('resetAll action', () => {
    it('calls pivotEngine.reset', async () => {
      const action: PivotAction = { type: 'resetAll' };
      await executor.execute(action);
      expect(pivotEngine.reset).toHaveBeenCalled();
    });
  });

  describe('export action', () => {
    it('calls pivotEngine.export with format', async () => {
      const action: PivotAction = { type: 'export', format: 'csv' };
      await executor.execute(action);
      expect(pivotEngine.export).toHaveBeenCalledWith('csv');
    });
  });

  describe('switchTab action', () => {
    it('dispatches a pivothead:switchTab CustomEvent on window', async () => {
      const action: PivotAction = { type: 'switchTab', tab: 'analytics' };
      const listener = vi.fn();
      window.addEventListener('pivothead:switchTab', listener);
      await executor.execute(action);
      expect(listener).toHaveBeenCalled();
      const event = listener.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toEqual({ tab: 'analytics' });
      window.removeEventListener('pivothead:switchTab', listener);
    });
  });

  describe('chartType action', () => {
    it('calls chartEngine.updateChartType', async () => {
      const action: PivotAction = { type: 'chartType', chartType: 'bar' };
      await executor.execute(action);
      expect(chartEngine.updateChartType).toHaveBeenCalledWith('bar');
    });

    it('does not throw when chartEngine is not provided', async () => {
      const execWithoutChart = new ActionExecutor({ pivotEngine });
      const action: PivotAction = { type: 'chartType', chartType: 'pie' };
      await expect(execWithoutChart.execute(action)).resolves.toBeUndefined();
    });
  });

  describe('answer action', () => {
    it('calls onActionApplied with the answer text as description', async () => {
      const action: PivotAction = {
        type: 'answer',
        text: 'Total sales is 5000',
      };
      await executor.execute(action);
      expect(onActionApplied).toHaveBeenCalledWith(action, {
        success: true,
        description: 'Total sales is 5000',
      });
    });
  });

  describe('clarify action', () => {
    it('calls onActionApplied with the question as description', async () => {
      const action: PivotAction = {
        type: 'clarify',
        question: 'Which field?',
      };
      await executor.execute(action);
      expect(onActionApplied).toHaveBeenCalledWith(action, {
        success: true,
        description: 'Which field?',
      });
    });
  });

  describe('style action', () => {
    it('calls pivotEngine.applyStyle with all args', async () => {
      const action: PivotAction = {
        type: 'style',
        target: 'column',
        value: 'sales',
        property: 'backgroundColor',
        style: 'yellow',
      };
      await executor.execute(action);
      expect(pivotEngine.applyStyle).toHaveBeenCalledWith(
        'column',
        'sales',
        'backgroundColor',
        'yellow'
      );
    });
  });

  describe('resetStyle action', () => {
    it('calls pivotEngine.resetStyle', async () => {
      const action: PivotAction = { type: 'resetStyle' };
      await executor.execute(action);
      expect(pivotEngine.resetStyle).toHaveBeenCalled();
    });
  });

  describe('error action', () => {
    it('calls onError with an Error constructed from the message', async () => {
      const action: PivotAction = {
        type: 'error',
        message: 'Something went wrong',
      };
      await executor.execute(action);
      expect(onError).toHaveBeenCalledWith(
        action,
        expect.objectContaining({ message: 'Something went wrong' })
      );
    });
  });

  describe('optional chaining — missing pivotEngine methods', () => {
    it('does not throw when pivotEngine methods are not implemented', async () => {
      const minimalEngine: PivotEngineRef = {};
      const exec = new ActionExecutor({ pivotEngine: minimalEngine });

      const actions: PivotAction[] = [
        { type: 'filter', field: 'x', operator: 'equals', value: 1 },
        { type: 'removeFilter', field: 'x' },
        { type: 'sort', field: 'x', direction: 'asc' },
        { type: 'groupBy', field: 'x' },
        { type: 'topN', n: 5, measure: 'x', order: 'asc' },
        { type: 'aggregate', field: 'x', func: 'sum' },
        { type: 'resetAll' },
        { type: 'export', format: 'json' },
        {
          type: 'style',
          target: 'row',
          value: 'x',
          property: 'color',
          style: 'red',
        },
        { type: 'resetStyle' },
      ];

      for (const action of actions) {
        await expect(exec.execute(action)).resolves.toBeUndefined();
      }
    });
  });

  describe('exception handling', () => {
    it('calls onError when a pivotEngine method throws', async () => {
      const throwingEngine: PivotEngineRef = {
        sortData: vi.fn().mockImplementation(() => {
          throw new Error('sort exploded');
        }),
      };
      const errorCallback = vi.fn();
      const exec = new ActionExecutor({
        pivotEngine: throwingEngine,
        onError: errorCallback,
      });
      const action: PivotAction = {
        type: 'sort',
        field: 'sales',
        direction: 'asc',
      };
      await exec.execute(action);
      expect(errorCallback).toHaveBeenCalledWith(
        action,
        expect.objectContaining({ message: 'sort exploded' })
      );
    });
  });
});
