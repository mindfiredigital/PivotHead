/**
 * Color Palettes for PivotHead Analytics
 * Provides pre-defined color schemes and color management utilities
 */

/**
 * Pre-defined color palettes for chart visualizations
 */
export const ColorPalettes = {
  /**
   * Tableau 10 - A popular, visually distinct color palette
   */
  tableau10: [
    '#4e79a7',
    '#f28e2c',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
  ],

  /**
   * Color-blind friendly palette - accessible for color vision deficiencies
   */
  colorBlind: [
    '#006BA4',
    '#FF800E',
    '#ABABAB',
    '#595959',
    '#5F9ED1',
    '#C85200',
    '#898989',
    '#A2C8EC',
    '#FFBC79',
    '#CFCFCF',
  ],

  /**
   * D3 Category 10 - Classic categorical color scheme
   */
  categorical: [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
  ],

  /**
   * Sequential Blues - For single-hue gradients
   */
  sequentialBlues: [
    '#f7fbff',
    '#deebf7',
    '#c6dbef',
    '#9ecae1',
    '#6baed6',
    '#4292c6',
    '#2171b5',
    '#08519c',
    '#08306b',
  ],

  /**
   * Sequential Greens - For single-hue gradients
   */
  sequentialGreens: [
    '#f7fcf5',
    '#e5f5e0',
    '#c7e9c0',
    '#a1d99b',
    '#74c476',
    '#41ab5d',
    '#238b45',
    '#006d2c',
    '#00441b',
  ],

  /**
   * Sequential Reds - For single-hue gradients
   */
  sequentialReds: [
    '#fff5f0',
    '#fee0d2',
    '#fcbba1',
    '#fc9272',
    '#fb6a4a',
    '#ef3b2c',
    '#cb181d',
    '#a50f15',
    '#67000d',
  ],

  /**
   * Sequential Oranges - For single-hue gradients
   */
  sequentialOranges: [
    '#fff5eb',
    '#fee6ce',
    '#fdd0a2',
    '#fdae6b',
    '#fd8d3c',
    '#f16913',
    '#d94801',
    '#a63603',
    '#7f2704',
  ],

  /**
   * Sequential Purples - For single-hue gradients
   */
  sequentialPurples: [
    '#fcfbfd',
    '#efedf5',
    '#dadaeb',
    '#bcbddc',
    '#9e9ac8',
    '#807dba',
    '#6a51a3',
    '#54278f',
    '#3f007d',
  ],

  /**
   * Diverging Red-Blue - For showing deviation from a center point
   */
  divergingRedBlue: [
    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee090',
    '#ffffbf',
    '#e0f3f8',
    '#abd9e9',
    '#74add1',
    '#4575b4',
  ],

  /**
   * Diverging Red-Green - For showing positive/negative values
   */
  divergingRedGreen: [
    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#ffffbf',
    '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#1a9850',
  ],

  /**
   * Diverging Purple-Green - Alternative diverging scheme
   */
  divergingPurpleGreen: [
    '#762a83',
    '#9970ab',
    '#c2a5cf',
    '#e7d4e8',
    '#f7f7f7',
    '#d9f0d3',
    '#a6dba0',
    '#5aae61',
    '#1b7837',
  ],

  /**
   * Pastel - Soft, muted colors
   */
  pastel: [
    '#b3e2cd',
    '#fdcdac',
    '#cbd5e8',
    '#f4cae4',
    '#e6f5c9',
    '#fff2ae',
    '#f1e2cc',
    '#cccccc',
    '#fb8072',
    '#80b1d3',
  ],

  /**
   * Vibrant - High saturation, bold colors
   */
  vibrant: [
    '#e41a1c',
    '#377eb8',
    '#4daf4a',
    '#984ea3',
    '#ff7f00',
    '#ffff33',
    '#a65628',
    '#f781bf',
    '#999999',
    '#66c2a5',
  ],

  /**
   * PivotHead Default - The original PivotHead color scheme (with alpha)
   */
  default: [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(46, 204, 113, 0.8)',
    'rgba(231, 76, 60, 0.8)',
    'rgba(52, 73, 94, 0.8)',
    'rgba(241, 196, 15, 0.8)',
  ],

  /**
   * PivotHead Default Solid - Same colors without alpha
   */
  defaultSolid: [
    '#36a2eb',
    '#ff6384',
    '#4bc0c0',
    '#ffce56',
    '#9966ff',
    '#ff9f40',
    '#2ecc71',
    '#e74c3c',
    '#34495e',
    '#f1c40f',
  ],
} as const;

