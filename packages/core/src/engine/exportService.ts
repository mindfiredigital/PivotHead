import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import {
  PivotTableState,
  FormatOptions,
  DataRecord,
  CellValue,
} from '../types/interfaces';
import { logger } from '../logger/logger.js';

/**
 * Escapes HTML special characters to prevent XSS in generated HTML exports.
 */
function escapeHtml(value: unknown): string {
  const str = value == null ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Service class for handling export operations for the PivotEngine
 */
export class PivotExportService {
  /**
   * Converts the pivot table data to HTML
   * @param {PivotTableState<T>} state - The current state of the pivot table
   * @returns {string} HTML string representation of the pivot table
   */
  public static convertToHtml<T extends DataRecord>(
    state: PivotTableState<T>
  ): string {
    const { rows, columns, selectedMeasures, formatting, rawData } = state;

    if (rawData.length === 0) {
      return '<div>No data to display</div>';
    }

    if (!rows.length || !columns.length) {
      return '<div>No data to display</div>';
    }

    // Get unique column values
    const uniqueColumns = [
      ...new Set(rawData.map(item => item[columns[0].uniqueName])),
    ];

    // Get unique row values
    const uniqueRows = [
      ...new Set(rawData.map(item => item[rows[0].uniqueName])),
    ];

    const formatValue = (
      value: number,
      formatConfig: FormatOptions | undefined
    ): string => {
      if (value === 0) return '$0.00';
      if (!value && value !== 0) return '';

      if (formatConfig && formatConfig.type === 'currency') {
        return new Intl.NumberFormat(formatConfig.locale, {
          style: 'currency',
          currency: formatConfig.currency,
          minimumFractionDigits: formatConfig.decimals,
          maximumFractionDigits: formatConfig.decimals,
        }).format(value);
      } else if (formatConfig && formatConfig.type === 'number') {
        return new Intl.NumberFormat(formatConfig.locale, {
          minimumFractionDigits: formatConfig.decimals,
          maximumFractionDigits: formatConfig.decimals,
        }).format(value);
      }

      return String(value);
    };

    // Determine cell background based on conditional formatting (placeholder function)
    const getCellStyle = (_value: number, _measureName: string): string => {
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
          <th rowspan="2" class="corner-header">${escapeHtml(
            rows[0]?.caption || rows[0]?.uniqueName || ''
          )} /<br>Region</th>`;

    // Add region headers
    uniqueColumns.forEach(column => {
      html += `<th colspan="${selectedMeasures.length}" class="region-header">${escapeHtml(column)}</th>`;
    });

    html += `
        </tr>
        <tr>`;

    // Add measure headers under each region
    uniqueColumns.forEach(() => {
      selectedMeasures.forEach(measure => {
        html += `<th class="measure-header sort-icon">${escapeHtml(
          measure.caption || measure.uniqueName
        )}</th>`;
      });
    });

    html += `
        </tr>
      </thead>
      <tbody>`;

    // Add data rows
    uniqueRows.forEach(row => {
      html += `<tr>
      <td class="row-header">${escapeHtml(row)}</td>`;

      // Add cells for each column (region)
      uniqueColumns.forEach(column => {
        selectedMeasures.forEach(measure => {
          // Filter data for this row and column intersection
          const filteredData = rawData.filter(
            (item: T) =>
              item[rows[0].uniqueName] === row &&
              item[columns[0].uniqueName] === column
          );

          // Calculate the aggregated value
          let value = 0;
          if (filteredData.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredData.reduce(
                  (sum: number, item: T) =>
                    sum + (Number(item[measure.uniqueName]) || 0),
                  0
                );
                break;
              case 'avg':
                if (measure?.formula && typeof measure.formula === 'function') {
                  value =
                    filteredData.reduce(
                      (sum: number, item: T) =>
                        sum + (measure.formula?.(item) || 0),
                      0
                    ) / filteredData.length;
                } else {
                  value =
                    filteredData.reduce(
                      (sum: number, item: T) =>
                        sum + (Number(item[measure.uniqueName]) || 0),
                      0
                    ) / filteredData.length;
                }
                break;
              case 'max':
                value = Math.max(
                  ...filteredData.map(
                    (item: T) => Number(item[measure.uniqueName]) || 0
                  )
                );
                break;
              case 'min':
                value = Math.min(
                  ...filteredData.map(
                    (item: T) => Number(item[measure.uniqueName]) || 0
                  )
                );
                break;
              case 'count':
                value = filteredData.length;
                break;
              default:
                value = 0;
            }
          }

          // Apply conditional formatting
          const cellStyle = getCellStyle(value, measure.uniqueName);

          // Format value according to measure settings
          const formattedValue = formatValue(
            value,
            formatting[measure.uniqueName]
          );

          html += `<td${cellStyle}>${escapeHtml(formattedValue)}</td>`;
        });
      });

      html += `</tr>`;
    });

    html += `
      </tbody>
    </table>

    <div class="pagination">
      Page ${state.paginationConfig?.currentPage || 1} of ${
        state.paginationConfig?.totalPages || 1
      }
    </div>

    <div class="export-info">
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>`;

    return html;
  }

  /**
   * Exports the pivot table data to HTML and downloads the file
   * @param {PivotTableState<T>} state - The current state of the pivot table
   * @param {string} fileName - The name of the downloaded file (without extension)
   */
  public static exportToHTML<T extends DataRecord>(
    state: PivotTableState<T>,
    fileName = 'pivot-table'
  ): void {
    logger.info(
      'PivotExportService.exportToHTML called with fileName:',
      fileName
    );
    logger.info('State rawData length:', state.rawData?.length || 0);

    const htmlContent = PivotExportService.convertToHtml(state);
    logger.info('HTML content length:', htmlContent.length);

    // Wrap in full HTML document
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(fileName)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .pivot-export { max-width: 100%; overflow-x: auto; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    logger.info('Full HTML length:', fullHtml.length);

    const dataUrl =
      'data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml);
    logger.info('Data URL created, length:', dataUrl.length);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    logger.info('Clicking download link...');
    a.click();

    document.body.removeChild(a);
    logger.info('HTML export completed');
  }

  /**
   * Exports the pivot table data to PDF and downloads the file
   * @param {PivotTableState<T>} state - The current state of the pivot table
   * @param {string} fileName - The name of the downloaded file (without extension)
   */
  public static exportToPDF<T extends DataRecord>(
    state: PivotTableState<T>,
    fileName = 'pivot-table'
  ): void {
    logger.info(
      'PivotExportService.exportToPDF called with fileName:',
      fileName
    );
    logger.info('State rawData length:', state.rawData?.length || 0);

    // Convert pivot data to an HTML table
    const htmlContent = PivotExportService.convertToHtml(state);
    logger.info('HTML content length for PDF:', htmlContent.length);

    // Create a temporary container for the HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Hide off-screen
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Extract the table from the container
    const tableElement = container.querySelector('table');

    if (!tableElement) {
      logger.error('No table found in the generated HTML');
      document.body.removeChild(container);
      return;
    }

    logger.info('Table element found, proceeding with PDF generation');

    try {
      // Create a new PDF document
      logger.info('Creating jsPDF instance...');
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
        columnStyles: {},
        margin: { top: 25, right: 15, bottom: 25, left: 15 },
        didDrawPage: (data: { pageNumber: number }) => {
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
    } catch (error) {
      logger.error('Error exporting to PDF:', error);
      document.body.removeChild(container);
    }
  }

  /**
   * Exports the pivot table data to Excel and downloads the file
   * @param {PivotTableState<T>} state - The current state of the pivot table
   * @param {string} fileName - The name of the downloaded file (without extension)
   */
  public static exportToExcel<T extends DataRecord>(
    state: PivotTableState<T>,
    fileName = 'pivot-table'
  ): void {
    logger.info(
      'PivotExportService.exportToExcel called with fileName:',
      fileName
    );
    logger.info('State rawData length:', state.rawData?.length || 0);

    try {
      PivotExportService.generateExcel(state, fileName);
    } catch (error) {
      logger.error('Error exporting to Excel:', error);
    }
  }

  /**
   * Generates an Excel file from the pivot table data
   * @param {PivotTableState<T>} state - The current state of the pivot table
   * @param {string} fileName - The name of the downloaded file (without extension)
   */
  private static generateExcel<T extends DataRecord>(
    state: PivotTableState<T>,
    fileName: string
  ): void {
    if (!state.data || state.data.length === 0) {
      logger.info('No data to export!');
      return;
    }

    // Get dimension and measure configurations
    const rows = state.rows || [];
    const columns = state.columns || [];
    const measures = state.measures || [];

    // Extract unique dimension values
    const rowDimension = rows[0]?.uniqueName;
    const colDimension = columns[0]?.uniqueName;

    if (!rowDimension || !colDimension) {
      logger.info('Missing row or column dimension');
      return;
    }

    const uniqueRowValues = [
      ...new Set(state.data.map(item => item[rowDimension])),
    ];
    const uniqueColValues = [
      ...new Set(state.data.map(item => item[colDimension])),
    ];

    // Create header rows
    const headerRow: CellValue[] = [
      rows[0]?.caption || 'Dimension',
      ...uniqueColValues.flatMap(colValue =>
        measures.map(
          measure => `${colValue} - ${measure.caption || measure.uniqueName}`
        )
      ),
    ];

    // Create data rows
    const dataRows = uniqueRowValues.map(rowValue => {
      const row: CellValue[] = [rowValue as CellValue];

      uniqueColValues.forEach(colValue => {
        measures.forEach(measure => {
          // Filter data for this row and column intersection
          const filteredData = state.data.filter(
            (item: T) =>
              item[rowDimension] === rowValue && item[colDimension] === colValue
          );

          // Calculate the aggregated value
          let value = 0;
          if (filteredData.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredData.reduce(
                  (sum: number, item: T) =>
                    sum + (Number(item[measure.uniqueName]) || 0),
                  0
                );
                break;
              case 'avg':
                if (
                  measure?.formula &&
                  typeof measure.formula === 'function' &&
                  filteredData.length > 0
                ) {
                  value =
                    filteredData.reduce(
                      (sum: number, item: T) =>
                        sum + (measure.formula?.(item) || 0),
                      0
                    ) / filteredData.length;
                } else {
                  value =
                    filteredData.reduce(
                      (sum: number, item: T) =>
                        sum + (Number(item[measure.uniqueName]) || 0),
                      0
                    ) / filteredData.length;
                }
                break;
              case 'max':
                value = Math.max(
                  ...filteredData.map(
                    (item: T) => Number(item[measure.uniqueName]) || 0
                  )
                );
                break;
              case 'min':
                value = Math.min(
                  ...filteredData.map(
                    (item: T) => Number(item[measure.uniqueName]) || 0
                  )
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
      const totalsRow: CellValue[] = ['Total'];

      uniqueColValues.forEach(() => {
        measures.forEach(measure => {
          // Get total for this measure across all data
          const totalValue =
            state.processedData.totals[measure.uniqueName] || 0;
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
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:A1');

    // Set column widths
    const colWidths = [];
    for (let i = 0; i <= range.e.c; i++) {
      colWidths[i] = { wch: i === 0 ? 15 : 12 }; // First column wider, data columns standard
    }
    ws['!cols'] = colWidths;

    // Apply number formatting for data cells
    for (let row = 1; row <= dataRows.length; row++) {
      for (
        let col = 1;
        col <= uniqueColValues.length * measures.length;
        col++
      ) {
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
   * Opens a print dialog with formatted pivot table content
   * @param {PivotTableState<T>} state - The current state of the pivot table
   * @param {string} title - Optional title for the printed page
   */
  public static openPrintDialog<T extends DataRecord>(
    state: PivotTableState<T>
  ): void {
    const htmlContent = PivotExportService.convertToHtml(state);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      logger.error('Failed to open print dialog');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}
