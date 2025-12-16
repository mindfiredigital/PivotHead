import { PivotEngine } from '@mindfiredigital/pivothead';
import './style.css';

// Import WASM CSV Processor dynamically
let getWasmCSVProcessor;

(async () => {
  try {
    const { getWasmCSVProcessor: wasmGetter } =
      await import('@mindfiredigital/pivothead');
    getWasmCSVProcessor = wasmGetter;
    console.log('✅ WASM CSV Processor loaded successfully');
  } catch (error) {
    console.warn('⚠️ WASM CSV Processor not available:', error.message);
  }
})();

// Sample sales data
let salesData = [
  {
    date: '2024-01-01',
    product: 'Laptop',
    region: 'North',
    sales: 1500,
    quantity: 3,
  },
  {
    date: '2024-01-02',
    product: 'Laptop',
    region: 'South',
    sales: 2000,
    quantity: 4,
  },
  {
    date: '2024-01-03',
    product: 'Mouse',
    region: 'North',
    sales: 150,
    quantity: 10,
  },
  {
    date: '2024-01-04',
    product: 'Mouse',
    region: 'South',
    sales: 200,
    quantity: 15,
  },
  {
    date: '2024-01-05',
    product: 'Keyboard',
    region: 'North',
    sales: 500,
    quantity: 5,
  },
  {
    date: '2024-01-06',
    product: 'Keyboard',
    region: 'South',
    sales: 600,
    quantity: 6,
  },
  {
    date: '2024-01-07',
    product: 'Monitor',
    region: 'North',
    sales: 3000,
    quantity: 8,
  },
  {
    date: '2024-01-08',
    product: 'Monitor',
    region: 'South',
    sales: 3500,
    quantity: 10,
  },
  {
    date: '2024-01-09',
    product: 'Laptop',
    region: 'East',
    sales: 2500,
    quantity: 5,
  },
  {
    date: '2024-01-10',
    product: 'Mouse',
    region: 'East',
    sales: 180,
    quantity: 12,
  },
  {
    date: '2024-01-11',
    product: 'Keyboard',
    region: 'East',
    sales: 550,
    quantity: 7,
  },
  {
    date: '2024-01-12',
    product: 'Monitor',
    region: 'East',
    sales: 3200,
    quantity: 9,
  },
];

// Pivot table configuration
const pivotConfig = {
  data: salesData,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 0,
        locale: 'en-US',
      },
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string' },
    { field: 'region', label: 'Region', type: 'string' },
    { field: 'date', label: 'Date', type: 'date' },
    { field: 'sales', label: 'Sales', type: 'number' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
  ],
  defaultAggregation: 'sum',
  isResponsive: true,
};

// Initialize the PivotEngine
let engine = new PivotEngine(pivotConfig);

// Pagination state
let currentPage = 1;
let pageSize = 5;

// Drag and drop state
let draggedElement = null;
let dragType = null;

// Custom ordering for rows and columns
let customProductOrder = [];
let customRegionOrder = [];

// Function to calculate aggregates manually from raw data
function calculateAggregates(
  data,
  rowField,
  colField,
  rowValue,
  colValue,
  measureField
) {
  const filtered = data.filter(
    item => item[rowField] === rowValue && item[colField] === colValue
  );

  if (filtered.length === 0) return 0;

  return filtered.reduce((sum, item) => sum + (item[measureField] || 0), 0);
}

