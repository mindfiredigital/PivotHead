import React, { createRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { PivotHead } from '../PivotHead';
import type { PivotHeadRef } from '../types';

// ── Mock the web-component package ──────────────────────────────────────────
// Replace the side-effect import with a controlled stub that registers a
// minimal <pivot-head> custom element in JSDOM.
vi.mock('@mindfiredigital/pivothead-web-component', () => {
  class PivotHeadElement extends HTMLElement {
    static observedAttributes = ['data', 'options', 'filters', 'pagination', 'mode'];

    _data: unknown[] = [];
    _options: Record<string, unknown> = {};
    _filters: unknown[] = [];
    _pagination = { currentPage: 1, pageSize: 10, totalPages: 3 };
    _viewMode: 'raw' | 'processed' = 'processed';

    // Property setters mirror the real element's contract
    set data(v: unknown[]) { this._data = v; }
    get data(): unknown[] { return this._data; }
    set options(v: Record<string, unknown>) { this._options = v; }
    get options(): Record<string, unknown> { return this._options; }
    set filters(v: unknown[]) { this._filters = v; }
    get filters(): unknown[] { return this._filters; }
    set pagination(v: Partial<{ currentPage: number; pageSize: number; totalPages: number }>) {
      this._pagination = { ...this._pagination, ...v };
    }
    get pagination() { return this._pagination; }

    // API methods
    getState() { return { data: this._data, processedData: {}, rawData: this._data }; }
    refresh() {}
    sort(_f: string, _d: string) {}
    setMeasures(_m: unknown[]) {}
    setDimensions(_d: unknown[]) {}
    setGroupConfig(_c: unknown) {}
    getFilters() { return this._filters; }
    getPagination() { return { ...this._pagination }; }
    getData() { return this._data; }
    getProcessedData() { return {}; }
    getGroupedData() { return []; }
    formatValue(v: unknown) { return String(v); }
    updateFieldFormatting() {}
    getFieldAlignment() { return 'left'; }
    showFormatPopup() {}
    swapRows() {}
    swapColumns() {}
    exportToHTML() {}
    exportToPDF() {}
    exportToExcel() {}
    openPrintDialog() {}
    loadFromFile() { return Promise.resolve(); }
    loadFromUrl() { return Promise.resolve(); }
    connectToLocalCSV() { return Promise.resolve({ success: true }); }
    connectToLocalJSON() { return Promise.resolve({ success: true }); }
    connectToLocalFile() { return Promise.resolve({ success: true }); }

    previousPage() {
      if (this._pagination.currentPage > 1) {
        this._pagination = { ...this._pagination, currentPage: this._pagination.currentPage - 1 };
        this._emit('paginationChange', { ...this._pagination });
      }
    }
    nextPage() {
      if (this._pagination.currentPage < this._pagination.totalPages) {
        this._pagination = { ...this._pagination, currentPage: this._pagination.currentPage + 1 };
        this._emit('paginationChange', { ...this._pagination });
      }
    }
    setPageSize(s: number) {
      this._pagination = { ...this._pagination, pageSize: s, currentPage: 1 };
      this._emit('paginationChange', { ...this._pagination });
    }
    goToPage(p: number) {
      this._pagination = { ...this._pagination, currentPage: p };
      this._emit('paginationChange', { ...this._pagination });
    }
    setViewMode(m: 'raw' | 'processed') {
      this._viewMode = m;
      this._emit('viewModeChange', { mode: m });
    }
    getViewMode() { return this._viewMode; }

    _emit(name: string, detail: unknown) {
      this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
  }

  if (!customElements.get('pivot-head')) {
    customElements.define('pivot-head', PivotHeadElement);
  }
  return {};
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const sampleData = [{ name: 'Alice', value: 100 }, { name: 'Bob', value: 200 }];
const sampleOptions = { rows: ['name'], columns: [], measures: [{ uniqueName: 'value' }] };

/** Returns the <pivot-head> element cast to a loose type for inspection. */
function getEl(container: HTMLElement) {
  return container.querySelector('pivot-head') as HTMLElement & Record<string, unknown>;
}

// ── Test suites ───────────────────────────────────────────────────────────────

describe('PivotHead React component', () => {

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a pivot-head custom element', () => {
      const { container } = render(<PivotHead />);
      expect(getEl(container)).not.toBeNull();
    });

    it('defaults to mode="default"', () => {
      const { container } = render(<PivotHead />);
      expect(getEl(container).getAttribute('mode')).toBe('default');
    });

    it('passes mode="none" to the element', () => {
      const { container } = render(<PivotHead mode="none" />);
      expect(getEl(container).getAttribute('mode')).toBe('none');
    });

    it('passes mode="minimal" to the element', () => {
      const { container } = render(<PivotHead mode="minimal" />);
      expect(getEl(container).getAttribute('mode')).toBe('minimal');
    });

    it('passes className to the element', () => {
      const { container } = render(<PivotHead className="my-table" />);
      expect(getEl(container).className).toBe('my-table');
    });

    it('passes style to the element', () => {
      const { container } = render(<PivotHead style={{ width: '100%' }} />);
      expect((getEl(container) as HTMLElement).style.width).toBe('100%');
    });
  });

  // ── Prop-to-property syncing (useEffect) ──────────────────────────────────

  describe('prop → element property syncing', () => {
    it('syncs data prop to element.data', () => {
      const { container } = render(<PivotHead data={sampleData} />);
      expect((getEl(container) as any)._data).toEqual(sampleData);
    });

    it('syncs options prop to element.options', () => {
      const { container } = render(<PivotHead options={sampleOptions} />);
      expect((getEl(container) as any)._options).toEqual(sampleOptions);
    });

    it('syncs filters prop to element.filters', () => {
      const filters = [{ field: 'name', operator: 'eq', value: 'Alice' }];
      const { container } = render(<PivotHead filters={filters} />);
      expect((getEl(container) as any)._filters).toEqual(filters);
    });

    it('does not modify element.data when data prop is omitted', () => {
      const { container } = render(<PivotHead />);
      // Default from the mock constructor: []
      expect((getEl(container) as any)._data).toEqual([]);
    });

    it('does not modify element.filters when filters prop is omitted', () => {
      const { container } = render(<PivotHead />);
      expect((getEl(container) as any)._filters).toEqual([]);
    });
  });

  // ── Ref forwarding ────────────────────────────────────────────────────────

  describe('ref forwarding', () => {
    it('populates ref.current after mount', () => {
      const ref = createRef<PivotHeadRef>();
      render(<PivotHead ref={ref} />);
      expect(ref.current).not.toBeNull();
    });

    it('ref.current.el points to the DOM element', () => {
      const ref = createRef<PivotHeadRef>();
      const { container } = render(<PivotHead ref={ref} />);
      expect(ref.current?.el).toBe(getEl(container));
    });

    it('exposes a methods object on the ref', () => {
      const ref = createRef<PivotHeadRef>();
      render(<PivotHead ref={ref} />);
      expect(ref.current?.methods).toBeDefined();
    });

    it('every expected method is a function', () => {
      const ref = createRef<PivotHeadRef>();
      render(<PivotHead ref={ref} />);
      const methods = ref.current?.methods as Record<string, unknown>;
      const expected = [
        'getState', 'refresh', 'sort', 'setMeasures', 'setDimensions',
        'setGroupConfig', 'getFilters', 'getPagination', 'getData',
        'getProcessedData', 'formatValue', 'updateFieldFormatting',
        'getFieldAlignment', 'showFormatPopup', 'getGroupedData',
        'swapRows', 'swapColumns', 'previousPage', 'nextPage',
        'setPageSize', 'goToPage', 'setViewMode', 'getViewMode',
        'exportToHTML', 'exportToPDF', 'exportToExcel', 'openPrintDialog',
      ];
      for (const name of expected) {
        expect(typeof methods[name], `methods.${name}`).toBe('function');
      }
    });

    it('getData() via ref returns the synced data', () => {
      const ref = createRef<PivotHeadRef>();
      render(<PivotHead ref={ref} data={sampleData} />);
      expect(ref.current?.methods.getData()).toEqual(sampleData);
    });

    it('setViewMode / getViewMode round-trip via ref', () => {
      const ref = createRef<PivotHeadRef>();
      render(<PivotHead ref={ref} />);
      ref.current?.methods.setViewMode('raw');
      expect(ref.current?.methods.getViewMode()).toBe('raw');
    });

    it('getPagination() via ref returns default pagination', () => {
      const ref = createRef<PivotHeadRef>();
      render(<PivotHead ref={ref} />);
      const p = ref.current?.methods.getPagination();
      expect(p?.currentPage).toBe(1);
      expect(p?.pageSize).toBe(10);
    });
  });

  // ── Event callbacks ───────────────────────────────────────────────────────

  describe('event callbacks', () => {
    it('calls onPaginationChange once on mount with initial pagination state', () => {
      const onPaginationChange = vi.fn();
      render(<PivotHead onPaginationChange={onPaginationChange} />);
      expect(onPaginationChange).toHaveBeenCalledOnce();
      const detail = (onPaginationChange.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.currentPage).toBe(1);
      expect(detail.pageSize).toBe(10);
    });

    it('calls onStateChange when stateChange fires on the element', () => {
      const onStateChange = vi.fn();
      const { container } = render(<PivotHead onStateChange={onStateChange} />);
      act(() => {
        (getEl(container) as any)._emit('stateChange', { data: [], processedData: {} });
      });
      expect(onStateChange).toHaveBeenCalledOnce();
    });

    it('calls onViewModeChange with the correct mode when viewModeChange fires', () => {
      const onViewModeChange = vi.fn();
      const { container } = render(<PivotHead onViewModeChange={onViewModeChange} />);
      act(() => {
        (getEl(container) as any)._emit('viewModeChange', { mode: 'raw' });
      });
      expect(onViewModeChange).toHaveBeenCalledOnce();
      const detail = (onViewModeChange.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.mode).toBe('raw');
    });

    it('calls onPaginationChange when paginationChange fires on the element', () => {
      const onPaginationChange = vi.fn();
      const { container } = render(<PivotHead onPaginationChange={onPaginationChange} />);
      onPaginationChange.mockClear(); // ignore the initial mount call
      act(() => {
        (getEl(container) as any)._emit('paginationChange', {
          currentPage: 2, pageSize: 10, totalPages: 3,
        });
      });
      expect(onPaginationChange).toHaveBeenCalledOnce();
      const detail = (onPaginationChange.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.currentPage).toBe(2);
    });

    it('does not call callbacks that are not provided', () => {
      // Should render and handle events without crashing when callbacks are absent
      const { container } = render(<PivotHead />);
      expect(() => {
        act(() => {
          (getEl(container) as any)._emit('stateChange', {});
          (getEl(container) as any)._emit('viewModeChange', { mode: 'raw' });
          (getEl(container) as any)._emit('paginationChange', { currentPage: 1, pageSize: 10, totalPages: 1 });
        });
      }).not.toThrow();
    });
  });

  // ── Slot rendering ────────────────────────────────────────────────────────

  describe('slot rendering', () => {
    it('renders header and body slot wrappers in minimal mode', () => {
      const { container } = render(
        <PivotHead
          mode="minimal"
          headerSlot={<span id="hdr">Header</span>}
          bodySlot={<span id="bdy">Body</span>}
        />
      );
      const el = getEl(container);
      const children = Array.from(el.children) as HTMLElement[];
      expect(children.find(c => c.getAttribute('slot') === 'header')).toBeDefined();
      expect(children.find(c => c.getAttribute('slot') === 'body')).toBeDefined();
    });

    it('renders slot content inside the wrappers', () => {
      const { container } = render(
        <PivotHead
          mode="minimal"
          headerSlot={<span id="hdr">Header</span>}
          bodySlot={<span id="bdy">Body</span>}
        />
      );
      expect(container.querySelector('#hdr')).not.toBeNull();
      expect(container.querySelector('#bdy')).not.toBeNull();
    });

    it('does not render slot wrappers in default mode', () => {
      const { container } = render(<PivotHead mode="default" />);
      const el = getEl(container);
      const slotChildren = Array.from(el.children).filter(
        c => (c as HTMLElement).hasAttribute('slot')
      );
      expect(slotChildren).toHaveLength(0);
    });

    it('does not render slot wrappers in none mode', () => {
      const { container } = render(<PivotHead mode="none" />);
      const el = getEl(container);
      const slotChildren = Array.from(el.children).filter(
        c => (c as HTMLElement).hasAttribute('slot')
      );
      expect(slotChildren).toHaveLength(0);
    });
  });

  // ── Pagination method delegation ──────────────────────────────────────────

  describe('pagination methods via ref', () => {
    let ref: React.RefObject<PivotHeadRef>;

    beforeEach(() => {
      ref = createRef<PivotHeadRef>();
    });

    it('nextPage() moves to the next page', () => {
      render(<PivotHead ref={ref} />);
      act(() => { ref.current?.methods.nextPage(); });
      expect(ref.current?.methods.getPagination()?.currentPage).toBe(2);
    });

    it('previousPage() is a no-op on the first page', () => {
      render(<PivotHead ref={ref} />);
      act(() => { ref.current?.methods.previousPage(); });
      expect(ref.current?.methods.getPagination()?.currentPage).toBe(1);
    });

    it('setPageSize() updates the page size and resets to page 1', () => {
      render(<PivotHead ref={ref} />);
      act(() => { ref.current?.methods.nextPage(); }); // go to page 2
      act(() => { ref.current?.methods.setPageSize(25); });
      const p = ref.current?.methods.getPagination();
      expect(p?.pageSize).toBe(25);
      expect(p?.currentPage).toBe(1);
    });

    it('goToPage() navigates to the specified page', () => {
      render(<PivotHead ref={ref} />);
      act(() => { ref.current?.methods.goToPage(3); });
      expect(ref.current?.methods.getPagination()?.currentPage).toBe(3);
    });
  });
});
