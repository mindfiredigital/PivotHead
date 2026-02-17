/**
 * DrillDownManager - Manages drill-down state and navigation
 * Handles hierarchical data navigation for charts
 */

import type { DrillDownConfig, DrillDownLevel } from '../types/config-types';

/**
 * Event types for drill-down state changes
 */
export type DrillDownEvent = 'drill' | 'drillUp' | 'reset';

/**
 * Event listener type
 */
export type DrillDownEventListener = (
  event: DrillDownEvent,
  level: DrillDownLevel | null,
  path: DrillDownLevel[]
) => void;

/**
 * DrillDownManager class for managing drill-down state
 */
export class DrillDownManager {
  private config: DrillDownConfig;
  private path: DrillDownLevel[] = [];
  private listeners: DrillDownEventListener[] = [];

  constructor(config: DrillDownConfig) {
    this.config = {
      enabled: config.enabled ?? true,
      levels: config.levels || [],
      onDrill: config.onDrill,
      onDrillUp: config.onDrillUp,
    };
  }

  /**
   * Check if drill-down is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Enable drill-down
   */
  enable(): this {
    this.config.enabled = true;
    return this;
  }

  /**
   * Disable drill-down
   */
  disable(): this {
    this.config.enabled = false;
    return this;
  }

  /**
   * Get the configured levels
   */
  getLevels(): string[] {
    return [...this.config.levels];
  }

  /**
   * Set the drill-down levels
   */
  setLevels(levels: string[]): this {
    this.config.levels = levels;
    return this;
  }

  /**
   * Drill down to a specific value
   */
  drillDown(value: unknown): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const nextLevelIndex = this.path.length;
    const nextField = this.config.levels[nextLevelIndex];

    if (!nextField) {
      // Already at deepest level
      return false;
    }

    const level: DrillDownLevel = {
      field: nextField,
      value,
    };

    this.path.push(level);

    // Call config callback
    this.config.onDrill?.(level, [...this.path]);

    // Notify listeners
    this.notifyListeners('drill', level, [...this.path]);

