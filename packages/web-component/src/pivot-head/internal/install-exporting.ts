import type { PivotHeadHost } from './host';
import {
  exportToHTML as exportToHTMLHelper,
  exportToPDF as exportToPDFHelper,
  exportToExcel as exportToExcelHelper,
  openPrintDialog as openPrintDialogHelper,
} from './io';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Proto = Record<string, any>;

export function installExporting<T extends PivotHeadHost>(
  klass: Constructor<T>
): void {
  const proto = klass.prototype as unknown as Proto;

  proto.exportToHTML = function (
    this: PivotHeadHost,
    fileName = 'pivot-table'
  ): void {
    exportToHTMLHelper(this, fileName);
  };

  proto.exportToPDF = function (
    this: PivotHeadHost,
    fileName = 'pivot-table'
  ): void {
    exportToPDFHelper(this, fileName);
  };

  proto.exportToExcel = function (
    this: PivotHeadHost,
    fileName = 'pivot-table'
  ): void {
    exportToExcelHelper(this, fileName);
  };

  proto.openPrintDialog = function (this: PivotHeadHost): void {
    openPrintDialogHelper(this);
  };
}
