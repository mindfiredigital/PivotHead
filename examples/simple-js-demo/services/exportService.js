export function exportToHTML(pivotEngine, fileName = 'pivot-table') {
  console.log('Calling pivotEngine.exportToHTML with fileName:', fileName);
  pivotEngine.exportToHTML(fileName);
}

export function exportToExcel(pivotEngine, fileName = 'pivot-table') {
  console.log('Calling pivotEngine.exportToExcel with fileName:', fileName);
  pivotEngine.exportToExcel(fileName);
}

export function exportToPDF(pivotEngine, fileName = 'pivot-table') {
  console.log('Calling pivotEngine.exportToPDF with fileName:', fileName);
  pivotEngine.exportToPDF(fileName);
}

export function openPrintDialog(pivotEngine) {
  pivotEngine.openPrintDialog();
}