// Function to render the pivot table
function renderPivotTable() {
  const state = engine.getState();
  const data = state.data || salesData;
  const pivotTableDiv = document.getElementById('pivot-table');

  // Extract unique regions (columns) and products (rows)
  let regions = [...new Set(data.map(item => item.region))];
  let products = [...new Set(data.map(item => item.product))];

  // Apply custom ordering if available, otherwise sort alphabetically
  if (customRegionOrder.length > 0) {
    regions = customRegionOrder.filter(r => regions.includes(r));
  } else {
    regions.sort();
    customRegionOrder = [...regions];
  }

  if (customProductOrder.length > 0) {
    products = customProductOrder.filter(p => products.includes(p));
  } else {
    products.sort();
    customProductOrder = [...products];
  }

  // Apply pagination to products
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedProducts = products.slice(startIdx, endIdx);

  // Build HTML table
  let html = '<table class="pivot" id="pivot-data-table">';

  // Header row with regions
  html += '<thead><tr><th class="row-header">Product / Region</th>';
  regions.forEach((region, idx) => {
    html += `<th colspan="2" class="draggable-header" draggable="true" data-type="column" data-index="${idx}">${region}</th>`;
  });
  html += '<th colspan="2">Grand Total</th></tr>';

  // Sub-header row for measures
  html += '<tr><th></th>';
  regions.forEach(() => {
    html +=
      '<th class="measure-header">Sales</th><th class="measure-header">Qty</th>';
  });
  html +=
    '<th class="measure-header">Sales</th><th class="measure-header">Qty</th></tr></thead>';

  // Body rows
  html += '<tbody>';
  let grandTotalSales = 0;
  let grandTotalQty = 0;

  paginatedProducts.forEach((product, idx) => {
    const globalIdx = products.indexOf(product);
    html += `<tr class="draggable-row" draggable="true" data-type="row" data-index="${globalIdx}" data-product="${product}">`;
    html += `<td class="row-header"><strong>${product}</strong></td>`;
    let rowTotalSales = 0;
    let rowTotalQty = 0;

    regions.forEach(region => {
      const salesValue = calculateAggregates(
        data,
        'product',
        'region',
        product,
        region,
        'sales'
      );
      const qtyValue = calculateAggregates(
        data,
        'product',
        'region',
        product,
        region,
        'quantity'
      );

      rowTotalSales += salesValue;
      rowTotalQty += qtyValue;

      const formattedSales = salesValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      const formattedQty = qtyValue.toLocaleString('en-US');

      // Apply conditional formatting classes
      let salesClass = '';
      if (salesValue > 2000) salesClass = 'high-value';
      else if (salesValue > 0 && salesValue < 500) salesClass = 'low-value';

      html += `<td class="number ${salesClass}">${formattedSales}</td>`;
      html += `<td class="number">${formattedQty}</td>`;
    });

    grandTotalSales += rowTotalSales;
    grandTotalQty += rowTotalQty;

    const formattedRowSales = rowTotalSales.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    const formattedRowQty = rowTotalQty.toLocaleString('en-US');

    html += `<td class="number total">${formattedRowSales}</td>`;
    html += `<td class="number total">${formattedRowQty}</td></tr>`;
  });

  // Grand total row
  html += '<tr class="grand-total"><td><strong>Grand Total</strong></td>';
  regions.forEach(region => {
    let colTotalSales = 0;
    let colTotalQty = 0;

    products.forEach(product => {
      colTotalSales += calculateAggregates(
        data,
        'product',
        'region',
        product,
        region,
        'sales'
      );
      colTotalQty += calculateAggregates(
        data,
        'product',
        'region',
        product,
        region,
        'quantity'
      );
    });

    const formattedColSales = colTotalSales.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    const formattedColQty = colTotalQty.toLocaleString('en-US');

    html += `<td class="number">${formattedColSales}</td>`;
    html += `<td class="number">${formattedColQty}</td>`;
  });

  const formattedGrandSales = grandTotalSales.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const formattedGrandQty = grandTotalQty.toLocaleString('en-US');

  html += `<td class="number">${formattedGrandSales}</td>`;
  html += `<td class="number">${formattedGrandQty}</td></tr>`;

  html += '</tbody></table>';

  pivotTableDiv.innerHTML = html;

  // Setup drag and drop
  setupDragAndDrop();

  // Update pagination info
  updatePaginationInfo(products.length);

  // Update state display
  updateStateDisplay();
}

// Setup drag and drop functionality
function setupDragAndDrop() {
  // Row drag and drop
  const rows = document.querySelectorAll('.draggable-row');
  rows.forEach(row => {
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragleave', handleDragLeave);
    row.addEventListener('drop', handleRowDrop);
    row.addEventListener('dragend', handleDragEnd);
  });

  // Column drag and drop
  const headers = document.querySelectorAll('.draggable-header');
  headers.forEach(header => {
    header.addEventListener('dragstart', handleDragStart);
    header.addEventListener('dragover', handleDragOver);
    header.addEventListener('dragleave', handleDragLeave);
    header.addEventListener('drop', handleColumnDrop);
    header.addEventListener('dragend', handleDragEnd);
  });
}

function handleDragStart(e) {
  draggedElement = this;
  dragType = this.getAttribute('data-type');
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.getAttribute('data-index'));
  console.log(`Started dragging ${dragType}:`, this.getAttribute('data-index'));
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  // Add visual feedback
  if (this !== draggedElement) {
    this.classList.add('drag-over');
  }

  return false;
}

function handleDragLeave(e) {
  // Remove visual feedback
  this.classList.remove('drag-over');
}

function handleRowDrop(e) {
  e.stopPropagation();
  e.preventDefault();

  this.classList.remove('drag-over');

  if (draggedElement !== this && dragType === 'row') {
    const fromIndex = parseInt(draggedElement.getAttribute('data-index'));
    const toIndex = parseInt(this.getAttribute('data-index'));

    console.log(`Dropping row from index ${fromIndex} to ${toIndex}`);

    // Reorder the custom product order array
    const [movedProduct] = customProductOrder.splice(fromIndex, 1);
    customProductOrder.splice(toIndex, 0, movedProduct);

    console.log('New product order:', customProductOrder);

    // Re-render the table with new order
    renderPivotTable();
  }

  return false;
}

