import type {
  Dimension,
  Group,
  GroupConfig,
  MeasureConfig,
  AggregationType,
  PivotTableState,
} from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';
import type { PivotDataRecord } from '../../types/types';

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
