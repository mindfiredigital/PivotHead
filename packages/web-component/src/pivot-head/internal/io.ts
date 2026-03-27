import type { PivotHeadHost } from './host';
import {
  ConnectService,
  type ConnectionOptions,
  type FileConnectionResult,
} from '@mindfiredigital/pivothead';
import { tryInitializeEngine } from './engine';
import { logger } from '../../logger.js';

// Exporting helpers
export function exportToHTML(
  host: PivotHeadHost,
  fileName = 'pivot-table'
): void {
  if (!host.engine) {
    logger.error('Engine not initialized. Cannot export to HTML.');
    return;
  }
  host.engine.exportToHTML(fileName);
}

export function exportToPDF(
  host: PivotHeadHost,
  fileName = 'pivot-table'
): void {
  if (!host.engine) {
    logger.error('Engine not initialized. Cannot export to PDF.');
    return;
  }
  host.engine.exportToPDF(fileName);
}

export function exportToExcel(
  host: PivotHeadHost,
  fileName = 'pivot-table'
): void {
  if (!host.engine) {
    logger.error('Engine not initialized. Cannot export to Excel.');
    return;
  }
  host.engine.exportToExcel(fileName);
}

export function openPrintDialog(host: PivotHeadHost): void {
  if (!host.engine) {
    logger.error('Engine not initialized. Cannot open print dialog.');
    return;
  }
  host.engine.openPrintDialog();
}

// File I/O helpers
export function loadFromFile(host: PivotHeadHost, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          host.data = data;
          resolve();
        } else {
          reject(new Error('Failed to read file as text'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function loadFromUrl(host: PivotHeadHost, url: string): Promise<void> {
  // Validate URL — only allow http(s) to prevent file://, javascript:, data: schemes
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url, window.location.origin);
  } catch {
    return Promise.reject(new Error(`Invalid URL: ${url}`));
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return Promise.reject(
      new Error(
        `Unsupported URL protocol: ${parsedUrl.protocol}. Only http and https are allowed.`
      )
    );
  }

  return fetch(parsedUrl.href)
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data from ${url}: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error('Expected JSON array from URL');
      }
      host.data = data;
    });
}

// ConnectService-based file upload methods
export async function connectToLocalCSV(
  host: PivotHeadHost,
  options: ConnectionOptions = {}
): Promise<FileConnectionResult> {
  // If engine doesn't exist, create a minimal/placeholder engine
  // ConnectService will replace its data and layout when the CSV is loaded
  if (!host.engine) {
    logger.info(
      '📦 No engine found. Creating placeholder engine for file import...'
    );
    // Create minimal placeholder data to satisfy engine initialization requirements
    host._data = [{ placeholder: 'loading' }];
    host._options = {
      rows: ['placeholder'],
      columns: [],
      measures: [],
    };
    tryInitializeEngine(host);

    // If engine still doesn't exist after initialization, return error
    if (!host.engine) {
      logger.error('Failed to create placeholder engine for CSV import.');
      return { success: false, error: 'Failed to initialize engine' };
    }
  }

  const result = await ConnectService.connectToLocalCSV(
    host.engine as any,
    options
  );

  if (result.success) {
    // ConnectService already updated the engine's data source and layout
    // We need to update the host's internal data references without triggering tryInitializeEngine
    if (result.data) {
      host._data = result.data;
      host._originalData = [...result.data];
    }

    // CRITICAL: Clear the cached column/row order from previous data
    // Otherwise the render will try to use old column names that don't exist in the new data
    host._processedColumnOrder = [];
    host._rawDataColumnOrder = [];

    // Extract the layout configuration from the engine and update host._options
    const state = host.engine.getState();
    logger.info('🔍 CSV Upload - Engine state:', {
      hasProcessedData: !!state?.processedData,
      hasRows: !!state?.rows?.length,
      hasColumns: !!state?.columns?.length,
      hasMeasures: !!state?.measures?.length,
      rows: state?.rows,
      columns: state?.columns,
      measures: state?.measures,
    });

    if (state) {
      // Create a NEW groupConfig for the uploaded data
      // The old groupConfig's grouper function won't work with new field names
      const newGroupConfig =
        state.rows && state.columns
          ? {
              rowFields: state.rows.map((r: any) => r.uniqueName),
              columnFields: state.columns.map((c: any) => c.uniqueName),
              grouper: (item: any) => {
                return [
                  ...(state.rows?.map((r: any) => item[r.uniqueName]) ?? []),
                  ...(state.columns?.map((c: any) => item[c.uniqueName]) ?? []),
                ].join('|');
              },
            }
          : undefined;

      // Update options with the layout that was generated by ConnectService
      host._options = {
        rows: state.rows || [],
        columns: state.columns || [],
        measures: state.measures || [],
        groupConfig: newGroupConfig,
      };
      logger.info('🔍 CSV Upload - Updated options with NEW groupConfig:', {
        rows: host._options.rows,
        columns: host._options.columns,
        measures: host._options.measures,
        firstRow: host._options.rows?.[0],
        firstColumn: host._options.columns?.[0],
        firstMeasure: host._options.measures?.[0],
      });

      // CRITICAL: Update the engine's groupConfig with the new one
      if (newGroupConfig) {
        host.engine.setGroupConfig(newGroupConfig as any);
      }
    }

    // Use setTimeout to ensure the render happens after the current call stack completes
    // This allows the engine's subscription to fire first, then we trigger another render
    // with the updated host._options
    setTimeout(() => {
      logger.info('🔍 CSV Upload - Triggering render with updated options');
      host.handleEngineStateChange(state);
    }, 0);
  }

  return result;
}