    return true;
  }

  /**
   * Drill down to a specific level and value
   */
  drillDownTo(field: string, value: unknown): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const levelIndex = this.config.levels.indexOf(field);
    if (levelIndex === -1) {
      return false;
    }

    // Can only drill down to the next level
    if (levelIndex !== this.path.length) {
      return false;
    }

    return this.drillDown(value);
  }

  /**
   * Drill up one level
   */
  drillUp(): boolean {
    if (!this.config.enabled || this.path.length === 0) {
      return false;
    }

    this.path.pop();

    // Call config callback
    this.config.onDrillUp?.([...this.path]);

    // Notify listeners
    this.notifyListeners('drillUp', null, [...this.path]);

    return true;
  }

  /**
   * Drill up to a specific level
   */
  drillUpTo(field: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const levelIndex = this.config.levels.indexOf(field);
    if (levelIndex === -1) {
      return false;
    }

    // Find the level in current path
    const pathIndex = this.path.findIndex(l => l.field === field);
    if (pathIndex === -1) {
      return false;
    }

    // Remove all levels after this one
    this.path = this.path.slice(0, pathIndex + 1);

    // Call config callback
    this.config.onDrillUp?.([...this.path]);

    // Notify listeners
    this.notifyListeners('drillUp', null, [...this.path]);

    return true;
  }

  /**
   * Reset to top level
   */
  reset(): void {
    const hadPath = this.path.length > 0;
    this.path = [];

    if (hadPath) {
      // Call config callback
      this.config.onDrillUp?.([]);

      // Notify listeners
      this.notifyListeners('reset', null, []);
    }
  }

  /**
   * Get the current drill level index (0-based)
   */
  getCurrentLevel(): number {
    return this.path.length;
  }

  /**
   * Get the current field name
   */
  getCurrentField(): string | null {
    if (this.path.length === 0) {
      return this.config.levels[0] || null;
    }
    return this.config.levels[this.path.length] || null;
  }

  /**
   * Get the next field to drill into (if any)
   */
  getNextField(): string | null {
    const nextIndex = this.path.length;
    return this.config.levels[nextIndex] || null;
  }

  /**
   * Get the current path
   */
  getPath(): DrillDownLevel[] {
    return [...this.path];
  }

  /**
   * Get the path as a string (for display)
   */
  getPathString(separator: string = ' > '): string {
    return this.path.map(l => String(l.value)).join(separator);
  }

  /**
   * Get breadcrumbs for navigation UI
   */
  getBreadcrumbs(): Array<{ field: string; value: string; index: number }> {
    return this.path.map((level, index) => ({
      field: level.field,
      value: String(level.value),
      index,
    }));
  }

  /**
   * Check if can drill down further
   */
  canDrillDown(): boolean {
    return (
      this.config.enabled && this.path.length < this.config.levels.length - 1
    );
  }

  /**
   * Check if can drill up
   */
  canDrillUp(): boolean {
    return this.config.enabled && this.path.length > 0;
  }

  /**
   * Check if at the root level
   */
  isAtRoot(): boolean {
    return this.path.length === 0;
  }

  /**
   * Check if at the deepest level
   */
  isAtDeepestLevel(): boolean {
    return this.path.length >= this.config.levels.length - 1;
  }

  /**
   * Get the filter for the current drill level
   * Returns an object that can be used to filter data
   */
  getCurrentFilter(): Record<string, unknown> {
    const filter: Record<string, unknown> = {};
    this.path.forEach(level => {
      filter[level.field] = level.value;
    });
    return filter;
  }

  /**
   * Get filter as an array of conditions
   */
  getFilterConditions(): Array<{ field: string; value: unknown }> {
    return this.path.map(level => ({
      field: level.field,
      value: level.value,
    }));
  }

  /**
   * Add an event listener
   */
  addListener(listener: DrillDownEventListener): () => void {
    this.listeners.push(listener);
    return () => this.removeListener(listener);
  }

  /**
   * Remove an event listener
   */
  removeListener(listener: DrillDownEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.listeners = [];
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(
    event: DrillDownEvent,
    level: DrillDownLevel | null,
    path: DrillDownLevel[]
  ): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, level, path);
      } catch (error) {
        console.error('DrillDownManager listener error:', error);
      }
    });
  }

  /**
   * Set the onDrill callback
   */
  onDrill(
    callback: (level: DrillDownLevel, path: DrillDownLevel[]) => void
  ): this {
    this.config.onDrill = callback;
    return this;
  }

  /**
   * Set the onDrillUp callback
   */
  onDrillUp(callback: (path: DrillDownLevel[]) => void): this {
    this.config.onDrillUp = callback;
    return this;
  }

  /**
   * Get the full configuration
   */
  getConfig(): DrillDownConfig {
    return { ...this.config };
  }

  /**
   * Clone the manager with current state
   */
  clone(): DrillDownManager {
    const manager = new DrillDownManager(this.config);
    manager.path = [...this.path];
    return manager;
  }

  /**
   * Serialize state to JSON-compatible object
   */
  toJSON(): { path: DrillDownLevel[]; levels: string[] } {
    return {
      path: [...this.path],
      levels: [...this.config.levels],
    };
  }

  /**
   * Restore state from serialized object
   */
  fromJSON(state: { path: DrillDownLevel[]; levels?: string[] }): this {
    this.path = state.path || [];
    if (state.levels) {
      this.config.levels = state.levels;
    }
    return this;
  }
}

/**
 * Create a new DrillDownManager
 */
export function createDrillDownManager(
  levels: string[],
  callbacks?: {
    onDrill?: (level: DrillDownLevel, path: DrillDownLevel[]) => void;
    onDrillUp?: (path: DrillDownLevel[]) => void;
  }
): DrillDownManager {
  return new DrillDownManager({
    enabled: true,
    levels,
    onDrill: callbacks?.onDrill,
    onDrillUp: callbacks?.onDrillUp,
  });
}
