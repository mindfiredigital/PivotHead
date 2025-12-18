import type { Group, MeasureConfig } from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';

export function renderSwitch(host: PivotHeadHost) {
  const mode = host.getAttribute('mode') || 'default';
  if (mode === 'none') {
    if (host.shadowRoot) {
      host.shadowRoot.innerHTML = `<style>:host { display:block; }</style>`;
    }
  } else if (mode === 'minimal') {
    if (host.shadowRoot) {
      host.shadowRoot.innerHTML = `
        <style>
        :host { display: block; font-family: inherit; }
        [data-pivot-root] {
          display: grid;
          border: 1px solid #d8dde2; border-radius: 6px; background: #fcfdff;
        }
        [data-pivot-header], [data-pivot-body] {
          padding: 0.3em 0.5em;
        }
        [data-pivot-header] {
          background: #f4f7fa;
          border-bottom: 1px solid #e2e7ed;
          font-weight: bold;
        }
        </style>
        <div role="grid" data-pivot-root>
          <div role="rowgroup" data-pivot-header><slot name="header"></slot></div>
          <div role="rowgroup" data-pivot-body><slot name="body"></slot></div>
        </div>
      `;
    }
  } else {
    host._showRawData ? host.renderRawTable() : host.renderFullUI();
  }
}

export function handleEngineStateChange(host: PivotHeadHost, state: unknown) {
  host.dispatchEvent(
    new CustomEvent('stateChange', {
      detail: state,
      bubbles: true,
      composed: true,
    })
  );
  host.calculatePaginationForCurrentView();
  const mode = host.getAttribute('mode');
  if (mode === 'none') {
    if (host.shadowRoot)
      host.shadowRoot.innerHTML = `<style>:host { display:block; }</style>`;
  } else if (mode === 'minimal') {
    if (host.shadowRoot) {
      host.shadowRoot.innerHTML = `
        <style>
        :host { display: block; font-family: inherit; }
        [data-pivot-root] {
          display: grid;
          border: 1px solid #d8dde2; border-radius: 6px; background: #fcfdff;
        }
        [data-pivot-header], [data-pivot-body] {
          padding: 0.3em 0.5em;
        }
        [data-pivot-header] {
          background: #f4f7fa;
          border-bottom: 1px solid #e2e7ed;
          font-weight: bold;
        }
        </style>
        <div role="grid" data-pivot-root>
          <div role="rowgroup" data-pivot-header><slot name="header"></slot></div>
          <div role="rowgroup" data-pivot-body><slot name="body"></slot></div>
        </div>
      `;
    }
  } else {
    host._showRawData ? host.renderRawTable() : host.renderFullUI();
  }
}

