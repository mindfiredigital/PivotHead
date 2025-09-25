import type { FilterConfig } from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';

// Events: bindControls and updatePaginationInfo
export function bindControls(host: PivotHeadHost) {
  const filterField = host.shadowRoot?.getElementById('filterField');
  if (filterField) {
    if (host._showRawData) {
      if (host._data.length > 0) {
        filterField.innerHTML = Object.keys(host._data[0])
          .map(f => `<option value="${f}">${f}</option>`)
          .join('');
      }
    } else {
      let options = '';
      if (host._options.rows) {
        host._options.rows.forEach(row => {
          options += `<option value="${row.uniqueName}">${row.caption}</option>`;
        });
      }
      if (host._options.columns) {
        host._options.columns.forEach(col => {
          options += `<option value="${col.uniqueName}">${col.caption}</option>`;
        });
      }
      if (host._options.measures) {
        host._options.measures.forEach(measure => {
          const aggregatedKey = `${measure.aggregation}_${measure.uniqueName}`;
          options += `<option value="${aggregatedKey}">${measure.caption}</option>`;
        });
      }
      (filterField as HTMLElement).innerHTML = options;
    }
  }

  const filterValueInput = host.shadowRoot?.getElementById(
    'filterValue'
  ) as HTMLInputElement;
  if (filterValueInput && host._filters.length > 0) {
    const currentFilter = host._filters[0];
    if (currentFilter) {
      const filterFieldElement = host.shadowRoot?.getElementById(
        'filterField'
      ) as HTMLSelectElement;
      const filterOperatorElement = host.shadowRoot?.getElementById(
        'filterOperator'
      ) as HTMLSelectElement;
      if (filterFieldElement) {
        filterFieldElement.value = currentFilter.field;
      }
      if (filterOperatorElement) {
        filterOperatorElement.value = currentFilter.operator;
      }
      filterValueInput.value = currentFilter.value;
    }
  }

  const pageSizeSelect = host.shadowRoot?.getElementById(
    'pageSize'
  ) as HTMLSelectElement;
  if (pageSizeSelect) {
    Array.from(pageSizeSelect.options).forEach(option => {
      option.removeAttribute('selected');
      option.selected = false;
    });
    pageSizeSelect.value = host._pagination.pageSize.toString();
    const selectedOption = pageSizeSelect.querySelector(
      `option[value="${host._pagination.pageSize}"]`
    ) as HTMLOptionElement;
    if (selectedOption) {
      selectedOption.selected = true;
      selectedOption.setAttribute('selected', 'selected');
    }
  }

  const applyBtn = host.shadowRoot?.getElementById('applyFilter');
  if (applyBtn) {
    const newApplyBtn = applyBtn.cloneNode(true);
    applyBtn.parentNode?.replaceChild(newApplyBtn, applyBtn);

    newApplyBtn.addEventListener('click', () => {
      const fieldElement = host.shadowRoot?.getElementById(
        'filterField'
      ) as HTMLSelectElement;
      const operatorElement = host.shadowRoot?.getElementById(
        'filterOperator'
      ) as HTMLSelectElement;
      const valueElement = host.shadowRoot?.getElementById(
        'filterValue'
      ) as HTMLInputElement;

      if (!fieldElement || !operatorElement || !valueElement) return;

      const field = fieldElement.value;
      const operator = operatorElement.value;
      const value = valueElement.value;
      if (!field || !operator || !value) return;
      const filter: FilterConfig = {
        field,
        operator: operator as FilterConfig['operator'],
        value,
      };
      host.filters = [filter];
    });
  }

  const resetBtn = host.shadowRoot?.getElementById('resetFilter');
  if (resetBtn) {
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode?.replaceChild(newResetBtn, resetBtn);

    newResetBtn.addEventListener('click', () => {
      host.reset();
    });
  }

  const pageSizeSel = host.shadowRoot?.getElementById('pageSize');
  if (pageSizeSel) {
    const newPageSizeSel = pageSizeSel.cloneNode(true);
    pageSizeSel.parentNode?.replaceChild(newPageSizeSel, pageSizeSel);
    newPageSizeSel.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      host.setPageSize(Number(target.value));
    });
  }

  const prevBtn = host.shadowRoot?.getElementById('prevPage');
  if (prevBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode?.replaceChild(newPrevBtn, prevBtn);
    newPrevBtn.addEventListener('click', () => host.previousPage());
  }

  const nextBtn = host.shadowRoot?.getElementById('nextPage');
  if (nextBtn) {
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode?.replaceChild(newNextBtn, nextBtn);
    newNextBtn.addEventListener('click', () => host.nextPage());
  }

  updatePaginationInfo(host);

  const switchBtn = host.shadowRoot?.getElementById('switchView');
  if (switchBtn) {
    const newSwitchBtn = switchBtn.cloneNode(true);
    switchBtn.parentNode?.replaceChild(newSwitchBtn, switchBtn);

    newSwitchBtn.textContent = host._showRawData
      ? 'Switch to Processed Data'
      : 'Switch to Raw Data';
    newSwitchBtn.addEventListener('click', () => {
      host._showRawData = !host._showRawData;
      try {
        if (host.engine) {
          host.engine.setDataHandlingMode(
            host._showRawData ? 'raw' : 'processed'
          );
          const currentFilters = host._showRawData
            ? host._rawFilters
            : host._processedFilters;
          host.engine.applyFilters(currentFilters);
          host.dispatchEvent(
            new CustomEvent('viewModeChange', {
              detail: { mode: host._showRawData ? 'raw' : 'processed' },
              bubbles: true,
              composed: true,
            })
          );
        }
      } catch (error) {
        console.error('Error during view switch:', error);
      }
    });
  }

  const exportHTML = host.shadowRoot?.getElementById('exportHTML');
  if (exportHTML) {
    const newExportHTML = exportHTML.cloneNode(true);
    exportHTML.parentNode?.replaceChild(newExportHTML, exportHTML);
    newExportHTML.addEventListener('click', () => host.exportToHTML());
  }

  const exportPDF = host.shadowRoot?.getElementById('exportPDF');
  if (exportPDF) {
    const newExportPDF = exportPDF.cloneNode(true);
    exportPDF.parentNode?.replaceChild(newExportPDF, exportPDF);
    newExportPDF.addEventListener('click', () => host.exportToPDF());
  }

  const exportExcel = host.shadowRoot?.getElementById('exportExcel');
  if (exportExcel) {
    const newExportExcel = exportExcel.cloneNode(true);
    exportExcel.parentNode?.replaceChild(newExportExcel, exportExcel);
    newExportExcel.addEventListener('click', () => host.exportToExcel());
  }

  const printBtn = host.shadowRoot?.getElementById('printTable');
  if (printBtn) {
    const newPrintBtn = printBtn.cloneNode(true);
    printBtn.parentNode?.replaceChild(newPrintBtn, printBtn);
    newPrintBtn.addEventListener('click', () => host.openPrintDialog());
  }

  const formatBtn = host.shadowRoot?.getElementById('formatButton');
  if (formatBtn) {
    const newFormatBtn = formatBtn.cloneNode(true);
    formatBtn.parentNode?.replaceChild(newFormatBtn, formatBtn);
    newFormatBtn.addEventListener('click', () => {
      host.showFormatPopup();
    });
  }

  // Import controls
  const importCSVBtn = host.shadowRoot?.getElementById('importCSV');
  if (importCSVBtn) {
    const newImportCSVBtn = importCSVBtn.cloneNode(true);
    importCSVBtn.parentNode?.replaceChild(newImportCSVBtn, importCSVBtn);
    newImportCSVBtn.addEventListener('click', async () => {
      try {
        const result = await host.connectToLocalCSV();
        if (result.success) {
          console.log('CSV imported successfully:', result);
        } else {
          console.error('CSV import failed:', result.error);
        }
      } catch (error) {
        console.error('CSV import error:', error);
      }
    });
  }

  const importJSONBtn = host.shadowRoot?.getElementById('importJSON');
  if (importJSONBtn) {
    const newImportJSONBtn = importJSONBtn.cloneNode(true);
    importJSONBtn.parentNode?.replaceChild(newImportJSONBtn, importJSONBtn);
    newImportJSONBtn.addEventListener('click', async () => {
      try {
        const result = await host.connectToLocalJSON();
        if (result.success) {
          console.log('JSON imported successfully:', result);
        } else {
          console.error('JSON import failed:', result.error);
        }
      } catch (error) {
        console.error('JSON import error:', error);
      }
    });
  }

  // Connect controls
  const connectBtn = host.shadowRoot?.getElementById('connectButton');
  const connectDropdown = host.shadowRoot?.getElementById('connectDropdown');
  if (connectBtn && connectDropdown) {
    const newConnectBtn = connectBtn.cloneNode(true);
    connectBtn.parentNode?.replaceChild(newConnectBtn, connectBtn);

    // Toggle dropdown on button click
    newConnectBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      connectDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (
        !connectDropdown.contains(e.target as Node) &&
        !newConnectBtn.contains(e.target as Node)
      ) {
        connectDropdown.classList.remove('show');
      }
    });

    // Handle file import options
    const connectOptions = connectDropdown.querySelectorAll('.connect-option');
    connectOptions.forEach(option => {
      const newOption = option.cloneNode(true);
      option.parentNode?.replaceChild(newOption, option);
      newOption.addEventListener('click', async e => {
        e.preventDefault();
        const fileType = (newOption as HTMLElement).getAttribute(
          'data-file-type'
        );
        connectDropdown.classList.remove('show');

        try {
          let result;
          switch (fileType) {
            case 'csv':
              result = await host.connectToLocalCSV({
                csv: {
                  delimiter: ',',
                  hasHeader: true,
                  skipEmptyLines: true,
                  trimValues: true,
                },
                maxFileSize: 50 * 1024 * 1024, // 50MB
              });
              break;
            case 'json':
              result = await host.connectToLocalJSON({
                json: {
                  arrayPath: undefined, // Will auto-detect
                  validateSchema: true,
                },
                maxFileSize: 50 * 1024 * 1024, // 50MB
              });
              break;
            case 'any':
            default:
              result = await host.connectToLocalFile({
                maxFileSize: 50 * 1024 * 1024, // 50MB
              });
              break;
          }

          if (result.success) {
            console.log('File imported successfully:', result.fileName);
            // Show success message (you can customize this)
            const message = `Successfully imported ${result.recordCount} records from ${result.fileName}`;
            console.log(message);
          } else {
            console.error('File import failed:', result.error);
            alert(`Import failed: ${result.error}`);
          }
        } catch (error) {
          console.error('Error during file import:', error);
          alert(
            `Import error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    });
  }
}

export function updatePaginationInfo(host: PivotHeadHost) {
  const pageInfo = host.shadowRoot?.getElementById('pageInfo');
  if (pageInfo) {
    const viewMode = host._showRawData ? 'Raw Data' : 'Processed Data';
    pageInfo.textContent = `${viewMode} - Page ${host._pagination.currentPage} of ${host._pagination.totalPages}`;
  }
  const prevButton = host.shadowRoot?.getElementById(
    'prevPage'
  ) as HTMLButtonElement;
  const nextButton = host.shadowRoot?.getElementById(
    'nextPage'
  ) as HTMLButtonElement;
  if (prevButton) prevButton.disabled = host._pagination.currentPage <= 1;
  if (nextButton)
    nextButton.disabled =
      host._pagination.currentPage >= host._pagination.totalPages;
}

// Drag & drill-down & sort handlers
export function addDragListeners(host: PivotHeadHost): void {
  const headers = host.shadowRoot?.querySelectorAll('th[draggable="true"]');
  headers?.forEach(header => {
    header.addEventListener('dragstart', (e: Event) => {
      handleColumnDragStart(host, e as DragEvent);
    });
    header.addEventListener('dragover', (e: Event) => {
      handleColumnDragOver(host, e as DragEvent);
    });
    header.addEventListener('dragleave', (e: Event) => {
      handleColumnDragLeave(host, e as DragEvent);
    });
    header.addEventListener('drop', (e: Event) => {
      handleColumnDrop(host, e as DragEvent);
    });
    header.addEventListener('dragend', () => {
      handleColumnDragEnd(host);
    });
  });

  const rows = host.shadowRoot?.querySelectorAll('tr[draggable="true"]');
  rows?.forEach(row => {
    row.addEventListener('dragstart', (e: Event) => {
      handleRowDragStart(host, e as DragEvent);
    });
    row.addEventListener('dragover', (e: Event) => {
      handleRowDragOver(host, e as DragEvent);
    });
    row.addEventListener('dragleave', (e: Event) => {
      handleRowDragLeave(host, e as DragEvent);
    });
    row.addEventListener('drop', (e: Event) => {
      handleRowDrop(host, e as DragEvent);
    });
    row.addEventListener('dragend', () => {
      handleRowDragEnd(host);
    });
  });

  const sortableHeaders = host.shadowRoot?.querySelectorAll('.sortable-header');
  sortableHeaders?.forEach(header => {
    header.addEventListener('click', (e: Event) => {
      handleSortClick(host, e);
    });
  });

  const drillDownCells = host.shadowRoot?.querySelectorAll('.drill-down-cell');
  drillDownCells?.forEach(cell => {
    cell.addEventListener('dblclick', (e: Event) => {
      handleDrillDownClick(host, e);
    });
  });
}

export function handleSortClick(host: PivotHeadHost, e: Event): void {
  if (!host.engine) return;
  const target = e.target as HTMLElement;
  const header = target.closest('.sortable-header') as HTMLElement | null;
  if (!header) return;
  const field = header.dataset.field;
  if (!field) return;

  // Calculate next direction based on current engine state
  const state = host.engine.getState();
  const current =
    state.sortConfig && state.sortConfig.length > 0
      ? state.sortConfig[0]
      : null;
  const nextDir: 'asc' | 'desc' =
    current && current.field === field && current.direction === 'asc'
      ? 'desc'
      : 'asc';

  // In processed mode, clicking a measure header under a specific column
  // should sort ROWS by that column's measure aggregate. We compute the row
  // order and store it in the engine as a custom row order so rendering uses it.
  if (!host._showRawData) {
    const isMeasureHeader = header.hasAttribute('data-measure-index');
    const columnValue = header.getAttribute('data-column-value') || '';

    if (isMeasureHeader && columnValue) {
      try {
        const measures = (host._options.measures || []) as Array<{
          uniqueName: string;
          aggregation?: string;
        }>;
        const measureCfg = measures.find(m => m.uniqueName === field);
        const aggregation = (measureCfg?.aggregation as string) || 'sum';
        const aggKey = `${aggregation}_${field}`;

        const groups = host.engine.getGroupedData();

        // Build the full set of row values across ALL groups (not just those that appear for the selected column)
        const allRowSet = new Set<string>();
        groups.forEach(g => {
          const keys = g.key ? g.key.split('|') : [];
          if (keys[0]) allRowSet.add(keys[0]);
        });
        const allRowValues = Array.from(allRowSet);

        // Create [row, value] pairs for the target column; treat missing intersections as 0
        const pairs = allRowValues.map(rv => {
          const grp = groups.find(gr => {
            const keys = gr.key ? gr.key.split('|') : [];
            return keys[0] === rv && keys[1] === columnValue;
          });
          const aggregates = (grp?.aggregates || {}) as Record<string, number>;
          const val = Number(aggregates[aggKey] ?? 0);
          return { row: rv, val: isFinite(val) ? val : 0 };
        });

        // Sort according to nextDir, keeping zero-value rows included
        pairs.sort((a, b) =>
          nextDir === 'asc' ? a.val - b.val : b.val - a.val
        );
        const orderedRows = pairs.map(p => p.row);

        const rowFieldName = host._options.rows?.[0]?.uniqueName || '';
        if (rowFieldName && orderedRows.length > 0) {
          host.engine.setCustomFieldOrder(rowFieldName, orderedRows, true);
        }
      } catch (err) {
        console.error(
          'Failed to compute/set custom row order for processed sort:',
          err
        );
      }
    } else {
      // If sorting by the row dimension header, compute alphabetical order
      const rowFieldName = host._options.rows?.[0]?.uniqueName || '';
      if (rowFieldName && field === rowFieldName) {
        try {
          const groups = host.engine.getGroupedData();
          const rowSet = new Set<string>();
          groups.forEach(g => {
            const keys = g.key ? g.key.split('|') : [];
            if (keys[0]) rowSet.add(keys[0]);
          });
          const rows = Array.from(rowSet);
          rows.sort((a, b) =>
            nextDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
          );
          if (rows.length > 0) {
            host.engine.setCustomFieldOrder(rowFieldName, rows, true);
          }
        } catch (err) {
          console.error(
            'Failed to set custom row order for dimension sort:',
            err
          );
        }
      }
    }
  }

  // Also call engine.sort to update its sort state (icons) and internal groups
  host.engine.sort(field, nextDir);
}

export function handleDrillDownClick(host: PivotHeadHost, e: Event): void {
  if (!host.engine) return;
  const cell = (e.target as HTMLElement).closest(
    '.drill-down-cell'
  ) as HTMLElement | null;
  if (!cell) return;
  const rowValue = cell.getAttribute('data-row-value') || '';
  const columnValue = cell.getAttribute('data-column-value') || '';
  const measureName = cell.getAttribute('data-measure-name') || '';
  const measureCaption =
    cell.getAttribute('data-measure-caption') || measureName;
  const rowField = cell.getAttribute('data-row-field') || '';
  const columnField = cell.getAttribute('data-column-field') || '';

  const state = host.engine.getState();
  const rawData = (state.rawData || state.data || []) as Array<
    Record<string, unknown>
  >;
  const subset = rawData.filter((r: Record<string, unknown>) => {
    const rowOk = rowField
      ? String(r[rowField] ?? '') === String(rowValue)
      : true;
    const colOk = columnField
      ? String(r[columnField] ?? '') === String(columnValue)
      : true;
    return rowOk && colOk;
  });

  addModalStylesToDocument();

  const overlay = document.createElement('div');
  overlay.className = 'drill-down-modal';
  const content = document.createElement('div');
  content.className = 'drill-down-content';
  content.innerHTML = `
      <div class="drill-down-header">
        <div class="drill-down-title">Details: ${rowField}: ${rowValue}${columnField ? `, ${columnField}: ${columnValue}` : ''}</div>
        <button class="drill-down-close" aria-label="Close">&times;</button>
      </div>
      <div class="drill-down-summary">
        Records: ${subset.length}. Measure: ${measureCaption} (${measureName}).
      </div>
      <div class="drill-down-body"></div>
    `;
  const bodyDiv = content.querySelector('.drill-down-body') as HTMLElement;
  if (subset.length > 0) {
    const headers = Object.keys(subset[0] as Record<string, unknown>);
    const table = document.createElement('table');
    table.className = 'drill-down-table';
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    subset.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(h => {
        const td = document.createElement('td');
        const val = (row as Record<string, unknown>)[h];
        td.textContent = val != null ? String(val) : '';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    bodyDiv.appendChild(table);
  } else {
    bodyDiv.textContent = 'No matching records.';
  }
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', evt => {
    if (evt.target === overlay) close();
  });
  const closeBtn = content.querySelector(
    '.drill-down-close'
  ) as HTMLButtonElement | null;
  closeBtn?.addEventListener('click', close);
}

function addModalStylesToDocument(): void {
  if (document.getElementById('pivot-head-modal-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'pivot-head-modal-styles';
  styleEl.textContent = `
      .drill-down-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .drill-down-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 800px;
          max-height: 80%;
          overflow: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
      .drill-down-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
      }
      .drill-down-title { font-size: 18px; font-weight: bold; color: #333; }
      .drill-down-close {
          background: #f44336;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
      }
      .drill-down-close:hover { background: #d32f2f; }
      .drill-down-summary { background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; line-height: 1.4; }
      .drill-down-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
      .drill-down-table th { background: #f8f9fa; padding: 8px; border: 1px solid #dee2e6; font-weight: bold; text-align: left; }
      .drill-down-table td { padding: 6px 8px; border: 1px solid #dee2e6; }
      .drill-down-table tr:nth-child(even) { background-color: #f9f9f9; }
      .drill-down-table tr:hover { background-color: #e3f2fd; }
    `;
  document.head.appendChild(styleEl);
}

// Sort icons
export function createSortIcon(host: PivotHeadHost, field: string): string {
  if (!host.engine) {
    return '<span class="sort-icon" title="Click to sort">&#8693;</span>';
  }
  const state = host.engine.getState();
  const sortConfig =
    state.sortConfig && state.sortConfig.length > 0
      ? state.sortConfig[0]
      : null;
  const isCurrentlySorted = !!(sortConfig && sortConfig.field === field);
  if (isCurrentlySorted) {
    if (sortConfig && sortConfig.direction === 'asc') {
      return '<span class="sort-icon active" title="Sorted ascending">&#9650;</span>';
    } else {
      return '<span class="sort-icon active" title="Sorted descending">&#9660;</span>';
    }
  }
  return '<span class="sort-icon" title="Click to sort">&#8693;</span>';
}

export function createProcessedSortIcon(
  host: PivotHeadHost,
  field: string
): string {
  if (!host.engine) {
    return '<span class="sort-icon" title="Click to sort">&#8693;</span>';
  }
  const state = host.engine.getState();
  const sortConfig =
    state.sortConfig && state.sortConfig.length > 0
      ? state.sortConfig[0]
      : null;
  const isCurrentlySorted = !!(sortConfig && sortConfig.field === field);
  if (isCurrentlySorted) {
    if (sortConfig && sortConfig.direction === 'asc') {
      return '<span class="sort-icon active" title="Sorted ascending">&#9650;</span>';
    } else {
      return '<span class="sort-icon active" title="Sorted descending">&#9660;</span>';
    }
  }
  return '<span class="sort-icon" title="Click to sort">&#8693;</span>';
}

function handleColumnDragStart(host: PivotHeadHost, e: DragEvent): void {
  host.draggedColumn = e.target as HTMLElement;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      host.draggedColumn.dataset.columnIndex || ''
    );
  }
  setTimeout(() => host.draggedColumn?.classList.add('dragging'), 0);
}

function handleColumnDragOver(host: PivotHeadHost, e: DragEvent): void {
  e.preventDefault();
  if (e.dataTransfer?.types.includes('text/plain')) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TH' && target !== host.draggedColumn) {
      target.classList.add('drag-over');
    }
  }
}

function handleColumnDragLeave(host: PivotHeadHost, e: DragEvent): void {
  (e.target as HTMLElement).classList.remove('drag-over');
}

function handleColumnDrop(host: PivotHeadHost, e: DragEvent): void {
  e.preventDefault();
  const target = e.target as HTMLElement;
  target.classList.remove('drag-over');
  if (host.draggedColumn && target.tagName === 'TH') {
    const fromIndex = parseInt(host.draggedColumn.dataset.columnIndex || '0');
    const toIndex = parseInt(target.dataset.columnIndex || '0');
    if (fromIndex !== toIndex) host.swapColumns(fromIndex, toIndex);
  }
}

function handleColumnDragEnd(host: PivotHeadHost): void {
  host.draggedColumn?.classList.remove('dragging');
  host.draggedColumn = null;
  host.shadowRoot
    ?.querySelectorAll('.drag-over')
    .forEach(el => el.classList.remove('drag-over'));
}

function handleRowDragStart(host: PivotHeadHost, e: DragEvent): void {
  host.draggedRow = e.target as HTMLElement;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      host.draggedRow.dataset.rowIndex || ''
    );
  }
  setTimeout(() => host.draggedRow?.classList.add('dragging'), 0);
}

function handleRowDragOver(host: PivotHeadHost, e: DragEvent): void {
  e.preventDefault();
  if (e.dataTransfer?.types.includes('text/plain')) {
    const target = e.target as HTMLElement;
    const targetRow = target.closest('tr') as HTMLElement;
    if (
      targetRow &&
      targetRow.tagName === 'TR' &&
      targetRow !== host.draggedRow
    ) {
      targetRow.classList.add('drag-over');
    }
  }
}

function handleRowDragLeave(host: PivotHeadHost, e: DragEvent): void {
  const target = e.target as HTMLElement;
  const targetRow = target.closest('tr') as HTMLElement;
  if (targetRow) targetRow.classList.remove('drag-over');
}

function handleRowDrop(host: PivotHeadHost, e: DragEvent): void {
  e.preventDefault();
  const target = e.target as HTMLElement;
  const targetRow = target.closest('tr') as HTMLElement;
  if (targetRow) targetRow.classList.remove('drag-over');
  if (host.draggedRow && targetRow && targetRow.tagName === 'TR') {
    const fromIndex = parseInt(host.draggedRow.dataset.rowIndex || '0');
    const toIndex = parseInt(targetRow.dataset.rowIndex || '0');
    if (fromIndex !== toIndex) host.swapRows(fromIndex, toIndex);
  }
}

function handleRowDragEnd(host: PivotHeadHost): void {
  host.draggedRow?.classList.remove('dragging');
  host.draggedRow = null;
  host.shadowRoot
    ?.querySelectorAll('.drag-over')
    .forEach(el => el.classList.remove('drag-over'));
}
