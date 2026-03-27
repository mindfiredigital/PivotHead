// Default LLM model identifier
export const DEFAULT_MODEL = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

// Maximum number of conversation turns kept in history
export const DEFAULT_MAX_HISTORY = 10;

// Fallback system prompt used when no PivotContext is provided
export const DEFAULT_SYSTEM_PROMPT =
  'You are a pivot table AI assistant. Respond only with valid JSON action objects.';

// Custom event name dispatched when the LLM requests a tab switch
export const SWITCH_TAB_EVENT = 'pivothead:switchTab';

// All action type strings recognised by ActionParser
export const VALID_ACTION_TYPES = new Set([
  'filter',
  'removeFilter',
  'sort',
  'groupBy',
  'topN',
  'aggregate',
  'resetAll',
  'export',
  'switchTab',
  'chartType',
  'answer',
  'clarify',
  'error',
  'style',
  'resetStyle',
]);
