import { PivotEngine } from '@mindfiredigital/pivothead';
import type {
  PivotTableConfig,
  AggregationType,
  AxisConfig,
  MeasureConfig,
} from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';
import type {
  PivotDataRecord,
  PivotOptions,
  EnhancedPivotEngine,
} from '../../types/types';

export function tryInitializeEngine(host: PivotHeadHost): void {
  const hasData = host._data && host._data.length > 0;
  const hasOptions = host._options && Object.keys(host._options).length > 0;
  if (!hasData || !hasOptions) return;

  try {
    const options: PivotOptions = { ...host._options };

    if (
      !options.rows ||
      !Array.isArray(options.rows) ||
      options.rows.length === 0
    ) {
      const firstRowField =
        host._data.length > 0 ? Object.keys(host._data[0])[0] : null;
      if (firstRowField) {
        options.rows = [{ uniqueName: firstRowField, caption: firstRowField }];
      }
    }

    if (
      !options.columns ||
      !Array.isArray(options.columns) ||
      options.columns.length === 0
    ) {
      const keys = host._data.length > 0 ? Object.keys(host._data[0]) : [];
      const colField = keys.length > 1 ? keys[1] : null;
      if (colField) {
        options.columns = [{ uniqueName: colField, caption: colField }];
      }
    }

    if (
      !options.measures ||
      !Array.isArray(options.measures) ||
      options.measures.length === 0
    ) {
      const keys = host._data.length > 0 ? Object.keys(host._data[0]) : [];
      const measureField = keys.find(k => typeof host._data[0][k] === 'number');
      if (measureField) {
        options.measures = [
          {
            uniqueName: measureField,
            caption: `Sum of ${measureField}`,
            aggregation: 'sum' as AggregationType,
          } as MeasureConfig,
        ];
      }
    }

    if (!options.groupConfig && options.rows && options.columns) {
      options.groupConfig = {
        rowFields: options.rows.map((r: AxisConfig) => r.uniqueName),
        columnFields: options.columns.map((c: AxisConfig) => c.uniqueName),
        grouper: (item: PivotDataRecord) => {
          return [
            ...(options.rows?.map((r: AxisConfig) => item[r.uniqueName]) ?? []),
            ...(options.columns?.map((c: AxisConfig) => item[c.uniqueName]) ??
              []),
          ].join('|');
        },
      };
    }

    const config: PivotTableConfig<PivotDataRecord> = {
      data: host._data,
      rawData: host._data,
      dimensions: [],
      defaultAggregation: 'sum' as AggregationType,
      rows: options.rows || [],
      columns: options.columns || [],
      measures: options.measures || [],
      groupConfig: options.groupConfig,
    };

    host.engine = new PivotEngine(
      config
    ) as EnhancedPivotEngine<PivotDataRecord>;

    // Disable core engine pagination; the web component manages pagination itself
    // Use a very large page size so engine never slices the data internally
    host.engine.setPagination({
      currentPage: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
      totalPages: 1,
    });

    host.engine.setDataHandlingMode(host._showRawData ? 'raw' : 'processed');

    if (host._engineUnsubscribe) host._engineUnsubscribe();
    host._engineUnsubscribe = host.engine.subscribe(state => {
      host.handleEngineStateChange(state);
    });

    host._processedColumnOrder = [];

    const currentFilters = host._showRawData
      ? host._rawFilters
      : host._processedFilters;
    if (currentFilters.length > 0) {
      host.engine.applyFilters(currentFilters);
      return;
    }
  } catch (error) {
    console.error('Error initializing PivotEngine:', error);
  }
}
