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
      // For processed data, we need to swap in our local column order array
      // Get current column order or create it from engine
      const currentOrder =
        host._processedColumnOrder.length > 0
          ? [...host._processedColumnOrder]
          : host.engine.getOrderedColumnValues() || [];

      if (currentOrder.length === 0) {
        console.error('No column order available for swap');
        return;
      }

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentOrder.length ||
        toIndex >= currentOrder.length
      ) {
        console.error(
          `Invalid column indices for processed data swap: ${fromIndex}, ${toIndex}, total: ${currentOrder.length}`
        );
        return;
      }

      console.log('🔥 Column Swap: Before swap:', currentOrder);
      console.log(
        '🔥 Column Swap: Swapping indices:',
        fromIndex,
        'and',
        toIndex
      );

      // Perform the actual swap
      const temp = currentOrder[fromIndex];
      currentOrder[fromIndex] = currentOrder[toIndex];
      currentOrder[toIndex] = temp;

      console.log('🔥 Column Swap: After swap:', currentOrder);

      // Update our local order
      host._processedColumnOrder = [...currentOrder];

      // Set the new order directly in the engine state (like the engine does internally)
      const engineState = host.engine.getState();
      const columnField = host._options.columns?.[0];
      if (columnField) {
        // Manual approach: set the custom column order directly
        (engineState as unknown as Record<string, unknown>).customColumnOrder =
          {
            fieldName: columnField.uniqueName,
            order: currentOrder,
          };
      }

      // Force re-render to show the new column order
      host.renderFullUI();
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
