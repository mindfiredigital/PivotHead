import type { CapabilityReport, LoadProgress } from './types.js';

interface WebLLMEngine {
  chat: {
    completions: {
      create: (opts: Record<string, unknown>) => Promise<unknown>;
    };
  };
  unload?: () => Promise<void>;
}

interface CreateMLCEngineOptions {
  initProgressCallback?: (report: { progress: number; text: string }) => void;
}

export class ModelManager {
  private engine: WebLLMEngine | null = null;
  private ready = false;

  checkWebGPU(): CapabilityReport {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      return { webgpu: true, message: 'WebGPU is available' };
    }
    return {
      webgpu: false,
      message: 'WebGPU is not supported in this browser',
    };
  }

  async load(
    modelId: string,
    onProgress: (progress: LoadProgress) => void
  ): Promise<void> {
    if (!this.checkWebGPU().webgpu) {
      throw new Error(
        'WebGPU is not supported in this browser. Cannot load the model.'
      );
    }

    const { CreateMLCEngine } = (await import('@mlc-ai/web-llm')) as {
      CreateMLCEngine: (
        modelId: string,
        opts: CreateMLCEngineOptions
      ) => Promise<WebLLMEngine>;
    };

    this.engine = await CreateMLCEngine(modelId, {
      initProgressCallback: report => {
        let stage: LoadProgress['stage'] = 'downloading';
        if (report.progress >= 1) {
          stage = 'ready';
        } else if (report.text?.toLowerCase().includes('init')) {
          stage = 'initializing';
        }
        onProgress({ progress: report.progress, text: report.text, stage });
      },
    });

    this.ready = true;
    onProgress({ progress: 1, text: 'Model ready', stage: 'ready' });
  }

  async unload(): Promise<void> {
    if (this.engine?.unload) {
      await this.engine.unload();
    }
    this.engine = null;
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }

  getEngine(): WebLLMEngine | null {
    return this.engine;
  }
}
