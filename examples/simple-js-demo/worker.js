// worker.js
// Runs all heavy pivot calculations in a separate thread
importScripts('./core/engine/pivotEngine.js'); // Adjust path as needed

let pivotEngine = null;

self.onmessage = async event => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'INIT_ENGINE': {
        pivotEngine = new PivotEngine(payload.config);
        pivotEngine.updateDataSource(payload.data);
        const state = pivotEngine.getState();
        self.postMessage({ type: 'INITIALIZED', payload: state });
        break;
      }

      case 'SET_LAYOUT': {
        if (!pivotEngine) return;
        pivotEngine.setLayout(payload.rows, payload.columns, payload.measures);
        const state = pivotEngine.getState();
        self.postMessage({ type: 'UPDATED_LAYOUT', payload: state });
        break;
      }

      case 'APPLY_FILTER': {
        if (!pivotEngine) return;
        pivotEngine.applyFilters(payload.filters);
        const state = pivotEngine.getState();
        self.postMessage({ type: 'FILTERED_DATA', payload: state });
        break;
      }

      case 'SORT': {
        if (!pivotEngine) return;
        pivotEngine.sort(payload.field, payload.direction);
        const state = pivotEngine.getState();
        self.postMessage({ type: 'SORTED_DATA', payload: state });
        break;
      }

      case 'GET_STATE': {
        const state = pivotEngine?.getState();
        self.postMessage({ type: 'STATE', payload: state });
        break;
      }

      default:
        console.warn('Unknown message type:', type);
        break;
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: error.message });
  }
};
