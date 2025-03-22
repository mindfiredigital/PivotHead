import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

function convertToHtml(pivotEngine) {
  const { state } = pivotEngine;
  const { groups, rows, columns, measures, selectedMeasures, formatting } =
    state;

  // Get unique column values (regions)
  const uniqueColumns = [
    ...new Set(state.data.map(item => item[columns[0].uniqueName])),
  ];

  // Get unique row values (products)
  const uniqueRows = [
    ...new Set(state.data.map(item => item[rows[0].uniqueName])),
  ];

  const formatValue = (value, formatConfig) => {
    if (value === 0) return '$0.00';
    if (!value && value !== 0) return '';

    if (formatConfig.type === 'currency') {
      return new Intl.NumberFormat(formatConfig.locale, {
        style: 'currency',
        currency: formatConfig.currency,
        minimumFractionDigits: formatConfig.decimals,
        maximumFractionDigits: formatConfig.decimals,
      }).format(value);
    } else if (formatConfig.type === 'number') {
      return new Intl.NumberFormat(formatConfig.locale, {
        minimumFractionDigits: formatConfig.decimals,
        maximumFractionDigits: formatConfig.decimals,
      }).format(value);
    }

    return value;
  };

  const conditionalFormatting = pivotEngine.config?.conditionalFormatting || [];

  // Determine cell background based on conditional formatting
  const getCellStyle = (value, measureName) => {
    return '';
  };

  // Create HTML string
  let html = `
  <div class="pivot-export">
    <style>
      .pivot-table {
        border-collapse: collapse;
        width: 100%;
        font-family: Arial, sans-serif;
      }
      .pivot-table th, .pivot-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: right;
      }
      .pivot-table th {
        background-color: #f2f2f2;
        font-weight: bold;
        text-align: center;
        position: relative;
      }
      .pivot-table .sort-icon::after {
        content: "↕";
        position: absolute;
        right: 4px;
        opacity: 0.5;
      }
      .pivot-table th.region-header {
        border-bottom: none;
      }
      .pivot-table th.measure-header {
        border-top: none;
      }
      .pivot-table .row-header {
        text-align: left;
        font-weight: bold;
        background-color: #f9f9f9;
      }
      .pivot-table .corner-header {
        background-color: #f2f2f2;
        border-bottom: 1px solid #ddd;
      }
      .pagination {
        margin-top: 15px;
        font-family: Arial, sans-serif;
      }
      .export-info {
        margin-top: 15px;
        font-size: 0.8em;
        color: #666;
        font-family: Arial, sans-serif;
      }
    </style>
    
    <table class="pivot-table">
      <thead>
        <tr>
          <th rowspan="2" class="corner-header">${rows[0].caption} /<br>Region</th>`;

  // Add region headers
  uniqueColumns.forEach(column => {
    html += `<th colspan="3" class="region-header">${column}</th>`;
  });

  html += `
        </tr>
        <tr>`;

  // Add measure headers under each region
  uniqueColumns.forEach(column => {
    selectedMeasures.forEach(measure => {
      html += `<th class="measure-header sort-icon">${measure.caption}</th>`;
    });
  });

  html += `
        </tr>
      </thead>
      <tbody>`;

  // Add data rows
  uniqueRows.forEach(row => {
    html += `<tr>
      <td class="row-header">${row}</td>`;

    // Add cells for each column (region)
    uniqueColumns.forEach(column => {
      // Find the group that matches this row and column
      const group = groups.find(g => g.key === `${row} - ${column}`);

      selectedMeasures.forEach(measure => {
        const measureKey = `sum_${measure.uniqueName}`;
        let value = group ? group.aggregates[measureKey] : 0;

        // Apply conditional formatting
        const cellStyle = getCellStyle(value, measure.uniqueName);

        // Format value according to measure settings
        const formattedValue = formatValue(
          value,
          formatting[measure.uniqueName]
        );

        html += `<td${cellStyle}>${formattedValue}</td>`;
      });
    });

    html += `</tr>`;
  });

  html += `
      </tbody>
    </table>
    
    <div class="pagination">
      Page ${pivotEngine.paginationConfig.currentPage} of ${pivotEngine.paginationConfig.totalPages}
    </div>
    
    <div class="export-info">
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>`;
  return html;
}