export function renderFullUI(host: PivotHeadHost) {
  const engine = host.engine;
  if (!engine) {
    console.error('❌ renderFullUI: No engine');
    if (host.shadowRoot) host.shadowRoot.innerHTML = '';
    return;
  }
  const state = engine.getState();
  console.log('🔍 renderFullUI - State check:', {
    hasState: !!state,
    hasProcessedData: !!state?.processedData,
    processedDataType: state?.processedData
      ? typeof state.processedData
      : 'undefined',
    processedDataLength: Array.isArray(state?.processedData)
      ? state.processedData.length
      : 'not array',
  });

  if (!state.processedData) {
    console.error('❌ renderFullUI: No processed data available', state);
    return;
  }
  const rowField = host._options.rows?.[0];
  const columnField = host._options.columns?.[0];
  const measures = host._options.measures || [];

  console.log('🔍 renderFullUI - Options check:', {
    rowField,
    columnField,
    measuresCount: measures.length,
    allOptions: host._options,
  });

  if (!rowField || !columnField || !measures.length) {
    console.error(
      '❌ renderFullUI: Missing row, column, or measures configuration',
      {
        rowField,
        columnField,
        measures,
      }
    );
    return;
  }
  host.calculatePaginationForCurrentView();
  let html = `
      <style>
        :host { display: block; font-family: inherit; }
        .controls-container { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .filter-container, .pagination-container { display: flex; gap: 10px; align-items: center; }
        table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #dee2e6; margin-top: 20px; }
        th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; cursor: grab; font-weight: 600; }
        .sortable-header { cursor: pointer; position: relative; }
        .sort-icon { margin-left: 5px; font-size: 12px; color: #6c757d; opacity: 0.5; }
        .sort-icon.active { color: #007bff; opacity: 1; }
        .corner-cell { background-color: #f8f9fa !important; border-bottom: 2px solid #dee2e6; border-right: 1px solid #dee2e6; }
        .column-header { background-color: #f8f9fa !important; border-bottom: 2px solid #dee2e6; text-align: center; cursor: move; }
        .measure-header { background-color: #f8f9fa !important; border-bottom: 2px solid #dee2e6; cursor: pointer; }
        .row-cell { font-weight: bold; background-color: #f8f9fa; }
        tr[draggable="true"] { cursor: grab; }
        .dragging { opacity: 0.5; }
        .drag-over { outline: 2px dashed #2672dd; background: #f3f8fd !important; }
        tbody tr:nth-child(even) td { background: #f8fafc; }
        button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #45a049; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        select, input { padding: 5px; border-radius: 4px; border: 1px solid #ddd; }
        
        /* Drill-down styles */
        .drill-down-cell { cursor: pointer; }
        .drill-down-cell:hover { background-color: #e3f2fd !important; }
        
        /* Modal styles for drill-down details */
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

        .drill-down-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }

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

        .drill-down-close:hover {
            background: #d32f2f;
        }

        .drill-down-summary {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 14px;
            line-height: 1.4;
        }

        .drill-down-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }

        .drill-down-table th {
            background: #f8f9fa;
            padding: 8px;
            border: 1px solid #dee2e6;
            font-weight: bold;
            text-align: left;
        }

        .drill-down-table td {
            padding: 6px 8px;
            border: 1px solid #dee2e6;
        }

        .drill-down-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .drill-down-table tr:hover {
            background-color: #e3f2fd;
        }
      </style>
      <div class="controls-container">
        <div class="filter-container">
          <label>Filter:</label>
          <select id="filterField"></select>
          <select id="filterOperator">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
          <input type="text" id="filterValue" placeholder="Value">
          <button id="applyFilter">Apply</button>
          <button id="resetFilter">Reset</button>
        </div>
        <div class="pagination-container">
          <label>Items per page:</label>
          <select id="pageSize">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <button id="prevPage">Previous</button>
          <span id="pageInfo">Page ${host._pagination.currentPage} of ${host._pagination.totalPages}</span>
          <button id="nextPage">Next</button>
        </div>
        <button id="switchView">Switch to Raw Data</button>
        <button id="formatButton">Format</button>
        <button id="exportHTML">Export HTML</button>
        <button id="exportPDF">Export PDF</button>
        <button id="exportExcel">Export Excel</button>
        <button id="printTable">Print</button>
      </div>
    `;

  // Determine column labels using engine's custom column order if any
  const groupedData = engine.getGroupedData();
  console.log('🔍 renderFullUI - Grouped data:', {
    count: groupedData?.length || 0,
    sample: groupedData?.[0],
    sampleKey: groupedData?.[0]?.key,
    sampleAggregates: groupedData?.[0]?.aggregates,
  });
  console.log('🔍 renderFullUI - GroupConfig:', host._options?.groupConfig);

  let uniqueColumnValues =
    engine.getOrderedColumnValues() ||
    ([
      ...new Set(
        groupedData.map((g: Group) => {
          const keys = g.key ? g.key.split('|') : [];
          return keys[1] || keys[0];
        })
      ),
    ].filter(Boolean) as string[]);

  console.log('🔍 renderFullUI - Column values:', uniqueColumnValues);
  if (host._processedColumnOrder.length === 0) {
    host._processedColumnOrder = [...uniqueColumnValues];
  }
  if (host._processedColumnOrder.length > 0) {
    uniqueColumnValues = host._processedColumnOrder.filter(col =>
      uniqueColumnValues.includes(col)
    );
  }

  html += '<table role="grid">';
  html += '<thead>';
  html += '<tr>';
  html += `<th class="corner-cell">${rowField.caption} / ${columnField.caption}</th>`;
  uniqueColumnValues.forEach((colValue, index) => {
    html += `<th class="column-header" draggable="true" data-column-index="${index}" data-column-value="${colValue}" colspan="${measures.length}">${colValue}</th>`;
  });
  html += '</tr>';
  html += '<tr>';
  const rowSortIcon = host.createProcessedSortIcon(rowField.uniqueName);
  html += `<th class="row-cell sortable-header" data-field="${rowField.uniqueName}">
      ${rowField.caption}${rowSortIcon}
    </th>`;
  uniqueColumnValues.forEach(colValue => {
    measures.forEach((measure: MeasureConfig, measureIndex: number) => {
      const sortIcon = host.createProcessedSortIcon(measure.uniqueName);
      html += `<th class="measure-header sortable-header" data-measure-index="${measureIndex}" data-field="${measure.uniqueName}" data-column-value="${colValue}">
          ${measure.caption}${sortIcon}
        </th>`;
    });
  });
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';

  // Prefer engine-provided ordered row values (custom or due to sorting)
  const orderedFromEngine = engine.getOrderedRowValues() || [];
  let uniqueRowValues: string[] = [...orderedFromEngine];
  if (uniqueRowValues.length === 0) {
    // Fallback: derive row values from all grouped data keys so we don't miss any groups
    const allGroups = engine.getGroupedData();
    uniqueRowValues = [
      ...new Set(
        allGroups.map((g: Group) => {
          const keys = g.key ? g.key.split('|') : [];
          return keys[0];
        })
      ),
    ].filter(Boolean) as string[];
  }

  console.log('🔍 renderFullUI - Row values:', {
    total: uniqueRowValues.length,
    values: uniqueRowValues,
  });

  const paginatedRowValues = host.getPaginatedData(uniqueRowValues);

  console.log('🔍 renderFullUI - Paginated rows:', {
    count: paginatedRowValues.length,
    values: paginatedRowValues,
  });
  paginatedRowValues.forEach((rowValue, rowIndex) => {
    html += `<tr draggable="true" data-row-index="${rowIndex}" data-row-value="${rowValue}">`;
    html += `<td class="row-cell">${rowValue}</td>`;
    uniqueColumnValues.forEach(colValue => {
      measures.forEach((measure: MeasureConfig) => {
        const matchingGroup = groupedData.find((g: Group) => {
          const keys = g.key ? g.key.split('|') : [];
          return keys[0] === rowValue && keys[1] === colValue;
        });
        const aggKey = measure.aggregation + '_' + measure.uniqueName;
        const value = matchingGroup?.aggregates?.[aggKey] as
          | number
          | string
          | undefined
          | null;
        let formattedValue = '0';
        if (value !== undefined && value !== null) {
          formattedValue = engine.formatValue(value, measure.uniqueName);
        }
        const hasData =
          value !== undefined && value !== null && Number(value) > 0;
        const cellClass = hasData ? 'data-cell drill-down-cell' : 'data-cell';
        const cellTitle = hasData
          ? `Double-click to see details for ${rowField.caption}: ${rowValue} - ${columnField.caption}: ${colValue}`
          : '';
        const textAlign = engine.getFieldAlignment(measure.uniqueName);
        html += `<td class="${cellClass}" 
                      style="text-align: ${textAlign};"
                      title="${cellTitle}"
                      data-row-value="${rowValue}" 
                      data-column-value="${colValue}" 
                      data-measure-name="${measure.uniqueName}"
                      data-measure-caption="${measure.caption}"
                      data-row-field="${rowField.uniqueName}"
                      data-column-field="${columnField.uniqueName}"
                      data-aggregate-value="${value || 0}">
                      ${formattedValue}
                   </td>`;
      });
    });
    html += '</tr>';
  });
  html += '</tbody>';
  html += '</table>';

  // Debug: Log table header structure
  const theadMatch = html.match(/<thead>.*?<\/thead>/s);
  if (theadMatch) {
    console.log(
      '🔍 renderFullUI - Table header HTML:',
      theadMatch[0].substring(0, 500)
    );
  }

  if (host.shadowRoot) host.shadowRoot.innerHTML = html;
  host.addDragListeners();
  host.setupControls();
}