export async function connectToLocalJSON(
  host: PivotHeadHost,
  options: ConnectionOptions = {}
): Promise<FileConnectionResult> {
  // If engine doesn't exist, create a minimal/placeholder engine
  // ConnectService will replace its data and layout when the JSON is loaded
  if (!host.engine) {
    logger.info(
      '📦 No engine found. Creating placeholder engine for file import...'
    );
    // Create minimal placeholder data to satisfy engine initialization requirements
    host._data = [{ placeholder: 'loading' }];
    host._options = {
      rows: ['placeholder'],
      columns: [],
      measures: [],
    };
    tryInitializeEngine(host);

    // If engine still doesn't exist after initialization, return error
    if (!host.engine) {
      logger.error('Failed to create placeholder engine for JSON import.');
      return { success: false, error: 'Failed to initialize engine' };
    }
  }

  const result = await ConnectService.connectToLocalJSON(
    host.engine as any,
    options
  );

  if (result.success) {
    // ConnectService already updated the engine's data source and layout
    // We need to update the host's internal data references without triggering tryInitializeEngine
    if (result.data) {
      host._data = result.data;
      host._originalData = [...result.data];
    }

    // CRITICAL: Clear the cached column/row order from previous data
    // Otherwise the render will try to use old column names that don't exist in the new data
    host._processedColumnOrder = [];
    host._rawDataColumnOrder = [];

    // Extract the layout configuration from the engine and update host._options
    const state = host.engine.getState();
    logger.info('🔍 File Upload - Engine state:', {
      hasProcessedData: !!state?.processedData,
      hasRows: !!state?.rows?.length,
      hasColumns: !!state?.columns?.length,
      hasMeasures: !!state?.measures?.length,
      rows: state?.rows,
      columns: state?.columns,
      measures: state?.measures,
    });

    if (state) {
      // Create a NEW groupConfig for the uploaded data
      // The old groupConfig's grouper function won't work with new field names
      const newGroupConfig =
        state.rows && state.columns
          ? {
              rowFields: state.rows.map((r: any) => r.uniqueName),
              columnFields: state.columns.map((c: any) => c.uniqueName),
              grouper: (item: any) => {
                return [
                  ...(state.rows?.map((r: any) => item[r.uniqueName]) ?? []),
                  ...(state.columns?.map((c: any) => item[c.uniqueName]) ?? []),
                ].join('|');
              },
            }
          : undefined;

      // Update options with the layout that was generated by ConnectService
      host._options = {
        rows: state.rows || [],
        columns: state.columns || [],
        measures: state.measures || [],
        groupConfig: newGroupConfig,
      };
      logger.info('🔍 File Upload - Updated options:', {
        rows: host._options.rows,
        columns: host._options.columns,
        measures: host._options.measures,
        firstRow: host._options.rows?.[0],
        firstColumn: host._options.columns?.[0],
        firstMeasure: host._options.measures?.[0],
      });

      // CRITICAL: Update the engine's groupConfig with the new one
      if (newGroupConfig) {
        host.engine.setGroupConfig(newGroupConfig as any);
      }
    }

    // Use setTimeout to ensure the render happens after the current call stack completes
    // This allows the engine's subscription to fire first, then we trigger another render
    // with the updated host._options
    setTimeout(() => {
      logger.info('🔍 File Upload - Triggering render with updated options');
      host.handleEngineStateChange(state);
    }, 0);
  }

  return result;
}

