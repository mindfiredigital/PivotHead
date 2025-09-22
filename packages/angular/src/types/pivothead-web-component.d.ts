declare module '@mindfiredigital/pivothead-web-component' {
  export interface PivotHeadElement {
    data: any;
    options: any;
    setAttribute(name: string, value: string): void;
    addEventListener(type: string, listener: (event: Event) => void): void;
    refresh(): void;
    sort(field: string, direction: 'asc' | 'desc'): void;
    exportToExcel(fileName?: string): void;
  }

  export interface PivotOptions {
    [key: string]: any;
  }

  export interface PivotDataRecord {
    [key: string]: any;
  }
}
