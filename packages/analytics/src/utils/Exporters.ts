/**
 * Chart Export Utilities for PivotHead Analytics
 * Provides functionality to export charts as images and data
 */

import type { ChartInstance } from '../types/renderer-types';
import type { ChartData } from '../types';

/**
 * Export format options
 */
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'csv' | 'json';

/**
 * Export options configuration
 */
export interface ExportOptions {
  /**
   * Export format
   */
  format: ExportFormat;

  /**
   * Output filename (without extension)
   */
  filename?: string;

  /**
   * Image width in pixels (for image formats)
   */
  width?: number;

  /**
   * Image height in pixels (for image formats)
   */
  height?: number;

  /**
   * Image quality (0-1, for PNG/JPEG)
   */
  quality?: number;

  /**
   * Background color (for image formats)
   */
  backgroundColor?: string;

  /**
   * Include headers in CSV export
   */
  includeHeaders?: boolean;

  /**
   * CSV delimiter character
   */
  csvDelimiter?: string;

  /**
   * Pretty print JSON output
   */
  prettyPrint?: boolean;
}

/**
 * Default export options
 */
const DEFAULT_OPTIONS: Partial<ExportOptions> = {
  quality: 0.95,
  backgroundColor: '#ffffff',
  includeHeaders: true,
  csvDelimiter: ',',
  prettyPrint: true,
};

/**
 * ChartExporter provides static methods for exporting charts
 */
export class ChartExporter {
  /**
   * Export chart as PNG image
   * @param canvas - The canvas element to export
   * @param options - Export options
   * @returns Promise resolving to Blob
   */
  static async exportPng(
    canvas: HTMLCanvasElement,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    const { quality, backgroundColor } = { ...DEFAULT_OPTIONS, ...options };

    // If background color is specified, create a new canvas with background
    let exportCanvas = canvas;
    if (backgroundColor && backgroundColor !== 'transparent') {
      exportCanvas = document.createElement('canvas');
      exportCanvas.width = options.width || canvas.width;
      exportCanvas.height = options.height || canvas.height;

      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        // Draw original canvas
        ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
      }
    }

    return new Promise((resolve, reject) => {
      exportCanvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        quality
      );
    });
  }

  /**
   * Export chart as SVG
   * @param canvas - The canvas element to export
   * @param options - Export options
   * @returns SVG string
   */
  static exportSvg(
    canvas: HTMLCanvasElement,
    options: Partial<ExportOptions> = {}
  ): string {
    const width = options.width || canvas.width;
    const height = options.height || canvas.height;
    const backgroundColor =
      options.backgroundColor || DEFAULT_OPTIONS.backgroundColor;

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png', options.quality || 0.95);

    // Wrap in SVG
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}"
     height="${height}"
     viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <image xlink:href="${dataUrl}" width="${width}" height="${height}"/>