export function exportToHTML(pivotEngine, fileName = 'pivot-table') {
  const htmlContent = convertToHtml(pivotEngine);

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.html`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export pivot table data to Excel
 * @param {PivotEngine} pivotEngine - The PivotEngine instance containing the data
 * @param {string} fileName - The name for the downloaded file (without extension)
 */
export function exportToExcel(pivotEngine, fileName = 'pivot-table') {
  try {
    // Check if xlsx is available
    if (typeof XLSX === 'undefined') {
      // Dynamically load SheetJS if it's not already loaded
      loadSheetJS()
        .then(() => {
          generateExcel(pivotEngine, fileName);
        })
        .catch(error => {
          console.error('Error loading SheetJS:', error);
          alert(
            'Failed to load Excel generation library. Please try again later.'
          );
        });
    } else {
      // SheetJS is already loaded, generate the Excel file directly
      generateExcel(pivotEngine, fileName);
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel: ' + error.message);
  }
}

/**
 * Dynamically load SheetJS library , it requires if not already loaded
 * @returns {Promise} A promise that resolves when SheetJS is loaded
 */
function loadSheetJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Generate Excel file from pivot table data
 * @param {PivotEngine} pivotEngine - The PivotEngine instance
 * @param {string} fileName - The name for the downloaded file
 */
function generateExcel(pivotEngine, fileName) {
  // Get the state from the pivot engine
  const state = pivotEngine.getState();

  if (!state.data || state.data.length === 0) {
    alert('No data to export!');
    return;
  }

  // Get dimension and measure configurations
  const rows = state.rows || [];
  const columns = state.columns || [];
  const measures = state.measures || [];

  // Extract unique regions and products (or other dimension values)
  // This assumes a structure with product and region, but can be adapted for your data
  const rowDimension = rows[0]?.uniqueName || 'product';
  const colDimension = columns[0]?.uniqueName || 'region';

  const uniqueRowValues = [
    ...new Set(state.data.map(item => item[rowDimension])),
  ];
  const uniqueColValues = [
    ...new Set(state.data.map(item => item[colDimension])),
  ];

  // Create header rows
  // First row: Column headers with appropriate spans
  const headerRow = [
    rows[0]?.caption || 'Dimension',
    ...uniqueColValues.flatMap(colValue =>
      measures.map(measure => `${colValue} - ${measure.caption}`)
    ),
  ];

  // Create data rows
  const dataRows = uniqueRowValues.map(rowValue => {
    const row = [rowValue];

    uniqueColValues.forEach(colValue => {
      measures.forEach(measure => {
        // Filter data for this row and column intersection
        const filteredData = state.data.filter(
          item =>
            item[rowDimension] === rowValue && item[colDimension] === colValue
        );

        // Calculate the aggregated value
        let value = 0;
        if (filteredData.length > 0) {
          switch (measure.aggregation) {
            case 'sum':
              value = filteredData.reduce(
                (sum, item) => sum + (item[measure.uniqueName] || 0),
                0
              );
              break;
            case 'avg':
              if (measure.formula && typeof measure.formula === 'function') {
                value =
                  filteredData.reduce(
                    (sum, item) => sum + measure.formula(item),
                    0
                  ) / filteredData.length;
              } else {
                value =
                  filteredData.reduce(
                    (sum, item) => sum + (item[measure.uniqueName] || 0),
                    0
                  ) / filteredData.length;
              }
              break;
            case 'max':
              value = Math.max(
                ...filteredData.map(item => item[measure.uniqueName] || 0)
              );
              break;
            case 'min':
              value = Math.min(
                ...filteredData.map(item => item[measure.uniqueName] || 0)
              );
              break;
            case 'count':
              value = filteredData.length;
              break;
            default:
              value = 0;
          }
        }

        // For Excel, we keep the raw numeric value
        row.push(value);
      });
    });

    return row;
  });

  // Add a totals row if available
  if (state.processedData && state.processedData.totals) {
    const totalsRow = ['Total'];

    uniqueColValues.forEach(colValue => {
      measures.forEach(measure => {
        // Get total for this measure across all data
        const totalValue = state.processedData.totals[measure.uniqueName] || 0;
        totalsRow.push(totalValue);
      });
    });

    dataRows.push(totalsRow);
  }

  // Combine header and data rows
  const allRows = [headerRow, ...dataRows];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Apply some basic styling
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Set column widths
  const colWidths = [];
  for (let i = 0; i <= range.e.c; i++) {
    colWidths[i] = { wch: i === 0 ? 15 : 12 }; // First column wider, data columns standard
  }
  ws['!cols'] = colWidths;

  // Apply number formatting for data cells
  for (let row = 1; row <= dataRows.length; row++) {
    for (let col = 1; col <= uniqueColValues.length * measures.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

      // Find the measure for this column
      const measureIndex = (col - 1) % measures.length;
      const measure = measures[measureIndex];

      if (measure && measure.format && ws[cellAddress]) {
        if (measure.format.type === 'currency') {
          // Apply currency format
          ws[cellAddress].z =
            measure.format.currency === 'USD'
              ? '"$"#,##0.00'
              : `"${measure.format.currency}"#,##0.00`;
        } else if (
          measure.format.type === 'number' &&
          measure.format.decimals !== undefined
        ) {
          // Apply decimal format
          const format =
            '#,##0' +
            (measure.format.decimals > 0
              ? '.' + '0'.repeat(measure.format.decimals)
              : '');
          ws[cellAddress].z = format;
        } else if (measure.format.type === 'percentage') {
          // Apply percentage format
          ws[cellAddress].z = '0.00%';
          // Convert decimal to percentage for display
          if (typeof ws[cellAddress].v === 'number') {
            ws[cellAddress].v = ws[cellAddress].v / 100;
          }
        }
      }
    }
  }

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pivot Table');

  // Generate Excel file and download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * Export pivot table data to PDF using jspdf-autotable
 * @param {Object} pivotEngine - The pivot engine containing data
 * @param {string} fileName - Name for the exported file (without extension)
 */
