/**
 * BaseChart is abstract — we test it through BarChart as the concrete subclass.
 */
import { describe, it, expect, vi } from 'vitest';
import { BarChart } from '../charts/BarChart.js';

describe('BaseChart (via BarChart)', () => {
  describe('constructor', () => {
    it('initialises with empty style/format/interaction configs by default', () => {
      const chart = new BarChart();
      const opts = chart.getRenderOptions();
      expect(opts.style).toEqual({});
      expect(opts.format).toEqual({});
      expect(opts.interactions).toEqual({});
    });

    it('accepts initial style options', () => {
      const chart = new BarChart({ style: { title: 'My Chart' } });
      expect(chart.getRenderOptions().style!.title).toBe('My Chart');
    });
  });

  describe('getRenderOptions()', () => {
    it('returns the correct chart type', () => {
      const chart = new BarChart();
      expect(chart.getRenderOptions().type).toBe('column');
    });

    it('returns a copy — mutations do not affect internal state', () => {
      const chart = new BarChart();
      const opts = chart.getRenderOptions();
      opts.style!.title = 'mutated';
      expect(chart.getRenderOptions().style!.title).toBeUndefined();
    });
  });

  describe('fluent style methods', () => {
    it('title() sets the title', () => {
      const chart = new BarChart().title('Sales Report');
      expect(chart.getRenderOptions().style!.title).toBe('Sales Report');
    });

    it('subtitle() sets the subtitle', () => {
      const chart = new BarChart().subtitle('Q1 2024');
      expect(chart.getRenderOptions().style!.subtitle).toBe('Q1 2024');
    });

    it('colorScheme() sets the colorScheme', () => {
      const chart = new BarChart().colorScheme('dark');
      expect(chart.getRenderOptions().style!.colorScheme).toBe('dark');
    });

    it('colors() sets a custom palette', () => {
      const chart = new BarChart().colors(['red', 'blue']);
      expect(chart.getRenderOptions().style!.colors).toEqual(['red', 'blue']);
    });

    it('legend(true, "bottom") sets showLegend and position', () => {
      const chart = new BarChart().legend(true, 'bottom');
      const style = chart.getRenderOptions().style!;
      expect(style.showLegend).toBe(true);
      expect(style.legendPosition).toBe('bottom');
    });

    it('showLegend(false) hides legend', () => {
      const chart = new BarChart().showLegend(false);
      expect(chart.getRenderOptions().style!.showLegend).toBe(false);
    });

    it('legendPosition() sets position', () => {
      const chart = new BarChart().legendPosition('left');
      expect(chart.getRenderOptions().style!.legendPosition).toBe('left');
    });

    it('grid() toggles grid visibility', () => {
      const chart = new BarChart().grid(true);
      expect(chart.getRenderOptions().style!.showGrid).toBe(true);
    });

    it('showValues() toggles value labels', () => {
      const chart = new BarChart().showValues(true);
      expect(chart.getRenderOptions().style!.showValues).toBe(true);
    });

    it('animate() toggles animation', () => {
      const chart = new BarChart().animate(false);
      expect(chart.getRenderOptions().style!.animated).toBe(false);
    });

    it('size() sets width and height', () => {
      const chart = new BarChart().size(800, 400);
      const style = chart.getRenderOptions().style!;
      expect(style.width).toBe(800);
      expect(style.height).toBe(400);
    });

    it('width() sets width only', () => {
      const chart = new BarChart().width('auto');
      expect(chart.getRenderOptions().style!.width).toBe('auto');
    });

    it('height() sets height only', () => {
      const chart = new BarChart().height(300);
      expect(chart.getRenderOptions().style!.height).toBe(300);
    });

    it('supports method chaining', () => {
      const chart = new BarChart()
        .title('T')
        .subtitle('S')
        .legend(true, 'top')
        .grid(true)
        .animate(true)
        .size(600, 300);
      const style = chart.getRenderOptions().style!;
      expect(style.title).toBe('T');
      expect(style.subtitle).toBe('S');
      expect(style.showLegend).toBe(true);
      expect(style.legendPosition).toBe('top');
      expect(style.showGrid).toBe(true);
      expect(style.animated).toBe(true);
      expect(style.width).toBe(600);
      expect(style.height).toBe(300);
    });
  });

  describe('fluent format methods', () => {
    it('formatAsNumber() sets valueFormat and decimals', () => {
      const chart = new BarChart().formatAsNumber(2);
      const fmt = chart.getRenderOptions().format!;
      expect(fmt.valueFormat).toBe('number');
      expect(fmt.decimals).toBe(2);
    });

    it('formatAsCurrency() sets currency format', () => {
      const chart = new BarChart().formatAsCurrency('EUR', 2);
      const fmt = chart.getRenderOptions().format!;
      expect(fmt.valueFormat).toBe('currency');
      expect(fmt.currency).toBe('EUR');
    });

    it('formatAsPercent() sets percent format', () => {
      const chart = new BarChart().formatAsPercent(1);
      expect(chart.getRenderOptions().format!.valueFormat).toBe('percent');
    });

    it('formatAsCompact() sets compact format', () => {
      const chart = new BarChart().formatAsCompact();
      expect(chart.getRenderOptions().format!.valueFormat).toBe('compact');
    });

    it('prefix() and suffix() set decoration strings', () => {
      const chart = new BarChart().prefix('$').suffix('k');
      const fmt = chart.getRenderOptions().format!;
      expect(fmt.prefix).toBe('$');
      expect(fmt.suffix).toBe('k');
    });
  });

  describe('fluent interaction methods', () => {
    it('onClick() stores the click handler', () => {
      const handler = vi.fn();
      const chart = new BarChart().onClick(handler);
      expect(chart.getRenderOptions().interactions!.click).toBe(handler);
    });

    it('hover() enables hover effects', () => {
      const chart = new BarChart().hover(true);
      expect(chart.getRenderOptions().interactions!.hover).toBe(true);
    });

    it('drillDown() configures drill-down options', () => {
      const onDrill = vi.fn();
      const chart = new BarChart().drillDown(['region', 'city'], onDrill);
      const dd = chart.getRenderOptions().interactions!.drillDown;
      expect(dd?.enabled).toBe(true);
      expect(dd?.levels).toEqual(['region', 'city']);
      expect(dd?.onDrill).toBe(onDrill);
    });
  });

  describe('clone()', () => {
    it('creates a new instance of the same type', () => {
      const chart = new BarChart().title('Original');
      const cloned = chart.clone();
      expect(cloned).toBeInstanceOf(BarChart);
      expect(cloned).not.toBe(chart);
    });

    it('clone carries the same configuration', () => {
      const chart = new BarChart().title('Original').legend(true, 'top');
      const cloned = chart.clone();
      expect(cloned.getRenderOptions().style!.title).toBe('Original');
      expect(cloned.getRenderOptions().style!.legendPosition).toBe('top');
    });

    it('mutating the clone does not affect the original', () => {
      const chart = new BarChart().title('Original');
      const cloned = chart.clone().title('Mutated');
      expect(chart.getRenderOptions().style!.title).toBe('Original');
      expect(cloned.getRenderOptions().style!.title).toBe('Mutated');
    });
  });
});