</svg>`;

    return svg;
  }

  /**
   * Export chart as PDF
   * Requires jsPDF library to be installed
   * @param canvas - The canvas element to export
   * @param options - Export options
   * @returns Promise resolving to Blob
   */
  static async exportPdf(
    canvas: HTMLCanvasElement,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    try {
      // Dynamic import to avoid bundling jsPDF if not needed
      const { jsPDF } = await import('jspdf');

      const width = options.width || canvas.width;
      const height = options.height || canvas.height;

      // Determine orientation based on aspect ratio
      const orientation = width > height ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [width, height],
      });

      // Add background if specified
      if (
        options.backgroundColor &&
        options.backgroundColor !== 'transparent'
      ) {
        pdf.setFillColor(options.backgroundColor);
        pdf.rect(0, 0, width, height, 'F');
      }

      // Add image
      const imgData = canvas.toDataURL('image/png', options.quality || 0.95);
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);

      return pdf.output('blob');
    } catch (error) {
      throw new Error(
        'PDF export requires jsPDF library. Install it with: npm install jspdf'
      );
    }
  }

  /**
   * Export chart data as CSV
   * @param data - Chart data object
   * @param options - Export options
   * @returns CSV string
   */
  static exportCsv(
    data: ChartData,
    options: Partial<ExportOptions> = {}
  ): string {
    const { includeHeaders = true, csvDelimiter = ',' } = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const { labels, datasets } = data;

    if (!labels || !datasets || datasets.length === 0) {
      throw new Error('Invalid chart data for CSV export');
    }

    const lines: string[] = [];

    // Header row
    if (includeHeaders) {
      const headers = [
        'Category',
        ...datasets.map(d => this.escapeCsvValue(d.label, csvDelimiter)),
      ];
      lines.push(headers.join(csvDelimiter));
    }

    // Data rows
    labels.forEach((label, idx) => {
      const row = [
        this.escapeCsvValue(String(label), csvDelimiter),
        ...datasets.map(d => {
          const value = d.data[idx];
          return value !== undefined && value !== null ? String(value) : '';
        }),
      ];
      lines.push(row.join(csvDelimiter));
    });

    return lines.join('\n');
  }

  /**
   * Export chart data as JSON
   * @param data - Chart data object
   * @param options - Export options
   * @returns JSON string
   */
  static exportJson(
    data: unknown,
    options: Partial<ExportOptions> = {}
  ): string {
    const { prettyPrint = true } = { ...DEFAULT_OPTIONS, ...options };
    return JSON.stringify(data, null, prettyPrint ? 2 : undefined);
  }

  /**
   * Download content as a file
   * @param content - Content to download (Blob or string)
   * @param filename - Filename with extension
   * @param mimeType - MIME type for string content
   */
  static download(
    content: Blob | string,
    filename: string,
    mimeType?: string
  ): void {
    let url: string;

    if (content instanceof Blob) {
      url = URL.createObjectURL(content);
    } else {
      const type = mimeType || 'text/plain;charset=utf-8';
      const blob = new Blob([content], { type });
      url = URL.createObjectURL(blob);
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Export chart using specified format and download
   * @param chart - Chart instance
   * @param data - Chart data (for CSV/JSON export)
   * @param options - Export options
   */
  static async export(
    chart: ChartInstance,
    data: ChartData,
    options: ExportOptions
  ): Promise<void> {
    const { format, filename = `chart-${Date.now()}` } = options;
    const canvas = chart.getCanvas();

    switch (format) {
      case 'png': {
        if (!canvas) throw new Error('Canvas not available for PNG export');
        const blob = await this.exportPng(canvas, options);
        this.download(blob, `${filename}.png`);
        break;
      }

      case 'svg': {
        if (!canvas) throw new Error('Canvas not available for SVG export');
        const svg = this.exportSvg(canvas, options);
        this.download(svg, `${filename}.svg`, 'image/svg+xml');
        break;
      }

      case 'pdf': {
        if (!canvas) throw new Error('Canvas not available for PDF export');
        const blob = await this.exportPdf(canvas, options);
        this.download(blob, `${filename}.pdf`);
        break;
      }

      case 'csv': {
        const csv = this.exportCsv(data, options);
        this.download(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
        break;
      }

      case 'json': {
        const json = this.exportJson(data, options);
        this.download(json, `${filename}.json`, 'application/json');
        break;
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get blob for a specific format without downloading
   * @param chart - Chart instance
   * @param data - Chart data
   * @param options - Export options
   * @returns Promise resolving to Blob
   */
  static async getBlob(
    chart: ChartInstance,
    data: ChartData,
    options: ExportOptions
  ): Promise<Blob> {
    const { format } = options;
    const canvas = chart.getCanvas();

    switch (format) {
      case 'png': {
        if (!canvas) throw new Error('Canvas not available');
        return this.exportPng(canvas, options);
      }

      case 'svg': {
        if (!canvas) throw new Error('Canvas not available');
        const svg = this.exportSvg(canvas, options);
        return new Blob([svg], { type: 'image/svg+xml' });
      }

      case 'pdf': {
        if (!canvas) throw new Error('Canvas not available');
        return this.exportPdf(canvas, options);
      }

      case 'csv': {
        const csv = this.exportCsv(data, options);
        return new Blob([csv], { type: 'text/csv;charset=utf-8' });
      }

      case 'json': {
        const json = this.exportJson(data, options);
        return new Blob([json], { type: 'application/json' });
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Escape a value for CSV format
   */
  private static escapeCsvValue(value: string, delimiter: string): string {
    // If value contains delimiter, quotes, or newlines, wrap in quotes
    if (
      value.includes(delimiter) ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      // Escape existing quotes by doubling them
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

/**
 * Convenience function to export a chart
 */
export async function exportChart(
  chart: ChartInstance,
  data: ChartData,
  options: ExportOptions
): Promise<void> {
  return ChartExporter.export(chart, data, options);
}

/**
 * Convenience function to get chart as blob
 */
export async function getChartBlob(
  chart: ChartInstance,
  data: ChartData,
  options: ExportOptions
): Promise<Blob> {
  return ChartExporter.getBlob(chart, data, options);
}
