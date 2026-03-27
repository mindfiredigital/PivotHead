'use strict';
/**
 * worker.js — ES module Web Worker for heavy pivot calculations.
 *
 * Uses only ES module imports (no importScripts).
 * Instantiated with { type: 'module' } in the main thread.
 */
import { logger } from './logger.js';
import { PivotEngine } from '@mindfiredigital/pivothead';

let pivotEngine = null;

self.onmessage = async event => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'INIT_ENGINE': {
        pivotEngine = new PivotEngine(payload.config);
        pivotEngine.updateDataSource(payload.data);
        self.postMessage({
          type: 'INITIALIZED',
          payload: pivotEngine.getState(),
        });
        break;
      }

      case 'SET_LAYOUT': {
        if (!pivotEngine) return;
        pivotEngine.setLayout(payload.rows, payload.columns, payload.measures);
        self.postMessage({
          type: 'UPDATED_LAYOUT',
          payload: pivotEngine.getState(),
        });
        break;
      }

      case 'APPLY_FILTER': {
        if (!pivotEngine) return;
        pivotEngine.applyFilters(payload.filters);
        self.postMessage({
          type: 'FILTERED_DATA',
          payload: pivotEngine.getState(),
        });
        break;
      }

      case 'SORT': {
        if (!pivotEngine) return;
        pivotEngine.sort(payload.field, payload.direction);
        self.postMessage({
          type: 'SORTED_DATA',
          payload: pivotEngine.getState(),
        });
        break;
      }

      case 'GET_STATE': {
        self.postMessage({
          type: 'STATE',
          payload: pivotEngine?.getState() ?? null,
        });
        break;
      }

      default:
        logger.warn('Unknown message type:', type);
        break;
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: error.message });
  }
};
