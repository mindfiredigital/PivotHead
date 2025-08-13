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
});
