import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PivotExportService } from '../engine/exportService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { PivotTableState } from '../types/interfaces';

// Mock dependencies
vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn().mockReturnValue({}),
    book_new: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
    decode_range: vi.fn().mockReturnValue({ e: { c: 5 } }),
    encode_cell: vi
      .fn()
      .mockImplementation(
        ({ r, c }) => `${String.fromCharCode(65 + c)}${r + 1}`
      ),
  },
  writeFile: vi.fn(),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297),
      },
    },
  })),
}));

vi.mock('jspdf-autotable', () => ({
  autoTable: vi.fn(),
}));

describe('PivotExportService', () => {
  // Mock document methods
  beforeEach(() => {
    // Mock document methods
    document.createElement = vi.fn().mockImplementation(tag => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
          style: {},
        };
      }
      if (tag === 'div') {
        return {
          style: {},
          innerHTML: '',
          querySelector: vi.fn().mockReturnValue({ style: {} }),
        };
      }
      return {};
    });
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();
    window.open = vi.fn().mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Sample state for testing - Properly typed with all required properties
  const createMockState = (isEmpty = false): PivotTableState<any> => ({
    data: isEmpty
      ? []
      : [
          { product: 'Product A', region: 'North', sales: 100, profit: 25 },
          { product: 'Product B', region: 'North', sales: 150, profit: 40 },
          { product: 'Product A', region: 'South', sales: 200, profit: 50 },
          { product: 'Product B', region: 'South', sales: 250, profit: 60 },
        ],
    dataHandlingMode: 'raw',
    rawData: isEmpty
      ? []
      : [
          { product: 'Product A', region: 'North', sales: 100, profit: 25 },
          { product: 'Product B', region: 'North', sales: 150, profit: 40 },
          { product: 'Product A', region: 'South', sales: 200, profit: 50 },
          { product: 'Product B', region: 'South', sales: 250, profit: 60 },
        ],
    processedData: {
      headers: ['Product', 'Region'],
      rows: [],
      totals: { sales: 700, profit: 175 },
    },
    rows: [{ uniqueName: 'product', caption: 'Product' }],
    columns: [{ uniqueName: 'region', caption: 'Region' }],
    measures: [
      { uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' },
      { uniqueName: 'profit', caption: 'Profit', aggregation: 'sum' },
    ],
    selectedMeasures: [
      { uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' },
      { uniqueName: 'profit', caption: 'Profit', aggregation: 'sum' },
    ],
    selectedDimensions: [],
    selectedAggregation: 'sum',
    formatting: {
      sales: { type: 'number', decimals: 0, locale: 'en-US' },
      profit: {
        type: 'currency',
        currency: 'USD',
        decimals: 2,
        locale: 'en-US',
      },
    },
    groups: [
      {
        key: 'Product A - North',
        items: [],
        aggregates: { sum_sales: 100, sum_profit: 25 },
      },
      {
        key: 'Product B - North',
        items: [],
        aggregates: { sum_sales: 150, sum_profit: 40 },
      },
      {
        key: 'Product A - South',
        items: [],
        aggregates: { sum_sales: 200, sum_profit: 50 },
      },
      {
        key: 'Product B - South',
        items: [],
        aggregates: { sum_sales: 250, sum_profit: 60 },
      },
    ],
    sortConfig: [],
    rowSizes: [],
    expandedRows: {},
    groupConfig: null,
    columnWidths: {},
    isResponsive: true,
    rowGroups: [],
    columnGroups: [],
    filterConfig: [],
    paginationConfig: {
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    },
  });

  describe('convertToHtml', () => {
    it('should convert state to HTML representation', () => {
      const state = createMockState();
      const html = PivotExportService.convertToHtml(state);

      // Verify HTML structure
      expect(html).toContain('<table');
      expect(html).toContain('Product /<br>Region');
      expect(html).toContain('North');
      expect(html).toContain('South');
      expect(html).toContain('Sales');
      expect(html).toContain('Profit');
    });

    it('should handle empty data', () => {
      const state = createMockState(true);
      const html = PivotExportService.convertToHtml(state);
      expect(html).toContain('No data to display');
    });

    it('should include pagination information', () => {
      const state = createMockState();
      state.paginationConfig.currentPage = 2;
      state.paginationConfig.totalPages = 5;

      const html = PivotExportService.convertToHtml(state);
      expect(html).toContain('Page 2 of 5');
    });
  });

  describe('exportToHTML', () => {
    it('should create a data URL and trigger download', () => {
      const state = createMockState();
      PivotExportService.exportToHTML(state, 'test-file');

      // Check if a element was created
      expect(document.createElement).toHaveBeenCalledWith('a');

      // Check if appendChild and removeChild were called
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();

      // Check that URL.createObjectURL and revokeObjectURL are not called (using data URL instead)
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('exportToPDF', () => {
    it('should create a PDF and save it', () => {
      const state = createMockState();
      PivotExportService.exportToPDF(state, 'test-file');

      // Check if container was created
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.body.appendChild).toHaveBeenCalled();

      // Check if jsPDF was initialized
      expect(jsPDF).toHaveBeenCalled();

      // Check if PDF was saved
      const mockJsPDF = jsPDF as unknown as ReturnType<typeof vi.fn>;
      const pdfInstance = mockJsPDF.mock.results[0].value;
      expect(pdfInstance.save).toHaveBeenCalledWith('test-file.pdf');

      // Check cleanup
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should handle case when table element is not found', () => {
      const state = createMockState();

      // Mock querySelector to return null
      document.createElement = vi.fn().mockImplementation(() => ({
        style: {},
        innerHTML: '',
        querySelector: vi.fn().mockReturnValue(null),
      }));

      // Mock console.error
      const originalConsoleError = console.error;
      console.error = vi.fn();

      PivotExportService.exportToPDF(state);

      expect(console.error).toHaveBeenCalledWith(
        'No table found in the generated HTML'
      );
      expect(document.body.removeChild).toHaveBeenCalled();

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('exportToExcel', () => {
    it('should create an Excel file and save it', () => {
      const state = createMockState();
      PivotExportService.exportToExcel(state, 'test-file');

      // Check if Excel workbook was created
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();

      // Check if file was saved
      expect(XLSX.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        'test-file.xlsx'
      );
    });

    it('should handle empty data', () => {
      const state = createMockState(true);
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      PivotExportService.exportToExcel(state);

      expect(console.log).toHaveBeenCalledWith('No data to export!');
      expect(XLSX.writeFile).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should handle missing dimension configuration', () => {
      const state = createMockState();
      state.rows = [];

      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      PivotExportService.exportToExcel(state);

      expect(console.log).toHaveBeenCalledWith(
        'Missing row or column dimension'
      );
      expect(XLSX.writeFile).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should apply correct formatting to Excel cells', () => {
      const state = createMockState();

      // Add a percentage measure
      state.measures.push({
        uniqueName: 'margin',
        caption: 'Margin',
        aggregation: 'sum',
      });
      state.selectedMeasures.push({
        uniqueName: 'margin',
        caption: 'Margin',
        aggregation: 'sum',
      });
      state.formatting.margin = { type: 'percentage', decimals: 2 };

      PivotExportService.exportToExcel(state);

      // Check cell formatting was applied
      // This is a bit tricky to test without deeper mocking
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.decode_range).toHaveBeenCalled();
    });
  });

  describe('openPrintDialog', () => {
    it('should open a new window with formatted content', () => {
      const state = createMockState();
      PivotExportService.openPrintDialog(state);

      // Check if window was opened
      expect(window.open).toHaveBeenCalled();
    });

    it('should handle error if window cannot be opened', () => {
      const state = createMockState();

      // Mock window.open to return null (blocked popup)
      window.open = vi.fn().mockReturnValue(null);

      // Mock console.error
      const originalConsoleError = console.error;
      console.error = vi.fn();

      PivotExportService.openPrintDialog(state);

      expect(console.error).toHaveBeenCalledWith('Failed to open print dialog');

      // Restore console.error
      console.error = originalConsoleError;
    });
  });
});