/**
 * Type for palette names
 */
export type ColorPaletteName = keyof typeof ColorPalettes;

/**
 * Color Manager class for handling colors in charts
 */
export class ColorManager {
  private palette: readonly string[];
  private currentPaletteName: ColorPaletteName;

  /**
   * Create a new ColorManager instance
   * @param paletteName - The name of the palette to use (default: 'tableau10')
   */
  constructor(paletteName: ColorPaletteName = 'tableau10') {
    this.currentPaletteName = paletteName;
    this.palette = ColorPalettes[paletteName];
  }

  /**
   * Get a color by index (cycles through palette if index exceeds palette length)
   * @param index - The index of the color
   */
  getColor(index: number): string {
    return this.palette[index % this.palette.length];
  }

  /**
   * Get an array of colors
   * @param count - Number of colors to return
   */
  getColors(count: number): string[] {
    return Array.from({ length: count }, (_, i) => this.getColor(i));
  }

  /**
   * Get the border color variant (for Chart.js datasets)
   * @param index - The index of the color
   */
  getBorderColor(index: number): string {
    const color = this.getColor(index);
    // If it's an rgba color, increase opacity to 1
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, '1)');
    }
    return color;
  }

  /**
   * Get an array of border colors
   * @param count - Number of colors to return
   */
  getBorderColors(count: number): string[] {
    return Array.from({ length: count }, (_, i) => this.getBorderColor(i));
  }

  /**
   * Change the current palette
   * @param name - The name of the new palette
   */
  setPalette(name: ColorPaletteName): void {
    this.currentPaletteName = name;
    this.palette = ColorPalettes[name];
  }

  /**
   * Get the current palette name
   */
  getPaletteName(): ColorPaletteName {
    return this.currentPaletteName;
  }

  /**
   * Get all colors in the current palette
   */
  getAllColors(): readonly string[] {
    return this.palette;
  }

  /**
   * Generate a color with adjusted alpha
   * @param index - The index of the color
   * @param alpha - The alpha value (0-1)
   */
  getColorWithAlpha(index: number, alpha: number): string {
    const color = this.getColor(index);

    // If already rgba, replace alpha
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${alpha})`);
    }

    // If hex, convert to rgba
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return color;
  }

  /**
   * Generate a gradient of colors between two palette colors
   * @param startIndex - Starting color index
   * @param endIndex - Ending color index
   * @param steps - Number of colors in the gradient
   */
  getGradient(startIndex: number, endIndex: number, steps: number): string[] {
    const startColor = this.hexToRgb(this.getColor(startIndex));
    const endColor = this.hexToRgb(this.getColor(endIndex));

    if (!startColor || !endColor) {
      return this.getColors(steps);
    }

    const colors: string[] = [];
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    return colors;
  }

  /**
   * Convert hex color to RGB object
   */
  private hexToRgb(color: string): { r: number; g: number; b: number } | null {
    // Handle rgba
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
        };
      }
    }

    // Handle hex
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }

    return null;
  }
}

/**
 * Get colors for a specific palette
 * @param name - Palette name
 * @param count - Number of colors to return
 */
export function getColorsFromPalette(
  name: ColorPaletteName,
  count: number
): string[] {
  const palette = ColorPalettes[name];
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

/**
 * Get all available palette names
 */
export function getAvailablePalettes(): ColorPaletteName[] {
  return Object.keys(ColorPalettes) as ColorPaletteName[];
}
