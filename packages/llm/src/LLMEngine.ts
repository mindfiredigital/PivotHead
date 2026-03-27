import { ModelManager } from './ModelManager.js';
import { PromptBuilder } from './PromptBuilder.js';
import { ActionParser } from './ActionParser.js';
import type {
  LLMEngineOptions,
  LoadProgress,
  PivotAction,
  PivotContext,
  CapabilityReport,
} from './types.js';
import {
  DEFAULT_MODEL,
  DEFAULT_MAX_HISTORY,
  DEFAULT_SYSTEM_PROMPT,
} from './constants.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionResponse {
  choices: Array<{ message: { content: string } }>;
}

interface StreamChunk {
  choices: Array<{ delta: { content?: string } }>;
}

export class LLMEngine {
  private modelManager: ModelManager;
  private promptBuilder: PromptBuilder;
  private actionParser: ActionParser;
  private model: string;
  private maxHistory: number;
  private history: ChatMessage[] = [];
  private context: PivotContext | null = null;

  constructor(options: LLMEngineOptions = {}) {
    this.modelManager = new ModelManager();
    this.promptBuilder = new PromptBuilder();
    this.actionParser = new ActionParser();
    this.model = options.model ?? DEFAULT_MODEL;
    this.maxHistory = options.maxHistory ?? DEFAULT_MAX_HISTORY;

    if (options.onCapability) {
      const report: CapabilityReport = this.modelManager.checkWebGPU();
      options.onCapability(report);
    }
  }

  isReady(): boolean {
    return this.modelManager.isReady();
  }

  async load(onProgress?: (progress: LoadProgress) => void): Promise<void> {
    await this.modelManager.load(this.model, onProgress ?? (() => {}));
  }

  async unload(): Promise<void> {
    await this.modelManager.unload();
  }

  setContext(context: PivotContext): void {
    this.context = context;
  }

  clearHistory(): void {
    this.history = [];
  }

  async query(userMessage: string): Promise<PivotAction> {
    if (!this.modelManager.isReady()) {
      throw new Error('Model is not ready. Call load() first.');
    }

    const messages = this.buildMessages(userMessage);
    const engine = this.modelManager.getEngine()!;

    const response = (await engine.chat.completions.create({
      messages,
      stream: false,
    })) as CompletionResponse;

    const assistantContent = response.choices[0]?.message?.content ?? '';
    this.appendHistory(userMessage, assistantContent);

    return this.actionParser.parse(assistantContent);
  }

  async *queryStream(
    userMessage: string,
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    if (!this.modelManager.isReady()) {
      throw new Error('Model is not ready. Call load() first.');
    }

    const messages = this.buildMessages(userMessage);
    const engine = this.modelManager.getEngine()!;

    const stream = (await engine.chat.completions.create({
      messages,
      stream: true,
    })) as AsyncIterable<StreamChunk>;

    let fullContent = '';

    for await (const chunk of stream) {
      if (signal?.aborted) break;
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        fullContent += delta;
        yield delta;
      }
    }

    this.appendHistory(userMessage, fullContent);
  }

  private buildMessages(userMessage: string): ChatMessage[] {
    const systemPrompt = this.context
      ? this.promptBuilder.build(this.context)
      : DEFAULT_SYSTEM_PROMPT;

    const recentHistory = this.history.slice(-(this.maxHistory * 2));

    return [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: userMessage },
    ];
  }

  private appendHistory(userMessage: string, assistantContent: string): void {
    this.history.push({ role: 'user', content: userMessage });
    this.history.push({ role: 'assistant', content: assistantContent });
    if (this.history.length > this.maxHistory * 2) {
      this.history = this.history.slice(-(this.maxHistory * 2));
    }
  }
}
