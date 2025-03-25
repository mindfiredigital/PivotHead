export function exportToHTML(pivotEngine, fileName = 'pivot-table') {
  pivotEngine.exportToHTML(fileName);
}

export function exportToExcel(pivotEngine, fileName = 'pivot-table') {
  pivotEngine.exportToExcel(fileName);
}

export function exportToPDF(pivotEngine, fileName = 'pivot-table') {
  pivotEngine.exportToPDF(fileName);
}

export function openPrintDialog(pivotEngine) {
  pivotEngine.openPrintDialog();
}
