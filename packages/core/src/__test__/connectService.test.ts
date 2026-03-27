import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectService, FileConnectionResult } from '../engine/connectService';
import { PivotEngine } from '../engine/pivotEngine';
import { validateDataStructure } from '../engine/connect/fileUtils';

// Mock the fileUtils module so we can control openFilePicker
vi.mock('../engine/connect/fileUtils', async () => {
  const actual = await vi.importActual<
    typeof import('../engine/connect/fileUtils')
  >('../engine/connect/fileUtils');
  return {
    ...actual,
    openFilePicker: vi.fn().mockResolvedValue(null),
  };
});

// Import the mocked function for direct control in tests
import { openFilePicker } from '../engine/connect/fileUtils';
import { DataRecord } from '../types/interfaces';
const openFilePickerMock = openFilePicker as ReturnType<typeof vi.fn>;

// Mock the PivotEngine class, only mocking the methods we need
const mockPivotEngine = {
  updateDataSource: vi.fn(),
  setLayout: vi.fn(),
  setAutoAllColumn: vi.fn(),
} as unknown as PivotEngine<Record<string, unknown>>;

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

  async text(): Promise<string> {
    return Promise.resolve(this.content);
  }
}

// Mock the global FileReader API
type FileReaderLike = {
  result?: string;
  onload?: (() => void) | null;
  onerror?: (() => void) | null;
  onprogress?: ((ev: ProgressEvent<FileReader>) => void) | null;
  readAsText: (file: MockFile) => void;
};

const mockFileReader: FileReaderLike = {
  onload: vi.fn(),
  onerror: vi.fn(),
  onprogress: vi.fn(),
  readAsText: vi.fn().mockImplementation(function (
    this: FileReaderLike,
    file: MockFile
  ) {
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
interface NotificationCtorMock {
  (title: string, options?: NotificationOptions): void;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
}

const NotificationMock: NotificationCtorMock = Object.assign(vi.fn(), {
  permission: 'granted' as NotificationPermission,
  requestPermission: vi
    .fn()
    .mockResolvedValue('granted' as NotificationPermission),
});
vi.stubGlobal(
  'Notification',
  NotificationMock as unknown as typeof Notification
);

describe('ConnectService', () => {
  beforeEach(() => {
    openFilePickerMock.mockResolvedValue(null);

    // Suppress console messages during tests
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connectToLocalCSV', () => {
    it('should return success: false when no file is selected', async () => {
      openFilePickerMock.mockResolvedValue(null);
      const result = await ConnectService.connectToLocalCSV(mockPivotEngine);
      expect(result).toEqual({ success: false, error: 'No file selected' });
    });

    it('should handle file processing errors gracefully', async () => {
      openFilePickerMock.mockRejectedValue(new Error('File system error'));
      const result = await ConnectService.connectToLocalCSV(mockPivotEngine);
      expect(result).toEqual({
        success: false,
        error: 'File system error',
      });
    });
  });

  describe('connectToLocalJSON', () => {
    it('should return success: false when no file is selected', async () => {
      openFilePickerMock.mockResolvedValue(null);
      const result = await ConnectService.connectToLocalJSON(mockPivotEngine);
      expect(result).toEqual({ success: false, error: 'No file selected' });
    });

    it('should handle invalid JSON format', async () => {
      const invalidJsonContent = '[{"product": "Laptop"'; // Missing closing brackets
      const file = new MockFile(invalidJsonContent, 'bad.json');
      openFilePickerMock.mockResolvedValue(file);

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
      openFilePickerMock.mockResolvedValue(file);
      const result = await ConnectService.connectToLocalFile(mockPivotEngine);
      expect(result.success).toBe(true);
      expect(result.fileName).toBe('data.csv');
    });

    it('should delegate to processJSONFile for .json files', async () => {
      const file = new MockFile('[{"a":1}]', 'data.json');
      openFilePickerMock.mockResolvedValue(file);
      const result = await ConnectService.connectToLocalFile(mockPivotEngine);
      expect(result.success).toBe(true);
      expect(result.fileName).toBe('data.json');
    });

    it('should return an error for unsupported file types', async () => {
      const file = new MockFile('<xml></xml>', 'data.xml');
      openFilePickerMock.mockResolvedValue(file);
      const result = await ConnectService.connectToLocalFile(mockPivotEngine);
      expect(result).toEqual({
        success: false,
        error: 'Unsupported file type: .xml',
      });
    });
  });

  describe('JSON Parsing Logic', () => {
    it('should return an error if no array data is found in a JSON object', async () => {
      const jsonContent = '{"status": "ok", "count": 0}';
      const file = new MockFile(jsonContent, 'no-array.json');
      openFilePickerMock.mockResolvedValue(file);

      const result = await ConnectService.connectToLocalJSON(mockPivotEngine);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No array data found in JSON file.');
    });
  });

  describe('validateDataStructure', () => {
    it('should detect duplicate column names', () => {
      const columns = ['id', 'name', 'region', 'id'];
      const data = [{ id: 1, name: 'Test', region: 'NA' }];
      const warnings = validateDataStructure(data as DataRecord[], columns);
      expect(warnings).toContain('Found duplicate column names: id');
    });

    it('should detect inconsistent column counts in the data sample', () => {
      const columns = ['id', 'name'];
      const data = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2', region: 'NA' },
      ];
      const warnings = validateDataStructure(data as DataRecord[], columns);
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

    it('showImportNotification should trigger a notification for a successful import', () => {
      const result: FileConnectionResult = {
        success: true,
        recordCount: 150,
        fileName: 'import.csv',
      };
      ConnectService.showImportNotification(result);
      expect(NotificationMock).toHaveBeenCalledWith('PivotHead Import', {
        body: 'Successfully imported 150 records from import.csv',
      });
    });
  });
});
