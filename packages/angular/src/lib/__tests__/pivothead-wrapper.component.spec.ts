import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleChanges, SimpleChange } from '@angular/core';

// Mock the side-effect import that registers the web component
vi.mock('@mindfiredigital/pivothead-web-component', () => ({}));

// Import AFTER mock is set up
import { PivotHeadWrapperComponent } from '../pivothead-wrapper.component';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeChange(
  currentValue: unknown,
  previousValue: unknown = undefined
): SimpleChange {
  return {
    previousValue,
    currentValue,
    firstChange: previousValue === undefined,
    isFirstChange: () => previousValue === undefined,
  };
}

function buildMockEl() {
  return {
    setAttribute: vi.fn(),
    addEventListener: vi.fn(),
    getState: vi.fn().mockReturnValue({ data: [] }),
    refresh: vi.fn(),
    reset: vi.fn(),
    sort: vi.fn(),
    setMeasures: vi.fn(),
    setDimensions: vi.fn(),
    setGroupConfig: vi.fn(),
    getFilters: vi.fn().mockReturnValue([]),
    getPagination: vi
      .fn()
      .mockReturnValue({ currentPage: 1, totalPages: 1, pageSize: 10 }),
    getData: vi.fn().mockReturnValue([]),
    getProcessedData: vi.fn().mockReturnValue({}),
    formatValue: vi.fn().mockReturnValue('42'),
    updateFieldFormatting: vi.fn(),
    getFieldAlignment: vi.fn().mockReturnValue('left'),
    showFormatPopup: vi.fn(),
    getGroupedData: vi.fn().mockReturnValue([]),
    swapRows: vi.fn(),
    swapColumns: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageSize: vi.fn(),
    goToPage: vi.fn(),
    setViewMode: vi.fn(),
    getViewMode: vi.fn().mockReturnValue('raw'),
    exportToHTML: vi.fn(),
    exportToPDF: vi.fn(),
    exportToExcel: vi.fn(),
    openPrintDialog: vi.fn(),
    getRawData: vi.fn().mockReturnValue([]),
    loadFromFile: vi.fn().mockResolvedValue(undefined),
    loadFromUrl: vi.fn().mockResolvedValue(undefined),
    connectToLocalCSV: vi.fn().mockResolvedValue({ success: true }),
    connectToLocalJSON: vi.fn().mockResolvedValue({ success: true }),
    connectToLocalFile: vi.fn().mockResolvedValue({ success: true }),
    getAvailableFields: vi.fn().mockReturnValue([]),
    getSupportedAggregations: vi.fn().mockReturnValue([]),
    setMeasureAggregation: vi.fn(),
    buildLayout: vi.fn(),
    dragRow: vi.fn(),
    dragColumn: vi.fn(),
    setDragAndDropEnabled: vi.fn(),
    isDragAndDropEnabled: vi.fn().mockReturnValue(true),
  };
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('PivotHeadWrapperComponent', () => {
  let component: PivotHeadWrapperComponent;
  let mockEl: ReturnType<typeof buildMockEl>;
  let capturedListeners: Record<string, (e: Event) => void>;

  beforeEach(() => {
    capturedListeners = {};
    mockEl = buildMockEl();
    mockEl.addEventListener.mockImplementation(
      (event: string, listener: (e: Event) => void) => {
        capturedListeners[event] = listener;
      }
    );

    component = new PivotHeadWrapperComponent();
    (component as unknown as { pivotHeadRef: unknown }).pivotHeadRef = {
      nativeElement: mockEl,
    };
  });

  // ── Construction ────────────────────────────────────────────────────────────

  describe('construction', () => {
    it('creates an instance', () => {
      expect(component).toBeDefined();
    });

    it('defaults mode to "default"', () => {
      expect(component.mode).toBe('default');
    });

    it('initialises all output EventEmitters', () => {
      expect(component.stateChange).toBeDefined();
      expect(component.viewModeChange).toBeDefined();
      expect(component.paginationChange).toBeDefined();
      expect(component.dataLoaded).toBeDefined();
      expect(component.error).toBeDefined();
    });
  });

  // ── ngAfterViewInit ─────────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('sets the mode attribute on the element', () => {
      component.ngAfterViewInit();
      expect(mockEl.setAttribute).toHaveBeenCalledWith('mode', 'default');
    });

    it('sets data on the element when provided', () => {
      const data = [{ id: 1 }];
      component.data = data;
      component.ngAfterViewInit();
      expect((mockEl as unknown as Record<string, unknown>)['data']).toBe(data);
    });

    it('sets options on the element when provided', () => {
      const options = { rows: [], columns: [], measures: [] };
      component.options = options as never;
      component.ngAfterViewInit();
      expect((mockEl as unknown as Record<string, unknown>)['options']).toBe(
        options
      );
    });

    it('sets filters on the element when provided', () => {
      const filters = [{ field: 'region', operator: 'eq', value: 'North' }];
      component.filters = filters as never;
      component.ngAfterViewInit();
      expect((mockEl as unknown as Record<string, unknown>)['filters']).toBe(
        filters
      );
    });

    it('sets pagination on the element when provided', () => {
      const pagination = { currentPage: 2, totalPages: 5, pageSize: 20 };
      component.pagination = pagination as never;
      component.ngAfterViewInit();
      expect((mockEl as unknown as Record<string, unknown>)['pagination']).toBe(
        pagination
      );
    });

    it('does not set undefined optional inputs on the element', () => {
      // data, options, filters, pagination are all undefined by default
      component.ngAfterViewInit();
      expect(
        (mockEl as unknown as Record<string, unknown>)['data']
      ).toBeUndefined();
      expect(
        (mockEl as unknown as Record<string, unknown>)['options']
      ).toBeUndefined();
    });

    it('registers event listeners for all 5 output events', () => {
      component.ngAfterViewInit();
      expect(mockEl.addEventListener).toHaveBeenCalledTimes(5);
      expect(capturedListeners['stateChange']).toBeDefined();
      expect(capturedListeners['viewModeChange']).toBeDefined();
      expect(capturedListeners['paginationChange']).toBeDefined();
      expect(capturedListeners['dataLoaded']).toBeDefined();
      expect(capturedListeners['error']).toBeDefined();
    });
  });

  // ── ngOnChanges ─────────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('returns early without error when pivotHeadRef is not yet initialised', () => {
      const fresh = new PivotHeadWrapperComponent();
      expect(() =>
        fresh.ngOnChanges({ data: makeChange([{ id: 1 }]) })
      ).not.toThrow();
    });

    it('updates data on the element when data input changes', () => {
      const data = [{ id: 2 }];
      component.data = data;
      const changes: SimpleChanges = { data: makeChange(data) };
      component.ngOnChanges(changes);
      expect((mockEl as unknown as Record<string, unknown>)['data']).toBe(data);
    });

    it('updates options on the element when options input changes', () => {
      const options = { rows: [], columns: [], measures: [] };
      component.options = options as never;
      const changes: SimpleChanges = { options: makeChange(options) };
      component.ngOnChanges(changes);
      expect((mockEl as unknown as Record<string, unknown>)['options']).toBe(
        options
      );
    });

    it('updates filters on the element when filters input changes', () => {
      const filters = [{ field: 'product', operator: 'eq', value: 'A' }];
      component.filters = filters as never;
      const changes: SimpleChanges = { filters: makeChange(filters) };
      component.ngOnChanges(changes);
      expect((mockEl as unknown as Record<string, unknown>)['filters']).toBe(
        filters
      );
    });

    it('updates pagination on the element when pagination input changes', () => {
      const pagination = { currentPage: 3, totalPages: 10, pageSize: 5 };
      component.pagination = pagination as never;
      const changes: SimpleChanges = { pagination: makeChange(pagination) };
      component.ngOnChanges(changes);
      expect((mockEl as unknown as Record<string, unknown>)['pagination']).toBe(
        pagination
      );
    });

    it('updates the mode attribute when mode input changes', () => {
      component.mode = 'minimal';
      const changes: SimpleChanges = { mode: makeChange('minimal', 'default') };
      component.ngOnChanges(changes);
      expect(mockEl.setAttribute).toHaveBeenCalledWith('mode', 'minimal');
    });
  });

  // ── Event forwarding ────────────────────────────────────────────────────────

  describe('event forwarding', () => {
    beforeEach(() => {
      component.ngAfterViewInit();
    });

    it('forwards stateChange events from the web component', () => {
      const emitSpy = vi.spyOn(component.stateChange, 'emit');
      const detail = { rows: [], data: [] };
      capturedListeners['stateChange']?.(
        new CustomEvent('stateChange', { detail })
      );
      expect(emitSpy).toHaveBeenCalledWith(detail);
    });

    it('forwards viewModeChange events from the web component', () => {
      const emitSpy = vi.spyOn(component.viewModeChange, 'emit');
      const detail = { mode: 'raw' as const };
      capturedListeners['viewModeChange']?.(
        new CustomEvent('viewModeChange', { detail })
      );
      expect(emitSpy).toHaveBeenCalledWith(detail);
    });

    it('forwards paginationChange events from the web component', () => {
      const emitSpy = vi.spyOn(component.paginationChange, 'emit');
      const detail = { currentPage: 2, totalPages: 5, pageSize: 10 };
      capturedListeners['paginationChange']?.(
        new CustomEvent('paginationChange', { detail })
      );
      expect(emitSpy).toHaveBeenCalledWith(detail);
    });

    it('forwards dataLoaded events from the web component', () => {
      const emitSpy = vi.spyOn(component.dataLoaded, 'emit');
      const detail = { recordCount: 42 };
      capturedListeners['dataLoaded']?.(
        new CustomEvent('dataLoaded', { detail })
      );
      expect(emitSpy).toHaveBeenCalledWith(detail);
    });

    it('forwards error events from the web component', () => {
      const emitSpy = vi.spyOn(component.error, 'emit');
      const detail = { message: 'something went wrong' };
      capturedListeners['error']?.(new CustomEvent('error', { detail }));
      expect(emitSpy).toHaveBeenCalledWith(detail);
    });
  });

  // ── Public API delegation ───────────────────────────────────────────────────

  describe('public API delegation', () => {
    it('getState delegates to nativeElement.getState()', () => {
      const result = component.getState();
      expect(mockEl.getState).toHaveBeenCalled();
      expect(result).toEqual({ data: [] });
    });

    it('refresh delegates to nativeElement.refresh()', () => {
      component.refresh();
      expect(mockEl.refresh).toHaveBeenCalled();
    });

    it('reset delegates to nativeElement.reset()', () => {
      component.reset();
      expect(mockEl.reset).toHaveBeenCalled();
    });

    it('sort delegates field and direction to nativeElement.sort()', () => {
      component.sort('revenue', 'desc');
      expect(mockEl.sort).toHaveBeenCalledWith('revenue', 'desc');
    });

    it('setMeasures delegates to nativeElement.setMeasures()', () => {
      const measures = [
        { uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' as const },
      ];
      component.setMeasures(measures);
      expect(mockEl.setMeasures).toHaveBeenCalledWith(measures);
    });

    it('getFilters delegates to nativeElement.getFilters()', () => {
      const result = component.getFilters();
      expect(mockEl.getFilters).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('getData delegates to nativeElement.getData()', () => {
      component.getData();
      expect(mockEl.getData).toHaveBeenCalled();
    });

    it('exportToHTML delegates fileName to nativeElement.exportToHTML()', () => {
      component.exportToHTML('report');
      expect(mockEl.exportToHTML).toHaveBeenCalledWith('report');
    });

    it('exportToPDF delegates fileName to nativeElement.exportToPDF()', () => {
      component.exportToPDF('report');
      expect(mockEl.exportToPDF).toHaveBeenCalledWith('report');
    });

    it('exportToExcel delegates fileName to nativeElement.exportToExcel()', () => {
      component.exportToExcel('report');
      expect(mockEl.exportToExcel).toHaveBeenCalledWith('report');
    });

    it('nextPage delegates to nativeElement.nextPage()', () => {
      component.nextPage();
      expect(mockEl.nextPage).toHaveBeenCalled();
    });

    it('goToPage delegates page number to nativeElement.goToPage()', () => {
      component.goToPage(3);
      expect(mockEl.goToPage).toHaveBeenCalledWith(3);
    });

    it('setViewMode delegates mode to nativeElement.setViewMode()', () => {
      component.setViewMode('processed');
      expect(mockEl.setViewMode).toHaveBeenCalledWith('processed');
    });

    it('getViewMode delegates to nativeElement.getViewMode()', () => {
      const result = component.getViewMode();
      expect(mockEl.getViewMode).toHaveBeenCalled();
      expect(result).toBe('raw');
    });

    it('setDragAndDropEnabled delegates to nativeElement.setDragAndDropEnabled()', () => {
      component.setDragAndDropEnabled(false);
      expect(mockEl.setDragAndDropEnabled).toHaveBeenCalledWith(false);
    });

    it('isDragAndDropEnabled delegates to nativeElement.isDragAndDropEnabled()', () => {
      const result = component.isDragAndDropEnabled();
      expect(mockEl.isDragAndDropEnabled).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('loadFromFile delegates file to nativeElement.loadFromFile()', async () => {
      const file = new File(['content'], 'data.csv');
      await component.loadFromFile(file);
      expect(mockEl.loadFromFile).toHaveBeenCalledWith(file);
    });
  });
});
