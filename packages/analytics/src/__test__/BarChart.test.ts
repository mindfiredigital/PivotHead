import { describe, it, expect } from 'vitest';
import {
  BarChart,
  barChart,
  horizontalBarChart,
  columnChart,
  stackedBarChart,
} from '../charts/BarChart.js';

describe('BarChart', () => {
  describe('constructor defaults', () => {
    it('is vertical (column) and non-stacked by default', () => {
      const chart = new BarChart();
      expect(chart.getType()).toBe('column');
      expect(chart.isHorizontal()).toBe(false);
      expect(chart.isStacked()).toBe(false);
    });

    it('accepts horizontal: true option', () => {
      const chart = new BarChart({ horizontal: true });
      expect(chart.getType()).toBe('bar');
      expect(chart.isHorizontal()).toBe(true);
    });

    it('accepts stacked: true option', () => {
      const chart = new BarChart({ stacked: true });
      expect(chart.getType()).toBe('stackedColumn');
      expect(chart.isStacked()).toBe(true);
    });

    it('horizontal + stacked → stackedBar', () => {
      const chart = new BarChart({ horizontal: true, stacked: true });
      expect(chart.getType()).toBe('stackedBar');
    });
  });

  describe('getType()', () => {
    it('returns "column" for default', () => {
      expect(new BarChart().getType()).toBe('column');
    });

    it('returns "bar" when horizontal', () => {
      expect(new BarChart({ horizontal: true }).getType()).toBe('bar');
    });

    it('returns "stackedColumn" when stacked and vertical', () => {
      expect(new BarChart({ stacked: true }).getType()).toBe('stackedColumn');
    });

    it('returns "stackedBar" when stacked and horizontal', () => {
      expect(new BarChart({ horizontal: true, stacked: true }).getType()).toBe(
        'stackedBar'
      );
    });
  });

  describe('asHorizontal() / asVertical()', () => {
    it('asHorizontal() switches to bar type', () => {
      const chart = new BarChart().asHorizontal();
      expect(chart.getType()).toBe('bar');
      expect(chart.isHorizontal()).toBe(true);
      expect(chart.getRenderOptions().style!.orientation).toBe('horizontal');
    });

    it('asVertical() switches back to column type', () => {
      const chart = new BarChart({ horizontal: true }).asVertical();
      expect(chart.getType()).toBe('column');
      expect(chart.isHorizontal()).toBe(false);
      expect(chart.getRenderOptions().style!.orientation).toBe('vertical');
    });

    it('asHorizontal() on stacked chart returns stackedBar', () => {
      const chart = new BarChart({ stacked: true }).asHorizontal();
      expect(chart.getType()).toBe('stackedBar');
    });
  });

  describe('asStacked() / asGrouped()', () => {
    it('asStacked() enables stacking', () => {
      const chart = new BarChart().asStacked();
      expect(chart.isStacked()).toBe(true);
      expect(chart.getType()).toBe('stackedColumn');
    });

    it('asGrouped() disables stacking', () => {
      const chart = new BarChart({ stacked: true }).asGrouped();
      expect(chart.isStacked()).toBe(false);
      expect(chart.getType()).toBe('column');
    });
  });

  describe('method chaining (fluent API)', () => {
    it('chains asHorizontal().asStacked() correctly', () => {
      const chart = new BarChart().asHorizontal().asStacked();
      expect(chart.getType()).toBe('stackedBar');
    });

    it('chains asStacked().asVertical() correctly', () => {
      const chart = new BarChart().asStacked().asVertical();
      expect(chart.getType()).toBe('stackedColumn');
    });

    it('round-trips: asHorizontal().asVertical() returns column', () => {
      const chart = new BarChart().asHorizontal().asVertical();
      expect(chart.getType()).toBe('column');
    });
  });

  describe('getRenderOptions()', () => {
    it('includes correct type for a horizontal stacked chart', () => {
      const chart = new BarChart({ horizontal: true, stacked: true });
      expect(chart.getRenderOptions().type).toBe('stackedBar');
    });
  });
});

// ─── Factory functions ─────────────────────────────────────────────────────────

describe('barChart() factory', () => {
  it('creates a BarChart instance', () => {
    expect(barChart()).toBeInstanceOf(BarChart);
  });

  it('defaults to column type', () => {
    expect(barChart().getType()).toBe('column');
  });

  it('accepts options', () => {
    expect(barChart({ horizontal: true }).getType()).toBe('bar');
  });
});

describe('horizontalBarChart() factory', () => {
  it('creates a horizontal BarChart', () => {
    const chart = horizontalBarChart();
    expect(chart.isHorizontal()).toBe(true);
    expect(chart.getType()).toBe('bar');
  });
});

describe('columnChart() factory', () => {
  it('creates a vertical BarChart', () => {
    const chart = columnChart();
    expect(chart.isHorizontal()).toBe(false);
    expect(chart.getType()).toBe('column');
  });
});

describe('stackedBarChart() factory', () => {
  it('creates a stacked BarChart', () => {
    const chart = stackedBarChart();
    expect(chart.isStacked()).toBe(true);
  });

  it('vertical stacked → stackedColumn', () => {
    expect(stackedBarChart().getType()).toBe('stackedColumn');
  });

  it('horizontal stacked → stackedBar', () => {
    expect(stackedBarChart({ horizontal: true }).getType()).toBe('stackedBar');
  });
});
