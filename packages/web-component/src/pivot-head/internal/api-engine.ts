import type {
  Dimension,
  Group,
  GroupConfig,
  MeasureConfig,
  AggregationType,
  PivotTableState,
} from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';
import type { PivotDataRecord, FormatOptions } from '../../types/types';

import {
  FieldService,
  FieldInfo,
  LayoutSelection,
} from '@mindfiredigital/pivothead';

export function getState(
  host: PivotHeadHost
): PivotTableState<PivotDataRecord> {
  if (!host.engine) {
    throw new Error('Engine not initialized');
  }
  return host.engine.getState();
}

export function sort(
  host: PivotHeadHost,
  field: string,
  direction: 'asc' | 'desc'
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.sort(field, direction);
}

export function setMeasures(
  host: PivotHeadHost,
  measures: MeasureConfig[]
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.setMeasures(measures);
}

export function setDimensions(
  host: PivotHeadHost,
  dimensions: Dimension[]
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.setDimensions(dimensions);
}

export function setGroupConfig(
  host: PivotHeadHost,
  groupConfig: GroupConfig | null
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.setGroupConfig(groupConfig);
}

export function setAggregation(
  host: PivotHeadHost,
  type: AggregationType
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.setAggregation(type);
}

export function formatValue(
  host: PivotHeadHost,
  value: unknown,
  field: string
): string {
  if (!host.engine) {
    console.error('Engine not initialized');
    return String(value);
  }
  return host.engine.formatValue(value, field);
}

export function getGroupedData(host: PivotHeadHost): Group[] {
  if (!host.engine) {
    console.error('Engine not initialized');
    return [];
  }
  return host.engine.getGroupedData();
}

export function getData(host: PivotHeadHost): PivotDataRecord[] {
  if (!host.engine) {
    console.error('Engine not initialized');
    return [];
  }
  return host.engine.getState().rawData;
}

export function getProcessedData(host: PivotHeadHost): unknown {
  if (!host.engine) {
    console.error('Engine not initialized');
    return null;
  }
  return host.engine.getState().processedData;
}

export function updateFieldFormatting(
  host: PivotHeadHost,
  field: string,
  format: FormatOptions
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.updateFieldFormatting(field, format);
}

export function getAvailableFields(host: PivotHeadHost): FieldInfo[] {
  return FieldService.getAvailableFields(host.engine as any);
}

export function getSupportedAggregations(): AggregationType[] {
  return FieldService.getSupportedAggregations();
}

export function setMeasureAggregation(
  host: PivotHeadHost,
  field: string,
  aggregation: AggregationType
): void {
  FieldService.setMeasureAggregation(host.engine as any, field, aggregation);
}

export function buildLayout(
  host: PivotHeadHost,
  selection: LayoutSelection
): void {
  const layout = FieldService.buildLayout(selection);
  host._options.rows = layout.rows;
  host._options.columns = layout.columns;
  host._options.measures = layout.measures;
}

export function getFieldAlignment(host: PivotHeadHost, field: string): string {
  if (!host.engine) {
    console.error('Engine not initialized');
    return 'left';
  }
  return host.engine.getFieldAlignment(field);
}