function handleColumnDrop(e) {
  e.stopPropagation();
  e.preventDefault();

  this.classList.remove('drag-over');

  if (draggedElement !== this && dragType === 'column') {
    const fromIndex = parseInt(draggedElement.getAttribute('data-index'));
    const toIndex = parseInt(this.getAttribute('data-index'));

    console.log(`Dropping column from index ${fromIndex} to ${toIndex}`);

    // Reorder the custom region order array
    const [movedRegion] = customRegionOrder.splice(fromIndex, 1);
    customRegionOrder.splice(toIndex, 0, movedRegion);

    console.log('New region order:', customRegionOrder);

    // Re-render the table with new order
    renderPivotTable();
  }

  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');

  // Remove all drag-over classes
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });

  draggedElement = null;
  dragType = null;
}

// Update pagination info
function updatePaginationInfo(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pageInfo = document.getElementById('page-info');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  // Enable/disable pagination buttons
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Function to update state display
function updateStateDisplay() {
  const state = engine.getState();
  const stateDisplay = document.getElementById('state-display');
  stateDisplay.textContent = JSON.stringify(
    {
      rows: state.rows,
      columns: state.columns,
      measures: state.measures,
      dataCount: state.data?.length || 0,
      currentPage: currentPage,
      pageSize: pageSize,
    },
    null,
    2
  );
}

// File Upload Handler - uses WASM CSV Processor for large files
async function handleFileUpload(file) {
  if (!file) return false;

  try {
    console.log(
      `🚀 Loading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
    );

    // Show loading message for large files
    let loadingMessage = null;
    if (file.size > 1 * 1024 * 1024) {
      // > 1MB
      loadingMessage = document.createElement('div');
      loadingMessage.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 18px; margin-bottom: 10px;">⚡ Processing with WASM</div>
          <div style="font-size: 14px;">${file.name}</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
      `;
      loadingMessage.style.position = 'fixed';
      loadingMessage.style.top = '50%';
      loadingMessage.style.left = '50%';
      loadingMessage.style.transform = 'translate(-50%, -50%)';
      loadingMessage.style.padding = '30px 50px';
      loadingMessage.style.backgroundColor = '#667eea';
      loadingMessage.style.color = 'white';
      loadingMessage.style.borderRadius = '12px';
      loadingMessage.style.fontSize = '16px';
      loadingMessage.style.fontWeight = 'bold';
      loadingMessage.style.zIndex = '9999';
      loadingMessage.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
      document.body.appendChild(loadingMessage);
    }

    let newData;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      console.log('📊 Processing CSV with WASM...');

      // Use WASM CSV Processor if available
      if (getWasmCSVProcessor) {
        try {
          const processor = getWasmCSVProcessor();
          console.log('Initializing WASM module...');
          await processor.initialize();

          console.log('✅ WASM initialized, processing file...');
          const result = await processor.processFile(file, {
            hasHeader: true,
            trimValues: true,
            skipEmptyLines: true,
          });

          if (result.success) {
            newData = result.data;
            console.log(`✅ WASM processing complete!`);
            console.log(`   Rows: ${result.rowCount.toLocaleString()}`);
            console.log(`   Columns: ${result.colCount}`);
            console.log(`   Parse time: ${result.parseTime.toFixed(2)}ms`);
          } else {
            throw new Error(result.error || 'WASM processing failed');
          }
        } catch (wasmError) {
          console.error('WASM processing failed:', wasmError);
          throw wasmError;
        }
      } else {
        throw new Error(
          'WASM CSV Processor not available. Please ensure @mindfiredigital/pivothead is properly installed.'
        );
      }
    } else if (fileName.endsWith('.json')) {
      console.log('📄 Processing JSON...');
      const text = await file.text();
      newData = JSON.parse(text);
    } else {
      if (loadingMessage) document.body.removeChild(loadingMessage);
      alert('Unsupported file format. Please use JSON or CSV files.');
      return false;
    }

    // Remove loading message
    if (loadingMessage) {
      document.body.removeChild(loadingMessage);
    }

    if (newData && newData.length > 0) {
      console.log(
        `✅ Successfully loaded ${newData.length.toLocaleString()} rows`
      );

      salesData = newData;

      // Reconfigure engine with new data
      pivotConfig.data = salesData;
      engine = new PivotEngine(pivotConfig);

      currentPage = 1;

      // Reset custom ordering when new data is loaded
      customProductOrder = [];
      customRegionOrder = [];

      renderPivotTable();

      return true;
    } else {
      alert('No data found in file.');
      return false;
    }
  } catch (error) {
    console.error('❌ Error reading file:', error);

    // More detailed error message
    let errorMsg = 'Error reading file:\n\n';
    if (
      error.message.includes('WASM') ||
      error.message.includes('not available')
    ) {
      errorMsg +=
        '⚠️ WASM module issue. The CSV parser requires WebAssembly support.\n\nPlease ensure:\n1. Your browser supports WASM\n2. The package is properly installed\n3. Try refreshing the page';
    } else if (error.message.includes('JSON')) {
      errorMsg += '⚠️ Invalid JSON format. Please check your file.';
    } else {
      errorMsg += error.message;
    }

    alert(errorMsg);
    return false;
  }
}

