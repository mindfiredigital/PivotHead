import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectService, FileConnectionResult } from '../engine/connectService';
import { PivotEngine } from '../engine/pivotEngine';

// Mock the PivotEngine class, only mocking the methods we need
const mockPivotEngine = {
  updateDataSource: vi.fn(),
} as unknown as PivotEngine<any>;

// A helper class to mock the browser's File object
class MockFile {
  private content: string;
  name: string;
  size: number;
  type: string;

  constructor(content: string, name: string, options?: { type?: string }) {
    this.content = content;
    this.name = name;
    this.size = new Blob([content]).size;
    this.type = options?.type || '';
  }

  // FileReader uses this internally in our mock
  async text(): Promise<string> {
    return Promise.resolve(this.content);
  }
}

// Mock the global FileReader API
const mockFileReader = {
  onload: vi.fn(),
  onerror: vi.fn(),
  onprogress: vi.fn(),
  readAsText: vi.fn().mockImplementation(function (this: any, file: MockFile) {
    // Simulate async file reading
    file.text().then(content => {
      this.result = content;
      if (this.onload) {
        this.onload();
      }
    });
  }),
  result: '',
};

vi.stubGlobal(
  'FileReader',
  vi.fn(() => mockFileReader)
);
vi.stubGlobal('File', MockFile);

// Mock Notification API for testing showImportNotification
const NotificationMock = vi.fn();
// Assign properties to the mock function itself to simulate a class with static properties
(NotificationMock as any).permission = 'granted';
(NotificationMock as any).requestPermission = vi
  .fn()
  .mockResolvedValue('granted');
vi.stubGlobal('Notification', NotificationMock);