export function renderRawTable(host: PivotHeadHost) {
  const engine = host.engine;
  if (!engine) return;
  const state = engine.getState();
  // Prefer full rawData first; state.data could be limited by engine defaults
  const allRawData = state.rawData || state.data || [];
  if (!allRawData.length) return;
  host.updatePaginationForData(allRawData);
  const displayData = host.getPaginatedData(allRawData);
  const originalHeaders = Object.keys(displayData[0] || allRawData[0]);
  let headers: string[];
  if (host._rawDataColumnOrder && host._rawDataColumnOrder.length > 0) {
    const missingHeaders = originalHeaders.filter(
      h => !host._rawDataColumnOrder.includes(h)
    );
    headers = [...host._rawDataColumnOrder, ...missingHeaders];
  } else {
    headers = originalHeaders;
    host._rawDataColumnOrder = [...headers];
  }
  let html = `
      <style>
        :host { display: block; font-family: inherit; }
        .controls-container { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .filter-container, .pagination-container { display: flex; gap: 10px; align-items: center; }
        table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e7ed; }
        th, td { border: 1px solid #dde1e7; padding: 8px; text-align: left; }
        th { background-color: #eaf2fa; cursor: grab; font-weight: 600; }
        .sortable-header { cursor: pointer !important; position: relative; }
        .sort-icon { margin-left: 5px; font-size: 12px; color: #6c757d; opacity: 0.5; }
        .sort-icon.active { color: #007bff; opacity: 1; }
        tr[draggable="true"] { cursor: grab; }
        .dragging { opacity: 0.5; }
        .drag-over { outline: 2px dashed #2672dd; background: #f3f8fd !important; }
        tbody tr:nth-child(even) td { background: #f8fafc; }
        button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #45a049; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        select, input { padding: 5px; border-radius: 4px; border: 1px solid #ddd; }
      </style>
      <div class="controls-container">
        <div class="filter-container">
          <label>Filter:</label>
          <select id="filterField"></select>
          <select id="filterOperator">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
          <input type="text" id="filterValue" placeholder="Value">
          <button id="applyFilter">Apply</button>
          <button id="resetFilter">Reset</button>
        </div>
        <div class="pagination-container">
          <label>Items per page:</label>
          <select id="pageSize">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <button id="prevPage">Previous</button>
          <span id="pageInfo">Page ${host._pagination.currentPage} of ${host._pagination.totalPages}</span>
          <button id="nextPage">Next</button>
        </div>
        <button id="switchView">Switch to Processed Data</button>
        <button id="formatButton">Format</button>
        <button id="exportHTML">Export HTML</button>
        <button id="exportPDF">Export PDF</button>
        <button id="exportExcel">Export Excel</button>
        <button id="printTable">Print</button>
      </div>
    `;
  html += '<table data-raw="true">';
  html += '<thead><tr>';
  headers.forEach((header, index) => {
    const sortIcon = host.createSortIcon(header);
    html += `<th class="sortable-header" draggable="true" data-column-index="${index}" data-field="${header}">
        ${header}${sortIcon}
      </th>`;
  });
  html += '</tr></thead>';
  html += '<tbody>';
  displayData.forEach((row, rowIndex: number) => {
    const pivotRow = row as Record<string, unknown>;
    html += `<tr draggable="true" data-row-index="${rowIndex}">`;
    headers.forEach(header => {
      const cellValue = pivotRow[header];
      let formattedValue = cellValue;
      if (cellValue !== undefined && cellValue !== null) {
        formattedValue = engine.formatValue(cellValue, header);
      }
      const textAlign = engine.getFieldAlignment(header);
      html += `<td style="text-align: ${textAlign};">${formattedValue}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  if (host.shadowRoot) host.shadowRoot.innerHTML = html;
  host.addDragListeners();
  host.setupControls();
}
