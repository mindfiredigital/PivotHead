import type { PivotHeadHost } from './host';

export function dragRow(
  host: PivotHeadHost,
  fromIndex: number,
  toIndex: number
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.dragRow(fromIndex, toIndex);
}

export function dragColumn(
  host: PivotHeadHost,
  fromIndex: number,
  toIndex: number
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  host.engine.dragColumn(fromIndex, toIndex);
}

export function swapRows(
  host: PivotHeadHost,
  fromIndex: number,
  toIndex: number
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  try {
    if (host._showRawData) {
      host.engine.swapRawDataRows(fromIndex, toIndex);
    } else {
      host.engine.swapDataRows(fromIndex, toIndex);
    }
  } catch (error) {
    console.error('Row swap failed:', error);
  }
}

export function swapColumns(
  host: PivotHeadHost,
  fromIndex: number,
  toIndex: number
): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }
  try {
    if (host._showRawData) {
      const headers = host._data.length > 0 ? Object.keys(host._data[0]) : [];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= headers.length ||
        toIndex >= headers.length
      ) {
        console.error(
          `Invalid column indices for raw data swap: ${fromIndex}, ${toIndex}, total: ${headers.length}`
        );
        return;
      }
      if (!host._rawDataColumnOrder || host._rawDataColumnOrder.length === 0) {
        host._rawDataColumnOrder = [...headers];
      }
      const temp = host._rawDataColumnOrder[fromIndex];
      host._rawDataColumnOrder[fromIndex] = host._rawDataColumnOrder[toIndex];
      host._rawDataColumnOrder[toIndex] = temp;
      host.renderRawTable();
    } else {
      host.engine.swapDataColumns(fromIndex, toIndex);
      const newOrder = host.engine.getOrderedColumnValues();
      if (newOrder) host._processedColumnOrder = [...newOrder];
    }
  } catch (error) {
    console.error('Column swap failed:', error);
  }
}

export function swapRawDataColumns(
  host: PivotHeadHost,
  fromIndex: number,
  toIndex: number
): void {
  if (!host._data || host._data.length === 0) {
    console.error('No raw data available for column swap');
    return;
  }
  const headers = Object.keys(host._data[0]);
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= headers.length ||
    toIndex >= headers.length
  ) {
    console.error(
      `Invalid column indices for raw data swap: ${fromIndex}, ${toIndex}, total: ${headers.length}`
    );
    return;
  }
  if (fromIndex === toIndex) return;
  if (!host._rawDataColumnOrder) host._rawDataColumnOrder = [...headers];
  const temp = host._rawDataColumnOrder[fromIndex];
  host._rawDataColumnOrder[fromIndex] = host._rawDataColumnOrder[toIndex];
  host._rawDataColumnOrder[toIndex] = temp;
  host.renderRawTable();
}

export function setDragAndDropEnabled(
  host: PivotHeadHost,
  enabled: boolean
): void {
  const table = host.shadowRoot?.querySelector('table');
  if (table) {
    if (enabled) {
      host.addDragListeners();
    } else {
      const draggableElements = table.querySelectorAll('[draggable="true"]');
      draggableElements.forEach(element => {
        element.setAttribute('draggable', 'false');
      });
    }
  }
}

export function isDragAndDropEnabled(host: PivotHeadHost): boolean {
  const firstDraggableElement =
    host.shadowRoot?.querySelector('[draggable="true"]');
  return !!firstDraggableElement;
}