// Simple file upload - directly opens file picker
function openFileUpload() {
  // Create hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,.csv';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);

      // Simple confirmation with file size info
      const confirmed = window.confirm(
        `Load data from ${file.name}?\n\nFile size: ${fileSizeMB} MB\nThis will replace the current data.`
      );

      if (confirmed) {
        const success = await handleFileUpload(file);
        if (success) {
          alert(
            `✅ Successfully loaded ${salesData.length.toLocaleString()} rows from ${file.name}!\n\nFile size: ${fileSizeMB} MB`
          );
        }
      }
    }
    // Clean up
    document.body.removeChild(fileInput);
  });

  // Add to body and trigger click
  document.body.appendChild(fileInput);
  fileInput.click();
}

// Event listeners for controls
document.getElementById('sort-sales-asc').addEventListener('click', () => {
  salesData.sort((a, b) => a.sales - b.sales);
  engine = new PivotEngine({ ...pivotConfig, data: salesData });
  renderPivotTable();
});

document.getElementById('sort-sales-desc').addEventListener('click', () => {
  salesData.sort((a, b) => b.sales - a.sales);
  engine = new PivotEngine({ ...pivotConfig, data: salesData });
  renderPivotTable();
});

document.getElementById('reset-table').addEventListener('click', () => {
  // Reset to original data order
  salesData = [
    {
      date: '2024-01-01',
      product: 'Laptop',
      region: 'North',
      sales: 1500,
      quantity: 3,
    },
    {
      date: '2024-01-02',
      product: 'Laptop',
      region: 'South',
      sales: 2000,
      quantity: 4,
    },
    {
      date: '2024-01-03',
      product: 'Mouse',
      region: 'North',
      sales: 150,
      quantity: 10,
    },
    {
      date: '2024-01-04',
      product: 'Mouse',
      region: 'South',
      sales: 200,
      quantity: 15,
    },
    {
      date: '2024-01-05',
      product: 'Keyboard',
      region: 'North',
      sales: 500,
      quantity: 5,
    },
    {
      date: '2024-01-06',
      product: 'Keyboard',
      region: 'South',
      sales: 600,
      quantity: 6,
    },
    {
      date: '2024-01-07',
      product: 'Monitor',
      region: 'North',
      sales: 3000,
      quantity: 8,
    },
    {
      date: '2024-01-08',
      product: 'Monitor',
      region: 'South',
      sales: 3500,
      quantity: 10,
    },
    {
      date: '2024-01-09',
      product: 'Laptop',
      region: 'East',
      sales: 2500,
      quantity: 5,
    },
    {
      date: '2024-01-10',
      product: 'Mouse',
      region: 'East',
      sales: 180,
      quantity: 12,
    },
    {
      date: '2024-01-11',
      product: 'Keyboard',
      region: 'East',
      sales: 550,
      quantity: 7,
    },
    {
      date: '2024-01-12',
      product: 'Monitor',
      region: 'East',
      sales: 3200,
      quantity: 9,
    },
  ];
  pivotConfig.data = salesData;
  engine = new PivotEngine(pivotConfig);
  currentPage = 1;

  // Reset custom ordering
  customProductOrder = [];
  customRegionOrder = [];

  renderPivotTable();
});

// Pagination controls
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPivotTable();
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  const totalPages = Math.ceil(
    [...new Set(salesData.map(item => item.product))].length / pageSize
  );
  if (currentPage < totalPages) {
    currentPage++;
    renderPivotTable();
  }
});

document.getElementById('page-size').addEventListener('change', e => {
  pageSize = parseInt(e.target.value);
  currentPage = 1;
  renderPivotTable();
});

// File upload - directly opens file picker
document
  .getElementById('file-upload-btn')
  .addEventListener('click', openFileUpload);

// Initial render
renderPivotTable();

console.log('✅ PivotHead engine initialized successfully!');
console.log('Current state:', engine.getState());
console.log('Sample data loaded:', salesData.length, 'rows');
