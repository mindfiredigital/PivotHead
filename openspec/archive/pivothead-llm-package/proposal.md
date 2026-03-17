# Proposal — pivothead-llm-package

## Business Intent

Add in-browser LLM assistant capability to PivotHead so users can control pivot tables through natural language queries without any server-side infrastructure. All inference runs client-side via WebGPU.

## FRS References

- FR-01: Model initialization and loading
- FR-02: WebGPU capability detection
- FR-03: Pivot schema context injection
- FR-04: Natural language query — action response (13 action types)
- FR-05: Natural language query — analytical answer
- FR-06: Streaming response
- FR-07: Conversation history (multi-turn)
- FR-08: Public API (`LLMEngine`)
- FR-09: `ActionExecutor` helper
- FR-10: Chat UI in `examples/simple-js-demo`

## Scope

**In scope:**

- New package `@mindfiredigital/pivothead-llm` at `packages/llm/`
- All 7 source files: `types.ts`, `ModelManager.ts`, `PromptBuilder.ts`, `ActionParser.ts`, `LLMEngine.ts`, `ActionExecutor.ts`, `index.ts`
- ESM + CJS + `.d.ts` build output via `tsup`
- Chat UI integration in `examples/simple-js-demo`

**Out of scope:**

- Any modification to `packages/core/`
- Cloud API fallback (OpenAI, Anthropic, Groq)
- Node.js / SSR support
- Unit tests (v1.0)
- Persistent chat history

## Status

ARCHIVED — implementation complete. All acceptance criteria met.
