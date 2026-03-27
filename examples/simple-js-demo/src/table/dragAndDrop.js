'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';

// NOTE: renderTable and renderRawDataTable are resolved at call time via
// appState callbacks to avoid circular-import issues.

export function setupRawDataDragAndDrop(rawData) {
  logger.info('Setting up drag and drop with', rawData.length, 'items');

  // Note: For large datasets (> 1000 rows), virtual scrolling handles drag/drop
  // This function only sets up drag/drop for traditional rendering (< 1000 rows)

  // Column drag and drop for raw data
  const headers = document.querySelectorAll(
    '.raw-data-header[draggable="true"]'
  );
  let draggedColumnIndex = null;

  headers.forEach(header => {
    const columnIndex = parseInt(header.dataset.columnIndex);
    const columnName = header.dataset.columnName;

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = columnIndex;
      e.dataTransfer.setData('text/plain', columnName);
      setTimeout(() => header.classList.add('dragging'), 0);
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
      draggedColumnIndex = null;
    });

    header.addEventListener('dragover', e => e.preventDefault());
    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnIndex !== null && draggedColumnIndex !== columnIndex) {
        header.classList.add('drag-over');
      }
    });
    header.addEventListener('dragleave', () =>
      header.classList.remove('drag-over')
    );
    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetColumnIndex = columnIndex;

      if (
        draggedColumnIndex !== null &&
        draggedColumnIndex !== targetColumnIndex
      ) {
        // Import lazily to avoid circular deps — resolved at runtime
        import('./renderRaw.js').then(m => {
          m.swapRawDataColumns(draggedColumnIndex, targetColumnIndex);
          m.renderRawDataTable();
        });
      }
    });
  });

  // Row drag and drop for raw data
  const rows = document.querySelectorAll('.raw-data-row[draggable="true"]');
  let draggedRowIndex = null;

  rows.forEach(row => {
    const rowIndex = parseInt(row.dataset.rowIndex);
    const globalIndex = parseInt(row.dataset.globalIndex);

    row.addEventListener('dragstart', e => {
      draggedRowIndex = globalIndex;
      e.dataTransfer.setData('text/plain', rowIndex.toString());
      setTimeout(() => row.classList.add('dragging'), 0);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      draggedRowIndex = null;
    });

    row.addEventListener('dragover', e => e.preventDefault());
    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRowIndex !== null && draggedRowIndex !== globalIndex) {
        row.classList.add('drag-over');
      }
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');

      const targetRowIndex = globalIndex;

      if (draggedRowIndex !== null && draggedRowIndex !== targetRowIndex) {
        import('./renderRaw.js').then(m => {
          m.swapRawDataRows(draggedRowIndex, targetRowIndex, rawData);
          m.renderRawDataTable();
        });
      }
    });
  });
}

export function setupColumnDragAndDropFixed(columnFieldName) {
  const columnHeaders = document.querySelectorAll(
    '.column-header[draggable="true"]'
  );
  let draggedColumnValue = null;
  let draggedColumnIndex = null;

  if (!appState.pivotEngine) {
    logger.error('PivotEngine not initialized for column drag and drop');
    return;
  }

  logger.info('Setting up column drag and drop for field:', columnFieldName);

  columnHeaders.forEach(header => {
    const fieldValue = header.dataset.fieldValue;
    const columnIndex = parseInt(header.dataset.columnIndex);

    logger.info(
      'Setting up drag for column:',
      fieldValue,
      'at index:',
      columnIndex
    );

    header.addEventListener('dragstart', e => {
      draggedColumnValue = fieldValue;
      draggedColumnIndex = columnIndex;
      e.dataTransfer.setData('text/plain', fieldValue);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => header.classList.add('dragging'), 0);
      logger.info(
        'Drag started for column:',
        fieldValue,
        'index:',
        columnIndex
      );
    });

    header.addEventListener('dragend', e => {
      header.classList.remove('dragging');
      logger.info('Drag ended for column:', fieldValue);
      draggedColumnValue = null;
      draggedColumnIndex = null;
    });

    header.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnValue && draggedColumnValue !== fieldValue) {
        header.classList.add('drag-over');
      }
    });

    header.addEventListener('dragleave', e => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetColumnValue = fieldValue;
      const targetColumnIndex = columnIndex;

      logger.info('Drop event:', {
        draggedValue: draggedColumnValue,
        draggedIndex: draggedColumnIndex,
        targetValue: targetColumnValue,
        targetIndex: targetColumnIndex,
      });

      if (
        draggedColumnValue &&
        draggedColumnIndex !== null &&
        draggedColumnValue !== targetColumnValue &&
        draggedColumnIndex !== targetColumnIndex
      ) {
        logger.info(
          'Executing column swap:',
          draggedColumnIndex,
          '->',
          targetColumnIndex
        );

        try {
          // Use the PivotEngine's swapDataColumns method
          const result = appState.pivotEngine.swapDataColumns(
            draggedColumnIndex,
            targetColumnIndex
          );
          logger.info('Column swap result:', result);

          // Force a re-render after the swap
          setTimeout(() => {
            logger.info('Re-rendering after column swap');
            import('./renderProcessed.js').then(m => m.renderTable());
          }, 50);
        } catch (error) {
          logger.error('Error during column swap:', error);
          // Fallback: manual re-render
          import('./renderProcessed.js').then(m => m.renderTable());
        }
      }
    });
  });

  logger.info(
    'Column drag and drop setup completed for',
    columnHeaders.length,
    'headers'
  );
}