export async function connectToLocalFile(
  host: PivotHeadHost,
  options: ConnectionOptions = {}
): Promise<FileConnectionResult> {
  // If engine doesn't exist, create a minimal/placeholder engine
  // ConnectService will replace its data and layout when the file is loaded
  if (!host.engine) {
    logger.info(
      '📦 No engine found. Creating placeholder engine for file import...'
    );
    // Create minimal placeholder data to satisfy engine initialization requirements
    host._data = [{ placeholder: 'loading' }];
    host._options = {
      rows: ['placeholder'],
      columns: [],
      measures: [],
    };
    tryInitializeEngine(host);

    // If engine still doesn't exist after initialization, return error
    if (!host.engine) {
      logger.error('Failed to create placeholder engine for file import.');
      return { success: false, error: 'Failed to initialize engine' };
    }
  }

  const result = await ConnectService.connectToLocalFile(
    host.engine as any,
    options
  );

  if (result.success) {
    // ConnectService already updated the engine's data source and layout
    // We need to update the host's internal data references without triggering tryInitializeEngine
    if (result.data) {
      host._data = result.data;
      host._originalData = [...result.data];
    }

    // CRITICAL: Clear the cached column/row order from previous data
    // Otherwise the render will try to use old column names that don't exist in the new data
    host._processedColumnOrder = [];
    host._rawDataColumnOrder = [];

    // Extract the layout configuration from the engine and update host._options
    const state = host.engine.getState();
    logger.info('🔍 File Upload - Engine state:', {
      hasProcessedData: !!state?.processedData,
      hasRows: !!state?.rows?.length,
      hasColumns: !!state?.columns?.length,
      hasMeasures: !!state?.measures?.length,
      rows: state?.rows,
      columns: state?.columns,
      measures: state?.measures,
    });

    if (state) {
      // Create a NEW groupConfig for the uploaded data
      // The old groupConfig's grouper function won't work with new field names
      const newGroupConfig =
        state.rows && state.columns
          ? {
              rowFields: state.rows.map((r: any) => r.uniqueName),
              columnFields: state.columns.map((c: any) => c.uniqueName),
              grouper: (item: any) => {
                return [
                  ...(state.rows?.map((r: any) => item[r.uniqueName]) ?? []),
                  ...(state.columns?.map((c: any) => item[c.uniqueName]) ?? []),
                ].join('|');
              },
            }
          : undefined;

      // Update options with the layout that was generated by ConnectService
      host._options = {
        rows: state.rows || [],
        columns: state.columns || [],
        measures: state.measures || [],
        groupConfig: newGroupConfig,
      };
      logger.info('🔍 File Upload - Updated options:', {
        rows: host._options.rows,
        columns: host._options.columns,
        measures: host._options.measures,
        firstRow: host._options.rows?.[0],
        firstColumn: host._options.columns?.[0],
        firstMeasure: host._options.measures?.[0],
      });

      // CRITICAL: Update the engine's groupConfig with the new one
      if (newGroupConfig) {
        host.engine.setGroupConfig(newGroupConfig as any);
      }
    }

    // Use setTimeout to ensure the render happens after the current call stack completes
    // This allows the engine's subscription to fire first, then we trigger another render
    // with the updated host._options
    setTimeout(() => {
      logger.info('🔍 File Upload - Triggering render with updated options');
      host.handleEngineStateChange(state);
    }, 0);
  }

  return result;
}
