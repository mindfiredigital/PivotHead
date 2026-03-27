import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelManager } from '../ModelManager.js';

describe('ModelManager', () => {
  let manager: ModelManager;

  beforeEach(() => {
    manager = new ModelManager();
  });

  describe('checkWebGPU()', () => {
    it('returns webgpu: false in jsdom environment (no navigator.gpu)', () => {
      const report = manager.checkWebGPU();
      expect(report.webgpu).toBe(false);
      expect(report.message).toBeTruthy();
    });

    it('returns webgpu: true when navigator.gpu exists', () => {
      Object.defineProperty(navigator, 'gpu', {
        value: {},
        configurable: true,
        writable: true,
      });
      const report = manager.checkWebGPU();
      expect(report.webgpu).toBe(true);
      expect(report.message).toContain('available');
      // fully remove the property so it does not leak into other tests
      Reflect.deleteProperty(navigator, 'gpu');
    });
  });

  describe('isReady()', () => {
    it('returns false before load()', () => {
      expect(manager.isReady()).toBe(false);
    });
  });

  describe('getEngine()', () => {
    it('returns null before load()', () => {
      expect(manager.getEngine()).toBeNull();
    });
  });

  describe('load()', () => {
    it('throws with "WebGPU" in message when WebGPU is unavailable', async () => {
      // jsdom has no navigator.gpu
      const onProgress = vi.fn();
      await expect(manager.load('test-model', onProgress)).rejects.toThrow(
        /WebGPU/
      );
    });

    it('does not call onProgress when WebGPU check fails', async () => {
      const onProgress = vi.fn();
      try {
        await manager.load('test-model', onProgress);
      } catch {
        // expected
      }
      expect(onProgress).not.toHaveBeenCalled();
    });
  });

  describe('unload()', () => {
    it('resets ready state without throwing when engine is null', async () => {
      await expect(manager.unload()).resolves.toBeUndefined();
      expect(manager.isReady()).toBe(false);
      expect(manager.getEngine()).toBeNull();
    });
  });
});