export function setupRowDragAndDrop(rowFieldName) {
  try {
    logger.info('Setting up row drag and drop for field:', rowFieldName);

    // Prefer attaching drag to the first cell for broader browser support with table rows
    const rowCells = document.querySelectorAll(
      'tbody td.row-cell[draggable="true"]'
    );

    logger.info('Found', rowCells.length, 'draggable row cells');

    let draggedRowValue = null;

    if (!appState.pivotEngine) {
      logger.error('PivotEngine not available for row drag setup');
      return;
    }

    const uniqueRowValues = appState.pivotEngine.getOrderedUniqueFieldValues(
      rowFieldName,
      true
    );

    logger.info('Unique row values for drag:', uniqueRowValues?.length || 0);

    if (!uniqueRowValues || uniqueRowValues.length === 0) {
      logger.warn('No unique row values available for drag and drop');
      return;
    }

    rowCells.forEach(cell => {
      const fieldValue = cell.dataset.fieldValue;
      const row = cell.parentElement;

      cell.addEventListener('dragstart', e => {
        draggedRowValue = fieldValue;
        try {
          e.dataTransfer.setData('text/plain', fieldValue);
        } catch {}
        setTimeout(() => row && row.classList.add('dragging'), 0);
      });

      cell.addEventListener('dragend', () => {
        if (row) row.classList.remove('dragging');
        draggedRowValue = null;
      });

      cell.addEventListener('dragover', e => e.preventDefault());
      cell.addEventListener('dragenter', e => {
        e.preventDefault();
        if (draggedRowValue && draggedRowValue !== fieldValue && row) {
          row.classList.add('drag-over');
        }
      });
      cell.addEventListener(
        'dragleave',
        () => row && row.classList.remove('drag-over')
      );
      cell.addEventListener('drop', e => {
        e.preventDefault();
        if (row) row.classList.remove('drag-over');

        const targetRowValue = fieldValue;
        const fromIndex = uniqueRowValues.indexOf(draggedRowValue);
        const toIndex = uniqueRowValues.indexOf(targetRowValue);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          try {
            logger.info('Attempting to swap rows in processed mode:', {
              draggedValue: draggedRowValue,
              targetValue: fieldValue,
              fromIndex,
              toIndex,
            });
            appState.pivotEngine.swapDataRows(fromIndex, toIndex);
            logger.info('Row swap completed, re-rendering table');
            // Force re-render to reflect new order
            setTimeout(() => {
              import('./renderProcessed.js').then(m => m.renderTable());
            }, 0);
          } catch (error) {
            logger.error('Error during row swap in processed mode:', error);
            alert(
              'Error reordering data. Please refresh the page and try again.\n\nError: ' +
                error.message
            );
          }
        }
      });
    });

    logger.info('Row drag and drop setup completed');
  } catch (error) {
    logger.error('Error setting up row drag and drop:', error);
  }
}

// Orchestrator — sets up all drag-and-drop for processed mode
export function setupDragAndDrop() {
  try {
    logger.info('Starting drag and drop setup...');

    if (!appState.pivotEngine) {
      logger.error('Cannot setup drag and drop: pivotEngine not initialized');
      return;
    }

    const rowFieldName = appState.pivotEngine.getRowFieldName();
    const columnFieldName = appState.pivotEngine.getColumnFieldName();

    logger.info('Field names:', { rowFieldName, columnFieldName });

    if (rowFieldName) {
      setupRowDragAndDrop(rowFieldName);
    } else {
      logger.warn('No row field name available, skipping row drag setup');
    }

    if (columnFieldName && columnFieldName !== '__all__') {
      setupColumnDragAndDropFixed(columnFieldName);
    } else {
      logger.info(
        'Skipping column drag setup (no column field or synthetic __all__ column)'
      );
    }

    logger.info('Drag and drop setup completed');
  } catch (error) {
    logger.error('Error in setupDragAndDrop:', error);
  }
}
