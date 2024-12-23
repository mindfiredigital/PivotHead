import {
  AggregationType,
  AxisConfig,
  Column,
  Dimension,
  ExpandedState,
  FormatOptions,
  Group,
  GroupConfig,
  Measure,
  MeasureConfig,
  PivotTableConfig,
  PivotTableState,
  ProcessedData,
  RowSize,
  SortConfig,
} from '../types/interfaces';
import { calculateAggregates } from './aggregator';
import { processData } from './dataProcessor';

export class PivotEngine<T extends Record<string, any>> {
  private config: PivotTableConfig<T>;
  private state: PivotTableState<T>;

  constructor(config: PivotTableConfig<T>) {
    this.config = {
      ...config,
      defaultAggregation: config.defaultAggregation || 'sum',
      isResponsive: config.isResponsive ?? true,
    };
    // Initialize state
    this.state = {
      data: config.data || [],
      processedData: { headers: [], rows: [], totals: {} },
      rows: config.rows || [],
      columns: config.columns || [],
      measures: config.measures || [],
      sortConfig: null,
      rowSizes: this.initializeRowSizes(config.data || []),
      expandedRows: {},
      groupConfig: config.groupConfig || null,
      groups: [],
      selectedMeasures: config.measures || [],
      selectedDimensions: config.dimensions || [],
      selectedAggregation: this.config.defaultAggregation,
      formatting: config.formatting || {},
      columnWidths: {},
      isResponsive: this.config.isResponsive ?? true,
      rowGroups: [],
      columnGroups: [],
    };

    // Process data after state initialization
    this.state.processedData = this.processData(this.state.data);

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  private initializeRowSizes(data: T[]): RowSize[] {
    return data.map((_, index) => ({ index, height: 40 }));
  }

  private processData(data: T[]): ProcessedData {
    return {
      headers: this.generateHeaders(),
      rows: this.generateRows(data),
      totals: this.calculateTotals(data),
    };
  }

  private generateHeaders(): string[] {
    const rowHeaders = this.state.rows
      ? this.state.rows.map((r) => r.caption || r.uniqueName)
      : [];
    const columnHeaders = this.state.columns
      ? this.state.columns.map((c) => c.caption || c.uniqueName)
      : [];
    return [...rowHeaders, ...columnHeaders];
  }

  private generateRows(data: T[]): any[][] {
    if (!data || !this.state.rows || !this.state.columns) {
      return [];
    }
    return data.map((item) => [
      ...this.state.rows.map((r) => item[r.uniqueName]),
      ...this.state.columns.map((c) => item[c.uniqueName]),
    ]);
  }

  private calculateTotals(data: T[]): Record<string, number> {
    const totals: Record<string, number> = {};
    if (!data || !this.state.measures) {
      return totals;
    }
    this.state.measures.forEach((measure) => {
      totals[measure.uniqueName] = data.reduce(
        (sum, item) => sum + (Number(item[measure.uniqueName]) || 0),
        0,
      );
    });
    return totals;
  }

  public setMeasures(measureFields: MeasureConfig[]) {
    this.state.selectedMeasures = measureFields;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  public setDimensions(dimensionFields: Dimension[]) {
    this.state.selectedDimensions = dimensionFields;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  public setAggregation(type: AggregationType) {
    this.state.selectedAggregation = type;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
    this.updateAggregates();
  }

  public formatValue(value: any, field: string): string {
    const format = this.state.formatting[field];
    if (!format) return String(value);

    try {
      switch (format.type) {
        case 'currency':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'currency',
            currency: format.currency || 'USD',
          }).format(value);
        case 'number':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            minimumFractionDigits: format.decimals || 0,
            maximumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'percentage':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'percent',
            minimumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'date':
          return new Date(value).toLocaleDateString(format.locale || 'en-US', {
            dateStyle: 'medium',
          });
        default:
          return String(value);
      }
    } catch (error) {
      console.error(`Error formatting value for field ${field}:`, error);
      return String(value);
    }
  }

  public sort(field: string, direction: 'asc' | 'desc') {
    this.state.sortConfig = { field, direction };
    const { data, groups } = processData(
      this.config,
      this.state.sortConfig,
      this.state.groupConfig,
    );
    this.state.data = data;
    this.state.groups = groups;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  private updateAggregates() {
    const updateGroupAggregates = (group: Group) => {
      this.state.measures.forEach((measure) => {
        const aggregateKey = `${this.state.selectedAggregation}_${measure.uniqueName}`;
        if (measure.formula && typeof measure.formula === 'function') {
          // Handle custom measures
          const formulaResults = group.items.map((item) =>
            measure.formula?.(item),
          );
          group.aggregates[aggregateKey] = calculateAggregates(
            formulaResults.map((value) => ({ value })),
            'value' as keyof { value: number },
            this.state.selectedAggregation,
          );
        } else if (measure.uniqueName === 'averageSale') {
          // Special handling for averageSale
          const totalSales = calculateAggregates(
            group.items,
            'sales' as keyof T,
            'sum',
          );
          const totalQuantity = calculateAggregates(
            group.items,
            'quantity' as keyof T,
            'sum',
          );
          group.aggregates[aggregateKey] =
            totalQuantity !== 0 ? totalSales / totalQuantity : 0;
        } else {
          group.aggregates[aggregateKey] = calculateAggregates(
            group.items,
            measure.uniqueName as keyof T,
            this.state.selectedAggregation as AggregationType,
          );
        }
      });

      if (group.subgroups) {
        group.subgroups.forEach(updateGroupAggregates);
      }
    };

    this.state.groups.forEach(updateGroupAggregates);
  }

  private applyGrouping() {
    if (!this.state.groupConfig) return;

    const { rowFields, columnFields, grouper } = this.state.groupConfig;

    if (!rowFields || !columnFields || !grouper) {
      console.error('Invalid groupConfig:', this.state.groupConfig);
      return;
    }

    const { data, groups } = processData(
      this.config,
      this.state.sortConfig,
      this.state.groupConfig,
    );

    this.state.data = data;
    this.state.groups = groups;
    this.updateAggregates();
    this.state.processedData = this.processData(this.state.data);
  }

  private createGroups(
    data: T[],
    fields: string[],
    grouper: (item: T, fields: string[]) => string,
  ): Group[] {
    if (!fields || fields.length === 0) {
      return [
        {
          key: 'All',
          items: data,
          aggregates: {},
        },
      ];
    }

    const groups: { [key: string]: Group } = {};

    data.forEach((item) => {
      const key = grouper(item, fields);
      if (!groups[key]) {
        groups[key] = { key, items: [], subgroups: [], aggregates: {} };
      }
      groups[key].items.push(item);
    });

    if (fields.length > 1) {
      Object.values(groups).forEach((group) => {
        group.subgroups = this.createGroups(
          group.items,
          fields.slice(1),
          grouper,
        );
      });
    }

    // Calculate aggregates for each group
    Object.values(groups).forEach((group) => {
      this.state.measures.forEach((measure) => {
        const aggregateKey = `${this.state.selectedAggregation}_${measure.uniqueName}`;
        group.aggregates[aggregateKey] = calculateAggregates(
          group.items,
          measure.uniqueName as keyof T,
          this.state.selectedAggregation as AggregationType,
        );
      });
    });

    return Object.values(groups);
  }

  public setGroupConfig(groupConfig: GroupConfig | null) {
    this.state.groupConfig = groupConfig;
    if (groupConfig) {
      this.applyGrouping();
    } else {
      this.state.groups = [];
      this.state.processedData = this.processData(this.state.data);
    }
  }

  public getGroupedData(): Group[] {
    return this.state.groups;
  }

  public getState(): PivotTableState<T> {
    return { ...this.state };
  }

  public reset() {
    this.state = {
      ...this.state,
      data: this.config.data || [],
      processedData: this.processData(this.config.data || []),
      sortConfig: null,
      rowSizes: this.initializeRowSizes(this.config.data || []),
      expandedRows: {},
      groupConfig: this.config.groupConfig || null,
      groups: [],
    };

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  public resizeRow(index: number, height: number) {
    const rowIndex = this.state.rowSizes.findIndex(
      (row) => row.index === index,
    );
    if (rowIndex !== -1) {
      this.state.rowSizes[rowIndex].height = Math.max(20, height);
    }
  }

  public toggleRowExpansion(rowId: string) {
    this.state.expandedRows[rowId] = !this.state.expandedRows[rowId];
  }

  public isRowExpanded(rowId: string): boolean {
    return !!this.state.expandedRows[rowId];
  }

  public dragRow(fromIndex: number, toIndex: number) {
    const newData = [...this.state.data];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);
    this.state.data = newData;
    this.state.rowSizes = this.state.rowSizes.map((size, index) => ({
      ...size,
      index:
        index < fromIndex || index > toIndex
          ? index
          : index < toIndex
          ? index + 1
          : index - 1,
    }));
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  public dragColumn(fromIndex: number, toIndex: number) {
    const newColumns = [...this.state.columns];
    const [removed] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, removed);
    this.state.columns = newColumns;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }
}
