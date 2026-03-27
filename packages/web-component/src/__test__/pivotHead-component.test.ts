import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = window as unknown as Window & typeof globalThis;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.customElements = window.customElements;

// Mock the core engine to avoid pulling in the full package
vi.mock('@mindfiredigital/pivothead', () => ({
  PivotEngine: class MockPivotEngine {
    getData() {
      return [];
    }
    getProcessedData() {
      return {};
    }
    getState() {
      return { data: [], rows: [], columns: [], measures: [] };
    }
    subscribe(_cb: unknown) {
      return () => {};
    }
    applyFilters() {}
    setDataHandlingMode() {}
    setGroupConfig() {}
  },
  ConnectService: {
    connectToLocalCSV: vi.fn(),
    connectToLocalJSON: vi.fn(),
    connectToLocalFile: vi.fn(),
  },
}));

type PivotEl = HTMLElement & {
  getRawData(): unknown[];
  getPagination(): {
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  getFilters(): unknown[];
  getViewMode(): 'raw' | 'processed';
  setViewMode(mode: 'raw' | 'processed'): void;
  isDragAndDropEnabled(): boolean;
  setDragAndDropEnabled(v: boolean): void;
  loadFromUrl(url: string): Promise<void>;
  previousPage(): void;
  nextPage(): void;
  setPageSize(n: number): void;
  goToPage(n: number): void;
  setMeasures(m: unknown[]): void;
  setDimensions(d: unknown[]): void;
  setGroupConfig(g: unknown | null): void;
  sort(field: string, dir: 'asc' | 'desc'): void;
  dragRow(from: number, to: number): void;
  dragColumn(from: number, to: number): void;
  swapRows(from: number, to: number): void;
  swapColumns(from: number, to: number): void;
  swapDataRowsByIndex(from: number, to: number): void;
  swapDataColumnsByIndex(from: number, to: number): void;
  refresh(): void;
  reset(): void;
};

describe('PivotHeadElement — component tests', () => {
  beforeAll(async () => {
    await import('../pivot-head/pivotHead');
  });

  // ── Static API ───────────────────────────────────────────────────────────

  describe('observedAttributes', () => {
    it('exposes exactly the expected observed attributes', () => {
      const Ctor = customElements.get('pivot-head') as typeof HTMLElement & {
        observedAttributes: string[];
      };
      expect(Ctor.observedAttributes).toEqual(
        expect.arrayContaining([
          'data',
          'options',
          'filters',
          'pagination',
          'mode',
        ])
      );
      expect(Ctor.observedAttributes).toHaveLength(5);
    });
  });

  // ── Default state (no engine) ────────────────────────────────────────────

  describe('default state on a fresh element', () => {
    let el: PivotEl;

    beforeEach(() => {
      el = document.createElement('pivot-head') as PivotEl;
      document.body.appendChild(el);
    });

    afterEach(() => {
      el?.parentNode?.removeChild(el as unknown as Node);
    });

    it('getRawData() returns an empty array', () => {
      expect(el.getRawData()).toEqual([]);
    });

    it('getPagination() returns sensible defaults', () => {
      const p = el.getPagination();
      expect(p.currentPage).toBe(1);
      expect(p.pageSize).toBe(10);
      expect(p.totalPages).toBe(1);
    });

    it('getViewMode() defaults to "processed"', () => {
      expect(el.getViewMode()).toBe('processed');
    });

    it('getFilters() returns an empty array', () => {
      expect(el.getFilters()).toEqual([]);
    });

    it('isDragAndDropEnabled() is false when no draggable elements exist', () => {
      expect(el.isDragAndDropEnabled()).toBe(false);
    });
  });

  // ── setViewMode / getViewMode ────────────────────────────────────────────

  describe('setViewMode / getViewMode', () => {
    let el: PivotEl;

    beforeEach(() => {
      el = document.createElement('pivot-head') as PivotEl;
      document.body.appendChild(el);
    });

    afterEach(() => {
      el?.parentNode?.removeChild(el as unknown as Node);
    });

    it('setViewMode("raw") updates getViewMode()', () => {
      el.setViewMode('raw');
      expect(el.getViewMode()).toBe('raw');
    });

    it('setViewMode("processed") updates getViewMode()', () => {
      el.setViewMode('raw');
      el.setViewMode('processed');
      expect(el.getViewMode()).toBe('processed');
    });

    it('does not emit viewModeChange when engine is absent', () => {
      const handler = vi.fn();
      el.addEventListener('viewModeChange', handler);
      el.setViewMode('raw');
      expect(handler).not.toHaveBeenCalled();
    });

    it('is a no-op when the requested mode is already active', () => {
      // 'processed' is the default — calling it again should not throw
      expect(() => el.setViewMode('processed')).not.toThrow();
    });
  });

  // ── Drag-and-drop surface API ────────────────────────────────────────────

  describe('drag-and-drop surface API', () => {
    let el: PivotEl;

    beforeEach(() => {
      el = document.createElement('pivot-head') as PivotEl;
      document.body.appendChild(el);
    });

    afterEach(() => {
      el?.parentNode?.removeChild(el as unknown as Node);
    });

    it('setDragAndDropEnabled(false) does not throw when no table is rendered', () => {
      expect(() => el.setDragAndDropEnabled(false)).not.toThrow();
    });

    it('dragRow() does not throw when engine is absent', () => {
      expect(() => el.dragRow(0, 1)).not.toThrow();
    });

    it('dragColumn() does not throw when engine is absent', () => {
      expect(() => el.dragColumn(0, 1)).not.toThrow();
    });

    it('swapRows() does not throw when engine is absent', () => {
      expect(() => el.swapRows(0, 1)).not.toThrow();
    });

    it('swapColumns() does not throw when engine is absent', () => {
      expect(() => el.swapColumns(0, 1)).not.toThrow();
    });

    it('swapDataRowsByIndex() delegates to swapRows without throwing', () => {
      expect(() => el.swapDataRowsByIndex(0, 1)).not.toThrow();
    });

    it('swapDataColumnsByIndex() delegates to swapColumns without throwing', () => {
      expect(() => el.swapDataColumnsByIndex(0, 1)).not.toThrow();
    });
  });

  // ── Engine-gated methods (no engine) ────────────────────────────────────

  describe('engine-gated API methods without engine', () => {
    let el: PivotEl;

    beforeEach(() => {
      el = document.createElement('pivot-head') as PivotEl;
      document.body.appendChild(el);
    });

    afterEach(() => {
      el?.parentNode?.removeChild(el as unknown as Node);
    });

    it('setMeasures() does not throw', () => {
      expect(() => el.setMeasures([])).not.toThrow();
    });

    it('setDimensions() does not throw', () => {
      expect(() => el.setDimensions([])).not.toThrow();
    });

    it('setGroupConfig(null) does not throw', () => {
      expect(() => el.setGroupConfig(null)).not.toThrow();
    });

    it('sort() does not throw', () => {
      expect(() => el.sort('field', 'asc')).not.toThrow();
    });

    it('refresh() does not throw', () => {
      expect(() => el.refresh()).not.toThrow();
    });

    it('reset() does not throw', () => {
      expect(() => el.reset()).not.toThrow();
    });
  });

  // ── attributeChangedCallback ─────────────────────────────────────────────

  describe('attributeChangedCallback', () => {
    let el: HTMLElement;

    beforeEach(() => {
      el = document.createElement('pivot-head');
      document.body.appendChild(el);
    });

    afterEach(() => {
      el?.parentNode?.removeChild(el);
    });

    it('does not throw for a valid JSON data attribute', () => {
      expect(() =>
        el.setAttribute('data', JSON.stringify([{ name: 'Alice', value: 10 }]))
      ).not.toThrow();
    });

    it('does not throw for a valid options attribute', () => {
      expect(() =>
        el.setAttribute(
          'options',
          JSON.stringify({ rows: ['name'], measures: [] })
        )
      ).not.toThrow();
    });

    it('does not throw for a valid pagination attribute', () => {
      expect(() =>
        el.setAttribute(
          'pagination',
          JSON.stringify({ currentPage: 2, pageSize: 20, totalPages: 5 })
        )
      ).not.toThrow();
    });

    it('does not throw for malformed JSON on data attribute (error is swallowed)', () => {
      expect(() => el.setAttribute('data', 'not{valid')).not.toThrow();
    });

    it('does not throw when setting mode without an engine', () => {
      expect(() => el.setAttribute('mode', 'none')).not.toThrow();
    });
  });

  // ── loadFromUrl URL validation ────────────────────────────────────────────

  describe('loadFromUrl — URL scheme validation', () => {
    let el: PivotEl;

    beforeEach(() => {
      el = document.createElement('pivot-head') as PivotEl;
      document.body.appendChild(el);
    });

    afterEach(() => {
      el?.parentNode?.removeChild(el as unknown as Node);
    });

    it('rejects javascript: protocol', async () => {
      await expect(el.loadFromUrl('javascript:alert(1)')).rejects.toThrow(
        /Unsupported URL protocol|Invalid URL/
      );
    });

    it('rejects data: protocol', async () => {
      await expect(el.loadFromUrl('data:text/plain,hello')).rejects.toThrow(
        /Unsupported URL protocol|Invalid URL/
      );
    });

    it('rejects file: protocol', async () => {
      await expect(el.loadFromUrl('file:///etc/passwd')).rejects.toThrow(
        /Unsupported URL protocol|Invalid URL/
      );
    });
  });

  // ── Pagination events ─────────────────────────────────────────────────────

  describe('pagination events', () => {
    let el: PivotEl;

    beforeEach(() => {
      el = document.createElement('pivot-head') as PivotEl;
      // Give the element enough pages to navigate
      (el as unknown as { _pagination: object })._pagination = {
        currentPage: 2,
        pageSize: 10,
        totalPages: 5,
      };
      document.body.appendChild(el);
    });

    afterEach(() => {
      el?.parentNode?.removeChild(el as unknown as Node);
    });

    it('previousPage() dispatches paginationChange and decrements page', () => {
      const handler = vi.fn();
      el.addEventListener('paginationChange', handler);
      el.previousPage();
      expect(handler).toHaveBeenCalledOnce();
      const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.currentPage).toBe(1);
    });

    it('nextPage() dispatches paginationChange and increments page', () => {
      const handler = vi.fn();
      el.addEventListener('paginationChange', handler);
      el.nextPage();
      expect(handler).toHaveBeenCalledOnce();
      const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.currentPage).toBe(3);
    });

    it('setPageSize() dispatches paginationChange with updated pageSize', () => {
      const handler = vi.fn();
      el.addEventListener('paginationChange', handler);
      el.setPageSize(25);
      expect(handler).toHaveBeenCalledOnce();
      const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.pageSize).toBe(25);
      expect(detail.currentPage).toBe(1); // reset to page 1 on size change
    });

    it('goToPage() dispatches paginationChange with the target page', () => {
      const handler = vi.fn();
      el.addEventListener('paginationChange', handler);
      el.goToPage(4);
      expect(handler).toHaveBeenCalledOnce();
      const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.currentPage).toBe(4);
    });

    it('previousPage() is a no-op on the first page', () => {
      const paginationEl = el as unknown as {
        _pagination: { currentPage: number };
      };
      paginationEl._pagination.currentPage = 1;
      const handler = vi.fn();
      el.addEventListener('paginationChange', handler);
      el.previousPage();
      expect(handler).not.toHaveBeenCalled();
    });

    it('nextPage() is a no-op on the last page', () => {
      const paginationEl = el as unknown as {
        _pagination: { currentPage: number; totalPages: number };
      };
      paginationEl._pagination.currentPage = 5;
      paginationEl._pagination.totalPages = 5;
      const handler = vi.fn();
      el.addEventListener('paginationChange', handler);
      el.nextPage();
      expect(handler).not.toHaveBeenCalled();
    });

    it('goToPage() is a no-op for out-of-range page numbers', () => {
      const handler = vi.fn();
      el.addEventListener('paginationChange', handler);
      el.goToPage(0); // below range
      el.goToPage(999); // above range
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
