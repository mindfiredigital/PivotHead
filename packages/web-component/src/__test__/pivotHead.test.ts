import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = window as unknown as Window & typeof globalThis;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.customElements = window.customElements;

// Mock the core engine import to avoid complex dependencies in tests
vi.mock('@mindfiredigital/pivothead', () => ({
  PivotEngine: class MockPivotEngine {
    getData() {
      return [];
    }
    getProcessedData() {
      return {};
    }
    // Add other methods as needed
  },
}));

// Define a structural type for the element instance used in tests
type TPivotEl = HTMLElement & {
  pagination?: { currentPage: number; pageSize: number; totalPages: number };
  previousPage?: () => void;
  nextPage?: () => void;
  setPageSize?: (n: number) => void;
  goToPage?: (n: number) => void;
  setViewMode?: (m: 'raw' | 'processed') => void;
  getViewMode?: () => 'raw' | 'processed';
  setMeasures?: (m: unknown[]) => void;
  setDimensions?: (d: unknown[]) => void;
  setGroupConfig?: (g: unknown | null) => void;
  sort?: (field: string, dir: 'asc' | 'desc') => void;
};

describe('PivotHeadElement', () => {
  beforeAll(async () => {
    // Import the web component after setting up the environment
    await import('../pivot-head/pivotHead');
  });

  describe('Basic Component Registration', () => {
    it('should register the custom element', () => {
      expect(customElements.get('pivot-head')).toBeDefined();
    });

    it('should create an element instance', () => {
      const element = document.createElement('pivot-head');
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName.toLowerCase()).toBe('pivot-head');
    });
  });

  describe('Component Lifecycle', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('pivot-head');
      document.body.appendChild(element);
    });

    afterEach(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should be connected to DOM', () => {
      expect(element.isConnected).toBe(true);
    });

    it('should exist as a DOM element', () => {
      // The element should exist even if it doesn't have content yet
      expect(element).toBeDefined();
      expect(element.nodeType).toBe(Node.ELEMENT_NODE);
    });
  });

  describe('Property Assignment', () => {
    let element: HTMLElement & Record<string, unknown>;

    beforeEach(() => {
      element = document.createElement('pivot-head') as HTMLElement &
        Record<string, unknown>;
      document.body.appendChild(element);
    });

    afterEach(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should accept data property', () => {
      const testData = [{ name: 'test', value: 123 }];

      expect(() => {
        element.data = testData;
      }).not.toThrow();
    });

    it('should accept config property', () => {
      const testConfig = { rows: ['name'], measures: ['value'] };

      expect(() => {
        element.config = testConfig;
      }).not.toThrow();
    });

    it('should accept viewMode property', () => {
      expect(() => {
        element.viewMode = 'table';
      }).not.toThrow();

      expect(() => {
        element.viewMode = 'processed';
      }).not.toThrow();
    });
  });

  // New tests for ref/method coverage and pagination
  describe('PivotHeadElement - ref and methods', () => {
    beforeAll(async () => {
      await import('../pivot-head/pivotHead');
    });

    let element: TPivotEl;

    beforeEach(() => {
      element = document.createElement('pivot-head') as TPivotEl;
      element.setAttribute('mode', 'none');
      document.body.appendChild(element);
      // Initialize with base pagination
      (
        element as TPivotEl & { _pagination?: TPivotEl['pagination'] }
      )._pagination = { currentPage: 1, pageSize: 10, totalPages: 5 };
    });

    afterEach(() => {
      element?.parentNode?.removeChild(element as unknown as Node);
    });

    it('exposes pagination methods on the element', () => {
      expect(typeof element.previousPage).toBe('function');
      expect(typeof element.nextPage).toBe('function');
      expect(typeof element.setPageSize).toBe('function');
      expect(typeof element.goToPage).toBe('function');
    });

    it('dispatches paginationChange when calling pagination methods', () => {
      const handler = vi.fn();
      element.addEventListener('paginationChange', handler);

      element.nextPage?.();
      element.setPageSize?.(25);
      element.goToPage?.(3);
      element.previousPage?.();

      expect(handler).toHaveBeenCalled();
      const last = handler.mock.calls.at(-1)?.[0] as CustomEvent<{
        currentPage: number;
        pageSize: number;
      }>;
      expect(last.detail.currentPage).toBe(2);
      expect(last.detail.pageSize).toBe(25);
    });

    it('supports setting and getting view mode (without engine)', () => {
      // When engine isn't initialized, setViewMode should still update getViewMode, but may not emit an event
      const vmHandler = vi.fn();
      element.addEventListener('viewModeChange', vmHandler);
      element.setViewMode?.('raw');
      expect(element.getViewMode?.()).toBe('raw');
      element.setViewMode?.('processed');
      expect(element.getViewMode?.()).toBe('processed');
      expect(vmHandler).not.toHaveBeenCalled();
    });

    it('exposes engine-driven APIs without throwing when engine is not initialized', () => {
      expect(() => element.setMeasures?.([])).not.toThrow();
      expect(() => element.setDimensions?.([])).not.toThrow();
      expect(() => element.setGroupConfig?.(null)).not.toThrow();
      expect(() => element.sort?.('field', 'asc')).not.toThrow();
    });
  });
});
