import type {
  FileConnectionResult,
  ConnectionOptions,
  DataRecord,
} from '../../types/interfaces';

const SUPPORTED_CSV_EXTENSIONS = ['.csv', '.txt'];
const SUPPORTED_JSON_EXTENSIONS = ['.json', '.jsonl'];
const DEFAULT_MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

export { SUPPORTED_CSV_EXTENSIONS, SUPPORTED_JSON_EXTENSIONS };

/**
 * Opens a file picker dialog
 */
export function openFilePicker(extensions: string[]): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = extensions.join(',');
    input.style.display = 'none';

    input.onchange = event => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0] || null;
      document.body.removeChild(input);
      resolve(file);
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Validates file before processing
 */
export function validateFile(
  file: File,
  options: ConnectionOptions
): FileConnectionResult {
  const maxSize = options.maxFileSize || DEFAULT_MAX_FILE_SIZE;

  if (file.size > maxSize) {
    return {
      success: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
    };
  }

  const extension = getFileExtension(file.name);
  const allSupportedExtensions = [
    ...SUPPORTED_CSV_EXTENSIONS,
    ...SUPPORTED_JSON_EXTENSIONS,
  ];

  if (!allSupportedExtensions.includes(extension)) {
    return {
      success: false,
      error: `Unsupported file type: ${extension}. Supported types: ${allSupportedExtensions.join(', ')}`,
    };
  }

  return { success: true };
}

/**
 * Reads file as text with optional progress callback
 */
export function readFileAsText(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    if (onProgress) {
      reader.onprogress = event => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };
    }

    reader.readAsText(file);
  });
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Formats file size for human reading
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates data structure and returns warnings
 */
export function validateDataStructure(
  data: DataRecord[],
  columns: string[]
): string[] {
  const warnings: string[] = [];

  if (columns.length === 0) {
    warnings.push('No columns detected in data');
    return warnings;
  }

  // Check for empty column names
  const emptyColumns = columns.filter(col => !col || col.trim() === '');
  if (emptyColumns.length > 0) {
    warnings.push(`Found ${emptyColumns.length} columns with empty names`);
  }

  // Check for duplicate column names
  const duplicates = columns.filter(
    (col, index) => columns.indexOf(col) !== index
  );
  if (duplicates.length > 0) {
    warnings.push(
      `Found duplicate column names: ${[...new Set(duplicates)].join(', ')}`
    );
  }

  // Check data consistency (sample first 100 rows)
  const sampleSize = Math.min(100, data.length);
  const inconsistentRows = [] as number[];

  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];
    const rowKeys = Object.keys(row);

    if (rowKeys.length !== columns.length) {
      inconsistentRows.push(i + 1);
    }
  }

  if (inconsistentRows.length > 0) {
    warnings.push(
      `Found ${inconsistentRows.length} rows with inconsistent column count in sample`
    );
  }

  return warnings;
}

/**
 * Extracts array from nested JSON using dot notation path
 */
export function extractArrayFromPath(obj: unknown, path: string): DataRecord[] {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current &&
      typeof current === 'object' &&
      current !== null &&
      key in current
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return [];
    }
  }

  return Array.isArray(current) ? (current as DataRecord[]) : [];
}
