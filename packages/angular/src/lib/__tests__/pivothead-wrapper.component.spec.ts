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

    it('setDimensions delegates to nativeElement.setDimensions()', () => {
      const dims = [{ uniqueName: 'region', caption: 'Region' }];
      component.setDimensions(dims as never);
      expect(mockEl.setDimensions).toHaveBeenCalledWith(dims);
    });

    it('setGroupConfig delegates config to nativeElement.setGroupConfig()', () => {
      const config = { field: 'category', values: ['A', 'B'] };
      component.setGroupConfig(config as never);
      expect(mockEl.setGroupConfig).toHaveBeenCalledWith(config);
    });

    it('setGroupConfig passes null to nativeElement.setGroupConfig()', () => {
      component.setGroupConfig(null);
      expect(mockEl.setGroupConfig).toHaveBeenCalledWith(null);
    });

    it('getPagination delegates to nativeElement.getPagination()', () => {
      const result = component.getPagination();
      expect(mockEl.getPagination).toHaveBeenCalled();
      expect(result).toEqual({ currentPage: 1, totalPages: 1, pageSize: 10 });
    });

    it('getProcessedData delegates to nativeElement.getProcessedData()', () => {
      const result = component.getProcessedData();
      expect(mockEl.getProcessedData).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('formatValue delegates value and field to nativeElement.formatValue()', () => {
      const result = component.formatValue(42, 'revenue');
      expect(mockEl.formatValue).toHaveBeenCalledWith(42, 'revenue');
      expect(result).toBe('42');
    });

    it('updateFieldFormatting delegates field and format to nativeElement.updateFieldFormatting()', () => {
      const format = { type: 'currency', decimals: 2 };
      component.updateFieldFormatting('revenue', format as never);
      expect(mockEl.updateFieldFormatting).toHaveBeenCalledWith(
        'revenue',
        format
      );
    });

    it('getFieldAlignment delegates field to nativeElement.getFieldAlignment()', () => {
      const result = component.getFieldAlignment('revenue');
      expect(mockEl.getFieldAlignment).toHaveBeenCalledWith('revenue');
      expect(result).toBe('left');
    });

    it('showFormatPopup delegates to nativeElement.showFormatPopup()', () => {
      component.showFormatPopup();
      expect(mockEl.showFormatPopup).toHaveBeenCalled();
    });

    it('getGroupedData delegates to nativeElement.getGroupedData()', () => {
      const result = component.getGroupedData();
      expect(mockEl.getGroupedData).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('swapRows delegates from/to indices to nativeElement.swapRows()', () => {
      component.swapRows(0, 2);
      expect(mockEl.swapRows).toHaveBeenCalledWith(0, 2);
    });

    it('swapColumns delegates from/to indices to nativeElement.swapColumns()', () => {
      component.swapColumns(1, 3);
      expect(mockEl.swapColumns).toHaveBeenCalledWith(1, 3);
    });

    it('previousPage delegates to nativeElement.previousPage()', () => {
      component.previousPage();
      expect(mockEl.previousPage).toHaveBeenCalled();
    });

    it('setPageSize delegates size to nativeElement.setPageSize()', () => {
      component.setPageSize(25);
      expect(mockEl.setPageSize).toHaveBeenCalledWith(25);
    });

    it('openPrintDialog delegates to nativeElement.openPrintDialog()', () => {
      component.openPrintDialog();
      expect(mockEl.openPrintDialog).toHaveBeenCalled();
    });

    it('getRawData delegates to nativeElement.getRawData()', () => {
      const result = component.getRawData();
      expect(mockEl.getRawData).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('loadFromUrl delegates url to nativeElement.loadFromUrl()', async () => {
      await component.loadFromUrl('https://example.com/data.csv');
      expect(mockEl.loadFromUrl).toHaveBeenCalledWith(
        'https://example.com/data.csv'
      );
    });

    it('connectToLocalCSV delegates to nativeElement.connectToLocalCSV()', async () => {
      const result = await component.connectToLocalCSV();
      expect(mockEl.connectToLocalCSV).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('connectToLocalJSON delegates to nativeElement.connectToLocalJSON()', async () => {
      const result = await component.connectToLocalJSON();
      expect(mockEl.connectToLocalJSON).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('connectToLocalFile delegates to nativeElement.connectToLocalFile()', async () => {
      const result = await component.connectToLocalFile();
      expect(mockEl.connectToLocalFile).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('getAvailableFields delegates to nativeElement.getAvailableFields()', () => {
      const result = component.getAvailableFields();
      expect(mockEl.getAvailableFields).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('getSupportedAggregations delegates to nativeElement.getSupportedAggregations()', () => {
      const result = component.getSupportedAggregations();
      expect(mockEl.getSupportedAggregations).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('setMeasureAggregation delegates field and aggregation to nativeElement.setMeasureAggregation()', () => {
      component.setMeasureAggregation('revenue', 'sum');
      expect(mockEl.setMeasureAggregation).toHaveBeenCalledWith(
        'revenue',
        'sum'
      );
    });

    it('buildLayout delegates selection to nativeElement.buildLayout()', () => {
      const selection = { rows: ['region'], columns: ['product'] };
      component.buildLayout(selection as never);
      expect(mockEl.buildLayout).toHaveBeenCalledWith(selection);
    });

    it('dragRow delegates from/to indices to nativeElement.dragRow()', () => {
      component.dragRow(1, 4);
      expect(mockEl.dragRow).toHaveBeenCalledWith(1, 4);
    });

    it('dragColumn delegates from/to indices to nativeElement.dragColumn()', () => {
      component.dragColumn(2, 5);
      expect(mockEl.dragColumn).toHaveBeenCalledWith(2, 5);
    });
  });

  // ── Null pivotHeadRef — graceful no-op ──────────────────────────────────────

  describe('null pivotHeadRef — graceful no-op', () => {
    let bare: PivotHeadWrapperComponent;

    beforeEach(() => {
      bare = new PivotHeadWrapperComponent();
      // pivotHeadRef is intentionally left unset to simulate pre-view-init state
    });

    it('getState returns undefined when ref is absent', () => {
      expect(bare.getState()).toBeUndefined();
    });

    it('refresh does not throw when ref is absent', () => {
      expect(() => bare.refresh()).not.toThrow();
    });

    it('reset does not throw when ref is absent', () => {
      expect(() => bare.reset()).not.toThrow();
    });

    it('sort does not throw when ref is absent', () => {
      expect(() => bare.sort('field', 'asc')).not.toThrow();
    });

    it('getData returns undefined when ref is absent', () => {
      expect(bare.getData()).toBeUndefined();
    });

    it('getFilters returns undefined when ref is absent', () => {
      expect(bare.getFilters()).toBeUndefined();
    });

    it('getPagination returns undefined when ref is absent', () => {
      expect(bare.getPagination()).toBeUndefined();
    });

    it('getViewMode returns undefined when ref is absent', () => {
      expect(bare.getViewMode()).toBeUndefined();
    });

    it('isDragAndDropEnabled returns undefined when ref is absent', () => {
      expect(bare.isDragAndDropEnabled()).toBeUndefined();
    });

    it('loadFromFile resolves without throwing when ref is absent', async () => {
      const file = new File([''], 'test.csv');
      await expect(bare.loadFromFile(file)).resolves.toBeUndefined();
    });
  });
});