describe('ConnectService', () => {
  // Spy on the private method to control its behavior without DOM interaction
  let openFilePickerSpy: any;

  beforeEach(() => {
    // Mock the file picker to return a promise. We'll set the resolved value in each test.
    openFilePickerSpy = vi
      .spyOn(ConnectService as any, 'openFilePicker')
      .mockResolvedValue(null);

    // Suppress console messages during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clear all mocks after each test to ensure isolation
    vi.clearAllMocks();
  });

  describe('connectToLocalCSV', () => {
    it('should return success: false when no file is selected', async () => {
      openFilePickerSpy.mockResolvedValue(null);
      const result = await ConnectService.connectToLocalCSV(mockPivotEngine);
      expect(result).toEqual({ success: false, error: 'No file selected' });
    });

    it('should successfully process a valid CSV file', async () => {
      const csvContent = 'product,sales\nBook,150\nPen,20';
      const file = new MockFile(csvContent, 'sales.csv');
      openFilePickerSpy.mockResolvedValue(file);

      const result = await ConnectService.connectToLocalCSV(mockPivotEngine);

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('sales.csv');
      expect(result.recordCount).toBe(2);
      expect(result.columns).toEqual(['product', 'sales']);
      expect(mockPivotEngine.updateDataSource).toHaveBeenCalledWith([
        { product: 'Book', sales: 150 },
        { product: 'Pen', sales: 20 },
      ]);
    });

    it('should handle file processing errors gracefully', async () => {
      openFilePickerSpy.mockRejectedValue(new Error('File system error'));
      const result = await ConnectService.connectToLocalCSV(mockPivotEngine);
      expect(result).toEqual({
        success: false,
        error: 'File system error',
      });
    });
  });

  describe('connectToLocalJSON', () => {
    it('should return success: false when no file is selected', async () => {
      openFilePickerSpy.mockResolvedValue(null);
      const result = await ConnectService.connectToLocalJSON(mockPivotEngine);
      expect(result).toEqual({ success: false, error: 'No file selected' });
    });

    it('should successfully process a valid JSON file', async () => {
      const jsonContent =
        '[{"product": "Laptop", "price": 1200},{"product": "Mouse", "price": 25}]';
      const file = new MockFile(jsonContent, 'products.json');
      openFilePickerSpy.mockResolvedValue(file);

      const result = await ConnectService.connectToLocalJSON(mockPivotEngine);

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('products.json');
      expect(result.recordCount).toBe(2);
      expect(result.columns).toEqual(['product', 'price']);
      expect(mockPivotEngine.updateDataSource).toHaveBeenCalledWith([
        { product: 'Laptop', price: 1200 },
        { product: 'Mouse', price: 25 },
      ]);
    });

    it('should handle invalid JSON format', async () => {
      const invalidJsonContent = '[{"product": "Laptop"'; // Missing closing brackets
      const file = new MockFile(invalidJsonContent, 'bad.json');
      openFilePickerSpy.mockResolvedValue(file);

      const result = await ConnectService.connectToLocalJSON(mockPivotEngine);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Invalid JSON format. Please check your file syntax.'
      );
    });
  });

  describe('connectToLocalFile', () => {
    it('should delegate to processCSVFile for .csv files', async () => {
      const file = new MockFile('a,b\n1,2', 'data.csv');
      openFilePickerSpy.mockResolvedValue(file);
      const result = await ConnectService.connectToLocalFile(mockPivotEngine);
      expect(result.success).toBe(true);
      expect(result.fileName).toBe('data.csv');
    });

    it('should delegate to processJSONFile for .json files', async () => {
      const file = new MockFile('[{"a":1}]', 'data.json');
      openFilePickerSpy.mockResolvedValue(file);
      const result = await ConnectService.connectToLocalFile(mockPivotEngine);
      expect(result.success).toBe(true);
      expect(result.fileName).toBe('data.json');
    });

    it('should return an error for unsupported file types', async () => {
      const file = new MockFile('<xml></xml>', 'data.xml');
      openFilePickerSpy.mockResolvedValue(file);
      const result = await ConnectService.connectToLocalFile(mockPivotEngine);
      expect(result).toEqual({
        success: false,
        error: 'Unsupported file type: .xml',
      });
    });
  });

  describe('File Validation', () => {
    it('should reject files that exceed the maximum size limit', async () => {
      const file = new MockFile('a,b,c\n1,2,3', 'large.csv');
      // Manually set size to be larger than the limit
      Object.defineProperty(file, 'size', { value: 60 * 1024 * 1024 }); // 60MB
      openFilePickerSpy.mockResolvedValue(file);

      const result = await ConnectService.connectToLocalCSV(mockPivotEngine);
      expect(result.success).toBe(false);
      // CORRECTED: The expected string now matches the mock file's size
      expect(result.error).toBe(
        'File size (60 MB) exceeds maximum allowed size (50 MB)'
      );
    });
  });

  describe('CSV Parsing Logic', () => {
    it('should correctly parse CSV data without a header', async () => {
      const csvContent = 'value1,100\nvalue2,200';
      const file = new MockFile(csvContent, 'no-header.csv');
      openFilePickerSpy.mockResolvedValue(file);

      const result = await ConnectService.connectToLocalCSV(mockPivotEngine, {
        csv: { hasHeader: false },
      });
      expect(result.success).toBe(true);
      expect(result.columns).toEqual(['Column_1', 'Column_2']);
      expect(mockPivotEngine.updateDataSource).toHaveBeenCalledWith([
        { Column_1: 'value1', Column_2: 100 },
        { Column_1: 'value2', Column_2: 200 },
      ]);
    });

    it('should correctly handle different delimiters', async () => {
      const csvContent = 'header1;header2\n"value 1";300';
      const file = new MockFile(csvContent, 'delimiter.csv');
      openFilePickerSpy.mockResolvedValue(file);

      await ConnectService.connectToLocalCSV(mockPivotEngine, {
        csv: { delimiter: ';' },
      });
      expect(mockPivotEngine.updateDataSource).toHaveBeenCalledWith([
        { header1: 'value 1', header2: 300 },
      ]);
    });
  });

  describe('JSON Parsing Logic', () => {
    it('should extract an array from a specified nested path', async () => {
      const jsonContent =
        '{"response": {"status": "ok", "items": [{"id": 1}]}}';
      const file = new MockFile(jsonContent, 'nested.json');
      openFilePickerSpy.mockResolvedValue(file);

      await ConnectService.connectToLocalJSON(mockPivotEngine, {
        json: { arrayPath: 'response.items' },
      });
      expect(mockPivotEngine.updateDataSource).toHaveBeenCalledWith([
        { id: 1 },
      ]);
    });

    it('should return an error if no array data is found in a JSON object', async () => {
      const jsonContent = '{"status": "ok", "count": 0}';
      const file = new MockFile(jsonContent, 'no-array.json');
      openFilePickerSpy.mockResolvedValue(file);

      const result = await ConnectService.connectToLocalJSON(mockPivotEngine);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No array data found in JSON file.');
    });
  });

  // CORRECTED: Test the private method directly because the public-facing methods
  // cannot trigger the duplicate header warning due to their implementation.
  describe('validateDataStructure (private method)', () => {
    it('should detect duplicate column names', () => {
      const columns = ['id', 'name', 'region', 'id'];
      const data = [{ id: 1, name: 'Test', region: 'NA' }]; // Data is not used for this specific check
      // Access private static method for testing purposes
      const warnings = (ConnectService as any).validateDataStructure(
        data,
        columns
      );
      expect(warnings).toContain('Found duplicate column names: id');
    });

    it('should detect inconsistent column counts in the data sample', () => {
      const columns = ['id', 'name'];
      const data = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2', region: 'NA' }, // This row has an extra key
      ];
      const warnings = (ConnectService as any).validateDataStructure(
        data,
        columns
      );
      expect(warnings).toContain(
        'Found 1 rows with inconsistent column count in sample'
      );
    });
  });

  describe('Utility Functions', () => {
    it('createImportSummary should generate a correct summary for a successful import', () => {
      const result: FileConnectionResult = {
        success: true,
        fileName: 'data.csv',
        fileSize: 1536, // 1.5 KB
        recordCount: 50,
        columns: ['id', 'name'],
        validationErrors: ['Inconsistent column count'],
      };
      const summary = ConnectService.createImportSummary(result);
      expect(summary).toContain(
        'Successfully imported 50 records from data.csv'
      );
      expect(summary).toContain('Columns: id, name');
      expect(summary).toContain('File size: 1.5 KB');
      expect(summary).toContain('Warnings:\n• Inconsistent column count');
    });

    it('createImportSummary should generate a correct summary for a failed import', () => {
      const result: FileConnectionResult = {
        success: false,
        error: 'File is too large.',
      };
      const summary = ConnectService.createImportSummary(result);
      expect(summary).toBe('Import failed: File is too large.');
    });

    // CORRECTED: Use the mock directly instead of trying to spy on it.
    it('showImportNotification should trigger a notification for a successful import', () => {
      const result: FileConnectionResult = {
        success: true,
        recordCount: 150,
        fileName: 'import.csv',
      };
      ConnectService.showImportNotification(result);
      expect(NotificationMock).toHaveBeenCalledWith('Import Successful', {
        body: 'Imported 150 records from import.csv',
        icon: '/favicon.ico',
      });
    });
  });
});
