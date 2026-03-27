'use strict';
import { logger } from '../../logger.js';

export function exportToHTML(pivotEngine, fileName = 'pivot-table') {
  logger.info('Calling pivotEngine.exportToHTML with fileName:', fileName);
  pivotEngine.exportToHTML(fileName);
}

export function exportToExcel(pivotEngine, fileName = 'pivot-table') {
  logger.info('Calling pivotEngine.exportToExcel with fileName:', fileName);
  pivotEngine.exportToExcel(fileName);
}

export function exportToPDF(pivotEngine, fileName = 'pivot-table') {
  logger.info('Calling pivotEngine.exportToPDF with fileName:', fileName);
  pivotEngine.exportToPDF(fileName);
}

export function openPrintDialog(pivotEngine) {
  pivotEngine.openPrintDialog();
}