export function exportToPDF(pivotEngine, fileName = 'pivot-table') {
  // Convert pivot data to an HTML table
  const htmlContent = convertToHtml(pivotEngine, fileName);

  // Create a temporary container for the HTML
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px'; // Hide off-screen
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // Extract the table from the container
  const tableElement = container.querySelector('table');

  if (!tableElement) {
    console.error('No table found in the generated HTML');
    document.body.removeChild(container);
    return;
  }

  // Create a new PDF document
  const pdf = new jsPDF();

  // Add title
  pdf.setFontSize(16);
  pdf.text(fileName, pdf.internal.pageSize.getWidth() / 2, 15, {
    align: 'center',
  });

  // Use autoTable to convert the HTML table to PDF
  autoTable(pdf, {
    html: tableElement,
    startY: 25,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    // Improve alignment and spacing
    columnStyles: {},
    margin: { top: 25, right: 15, bottom: 25, left: 15 },
    // Add page numbers
    didDrawPage: data => {
      pdf.setFontSize(10);
      pdf.text(
        `Page ${data.pageNumber}`,
        pdf.internal.pageSize.getWidth() - 20,
        pdf.internal.pageSize.getHeight() - 10
      );
    },
  });

  // Save the PDF
  pdf.save(`${fileName}.pdf`);

  // Clean up
  document.body.removeChild(container);
}
