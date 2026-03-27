import { describe, it, expect, vi } from 'vitest';
import { LLMEngine } from '../LLMEngine.js';
import type { PivotContext } from '../types.js';

const sampleContext: PivotContext = {
  fields: [{ name: 'sales', type: 'number' }],
  sampleRows: [{ sales: 1000 }],
  pivotOutput: [{ sales: 1000 }],
  currentState: {},
};

describe('LLMEngine', () => {
  describe('constructor', () => {
    it('constructs without throwing', () => {
      expect(() => new LLMEngine()).not.toThrow();
    });

    it('isReady() returns false immediately after construction', () => {
      const engine = new LLMEngine();
      expect(engine.isReady()).toBe(false);
    });

    it('fires onCapability synchronously in constructor', () => {
      const onCapability = vi.fn();
      new LLMEngine({ onCapability });
      expect(onCapability).toHaveBeenCalledTimes(1);
    });

    it('onCapability receives a CapabilityReport with webgpu field', () => {
      let received: { webgpu: boolean; message: string } | undefined;
      new LLMEngine({
        onCapability: report => {
          received = report;
        },
      });
      expect(received).toBeDefined();
      expect(typeof received!.webgpu).toBe('boolean');
      expect(typeof received!.message).toBe('string');
    });

    it('reports webgpu: false in jsdom (no WebGPU)', () => {
      let webgpu: boolean | undefined;
      new LLMEngine({ onCapability: r => (webgpu = r.webgpu) });
      expect(webgpu).toBe(false);
    });

    it('does not call onCapability when option is not provided', () => {
      // should not throw
      expect(() => new LLMEngine({})).not.toThrow();
    });

    it('accepts a custom model ID', () => {
      expect(
        () => new LLMEngine({ model: 'Llama-3.1-8B-Instruct-q4f16_1-MLC' })
      ).not.toThrow();
    });

    it('accepts a custom maxHistory value', () => {
      expect(() => new LLMEngine({ maxHistory: 5 })).not.toThrow();
    });
  });

  describe('load()', () => {
    it('throws with "WebGPU" in the error message when navigator.gpu is absent', async () => {
      const engine = new LLMEngine();
      await expect(engine.load()).rejects.toThrow(/WebGPU/);
    });

    it('isReady() remains false after a failed load()', async () => {
      const engine = new LLMEngine();
      try {
        await engine.load();
      } catch {
        // expected
      }
      expect(engine.isReady()).toBe(false);
    });
  });

  describe('setContext() and clearHistory()', () => {
    it('setContext() does not throw', () => {
      const engine = new LLMEngine();
      expect(() => engine.setContext(sampleContext)).not.toThrow();
    });

    it('clearHistory() does not throw', () => {
      const engine = new LLMEngine();
      expect(() => engine.clearHistory()).not.toThrow();
    });

    it('clearHistory() can be called multiple times without error', () => {
      const engine = new LLMEngine();
      engine.clearHistory();
      engine.clearHistory();
      expect(engine.isReady()).toBe(false);
    });
  });

  describe('query()', () => {
    it('throws "Model is not ready" when called before load()', async () => {
      const engine = new LLMEngine();
      await expect(engine.query('sort by sales')).rejects.toThrow(/not ready/i);
    });
  });

  describe('queryStream()', () => {
    it('throws "Model is not ready" when called before load()', async () => {
      const engine = new LLMEngine();
      const gen = engine.queryStream('sort by sales');
      await expect(gen.next()).rejects.toThrow(/not ready/i);
    });
  });

  describe('unload()', () => {
    it('resolves without throwing when model was never loaded', async () => {
      const engine = new LLMEngine();
      await expect(engine.unload()).resolves.toBeUndefined();
    });
  });
});
