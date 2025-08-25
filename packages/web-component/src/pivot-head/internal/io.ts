import type { PivotHeadHost } from './host';

// Exporting helpers
export function exportToHTML(
  host: PivotHeadHost,
  fileName = 'pivot-table'
): void {
  if (!host.engine) {
    console.error('Engine not initialized. Cannot export to HTML.');
    return;
  }
  host.engine.exportToHTML(fileName);
}

export function exportToPDF(
  host: PivotHeadHost,
  fileName = 'pivot-table'
): void {
  if (!host.engine) {
    console.error('Engine not initialized. Cannot export to PDF.');
    return;
  }
  host.engine.exportToPDF(fileName);
}

export function exportToExcel(
  host: PivotHeadHost,
  fileName = 'pivot-table'
): void {
  if (!host.engine) {
    console.error('Engine not initialized. Cannot export to Excel.');
    return;
  }
  host.engine.exportToExcel(fileName);
}

export function openPrintDialog(host: PivotHeadHost): void {
  if (!host.engine) {
    console.error('Engine not initialized. Cannot open print dialog.');
    return;
  }
  host.engine.openPrintDialog();
}

// File I/O helpers
export function loadFromFile(host: PivotHeadHost, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          host.data = data;
          resolve();
        } else {
          reject(new Error('Failed to read file as text'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function loadFromUrl(host: PivotHeadHost, url: string): Promise<void> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data from ${url}: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(data => {
      host.data = data;
    });
}
