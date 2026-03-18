---
Functional Requirements Document

Project: PivotHead AI Assistant
Package: @mindfiredigital/pivothead-llm
Approach: WebLLM only (in-browser, WebGPU)
Version: 1.0.0
Date: 2026-02-27

---

1. Overview

1.1 Purpose

This document defines the functional requirements for the PivotHead AI Assistant — a natural language chat interface powered by WebLLM that runs entirely in the browser. Users interact with the pivot
table through a chat panel, and the assistant either modifies the table or answers analytical questions based on the current data.

1.2 Scope

A standalone package @mindfiredigital/pivothead-llm that:

- Runs an LLM in the browser via WebGPU using @mlc-ai/web-llm
- Accepts natural language queries from the user
- Returns structured actions (applied to PivotEngine) or plain text answers
- Integrates with @mindfiredigital/pivothead core package

  1.3 System Requirement (End User)

┌─────────────┬─────────────────────────────────────────────────┐
│ Requirement │ Detail │
├─────────────┼─────────────────────────────────────────────────┤
│ Browser │ Chrome 113+ or Edge 113+ │
├─────────────┼─────────────────────────────────────────────────┤
│ GPU │ Any integrated or dedicated GPU (WebGPU access) │
├─────────────┼─────────────────────────────────────────────────┤
│ Storage │ ~2GB free (model cached after first download) │
├─────────────┼─────────────────────────────────────────────────┤
│ Internet │ Required only for first-time model download │
└─────────────┴─────────────────────────────────────────────────┘

---

2. Package Architecture

packages/llm/
├── src/
│ ├── index.ts ← public exports
│ ├── LLMEngine.ts ← main user-facing API
│ ├── ModelManager.ts ← WebLLM init, load, unload, caching
│ ├── PromptBuilder.ts ← builds system prompt with pivot schema
│ ├── ActionParser.ts ← parses LLM JSON output → PivotAction
│ ├── ActionExecutor.ts ← optional helper: maps actions to PivotEngine calls
│ └── types.ts ← all TypeScript types and interfaces
├── package.json
├── tsconfig.json
└── tsup.config.ts

---

3. Functional Requirements

---

FR-01: Model Initialization & Loading

Description: The system shall initialize and load a WebLLM model in the browser on demand.

Requirements:

- LLMEngine.load(progressCallback) initiates model download and initialization
- Default model: Llama-3.2-3B-Instruct-q4f16_1-MLC
- Model is configurable via constructor options
- Progress callback fires continuously during download:
  { progress: number, text: string, stage: 'downloading' | 'initializing' | 'ready' }
- After first download, model is cached in browser storage — subsequent loads take < 5 seconds
- LLMEngine.unload() releases GPU memory when assistant is not in use
- LLMEngine.isReady() returns boolean — whether model is loaded and ready

---

FR-02: WebGPU Capability Detection

Description: The system shall detect WebGPU support before attempting to load the model.

Requirements:

- On LLMEngine instantiation, check navigator.gpu
- Emit a capability event:
  { webgpu: boolean, message: string }
- If WebGPU is not available, load() shall throw a descriptive error: "WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+"
- Host app must handle this error and display appropriate UI to the user

---

FR-03: Pivot Schema Context Injection

Description: The system shall inject the current pivot table schema and state into the LLM system prompt before every query so the model understands what data is available.

Context injected:

- All available field names and their data types (string, number, date)
- Distinct values for low-cardinality dimension fields (e.g. Region: North, South, East, West)
- Current active filters, groupings, and sort order
- Up to 5 sample rows from current dataset
- Current aggregated pivot output (top 10 rows) so LLM can answer data questions

Host app responsibility:

- Call llm.setContext(context) after every data load or pivot state change

Example system prompt:
You are a pivot table assistant. The table currently has these fields:

- region (string): North, South, East, West
- product (string): Laptop, Phone, Tablet, Monitor
- sales (number)
- quantity (number)
- date (date)

Current pivot state:

- Grouped by: region
- Sorted by: sales descending
- Active filters: none

Current data (top 5 rows):
| region | sales |
|--------|--------|
| North | 42000 |
| South | 38000 |
...

When the user asks to modify the table, respond ONLY with a JSON action.
When the user asks a question, respond with a plain text answer.

---

FR-04: Natural Language Query — Action Response

Description: When the user's query maps to a pivot table operation, the LLM shall respond with a structured JSON action object.

Supported actions:

┌──────────────┬────────────────────────┬─────────────────────────────────────┐
│ Action Type │ Parameters │ Example Trigger │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ filter │ field, operator, value │ "filter region to North" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ removeFilter │ field │ "remove the region filter" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ sort │ field, direction │ "sort by sales descending" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ groupBy │ field │ "group by quarter" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ topN │ n, measure, order │ "show top 5 products by sales" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ aggregate │ field, func │ "change sales to average" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ resetAll │ — │ "reset the table" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ export │ format │ "export as PDF" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ switchTab │ tab │ "go to analytics tab" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ chartType │ chartType │ "show a pie chart" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ answer │ text │ "which region has highest revenue?" │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ clarify │ question │ query is ambiguous │
├──────────────┼────────────────────────┼─────────────────────────────────────┤
│ error │ message │ query cannot be understood │
└──────────────┴────────────────────────┴─────────────────────────────────────┘

JSON response format (enforced via JSON mode):
{
"type": "filter",
"field": "region",
"operator": "equals",
"value": "North"
}

---

FR-05: Natural Language Query — Analytical Answer

Description: When the user asks an analytical or informational question about the data, the LLM shall respond with a plain text answer derived from the injected pivot context.

Requirements:

- Response action type is answer with a text field
- Answer is based strictly on the data provided in the system prompt context
- Response is streamed token by token to the chat UI
- LLM must not hallucinate data values — it answers only from what is in the context

Examples:
"what region has the highest revenue?"
→ { "type": "answer", "text": "North region has the highest revenue at $42,000." }

"why did sales drop in Q3?"
→ { "type": "answer", "text": "Based on the current data, Q3 shows $28,000 in sales
compared to $42,000 in Q2, a drop of ~33%." }

"compare North vs South"
→ { "type": "answer", "text": "North leads with $42,000 vs South at $38,000..." }

---

FR-06: Streaming Response

Description: All LLM responses shall be streamed to the chat UI in real time.

Requirements:

- LLMEngine.queryStream(text) returns AsyncGenerator<string>
- Host app appends each token to the chat bubble as it arrives
- For action-type responses, the full JSON is buffered internally and parsed only after stream completes — the chat UI shows a visual indicator while processing
- Streaming is cancellable via AbortController passed at query time
- On cancellation, a partial response is discarded cleanly

---

FR-07: Conversation History (Multi-turn)

Description: The system shall maintain a conversation history within a session to support multi-turn dialogue.

Requirements:

- Each query and response is appended to an in-memory message history array
- History is passed to the LLM on every query (OpenAI-compatible messages format)
- History is cleared when llm.clearHistory() is called or when context changes significantly (new data loaded)
- History is not persisted across page refreshes (session only)
- Maximum history length is configurable (default: last 10 exchanges) to manage token budget

Multi-turn example:
User: "show top 5 products by sales"
Assistant: Applied: Top 5 products by sales

User: "now filter that to North region only" ← references previous context
Assistant: Applied: Filter region = North

---

FR-08: Public API

Description: The package shall expose a clean, minimal TypeScript API.

import { LLMEngine } from '@mindfiredigital/pivothead-llm';

// 1. Create engine
const llm = new LLMEngine({
model: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', // optional, has default
onCapability: (caps: CapabilityReport) => { }
});

// 2. Load model (first time downloads ~2GB, cached after)
await llm.load((progress: LoadProgress) => {
progressBar.style.width = `${progress.progress * 100}%`;
progressLabel.textContent = progress.text;
});

// 3. Set pivot context (call after every data change)
llm.setContext({
fields: [
{ name: 'region', type: 'string', values: ['North', 'South'] },
{ name: 'sales', type: 'number' }
],
sampleRows: [...],
pivotOutput: [...],
currentState: {
filters: [],
groupBy: 'region',
sortBy: { field: 'sales', direction: 'desc' }
}
});

// 4. Query — returns typed action
const action = await llm.query('show top 5 products by sales');
// { type: 'topN', n: 5, measure: 'sales', order: 'desc' }

// 5. Query — streaming (for answers)
for await (const token of llm.queryStream('what region has highest revenue?')) {
chatBubble.textContent += token;
}

// 6. Clear conversation history
llm.clearHistory();

// 7. Unload model (free GPU memory)
llm.unload();

---

FR-09: ActionExecutor Helper

Description: The package shall provide an optional ActionExecutor helper class that maps PivotAction objects to actual PivotEngine and ChartEngine API calls, reducing boilerplate in the host app.

import { ActionExecutor } from '@mindfiredigital/pivothead-llm';

const executor = new ActionExecutor({
pivotEngine, // @mindfiredigital/pivothead instance
chartEngine, // @mindfiredigital/pivothead-analytics instance (optional)
onActionApplied: (action, result) => {
chatUI.showConfirmation(`Applied: ${result.description}`);
},
onError: (action, error) => {
chatUI.showError(error.message);
}
});

// Apply action returned by LLMEngine
executor.execute(action);

---

FR-10: Chat UI in Demo (simple-js-demo)

Description: The demo application shall include a working chat interface to demonstrate the AI assistant.

UI Requirements:

- Floating chat button at bottom-right corner of the screen
- Click opens a chat panel (350px wide, slides up)
- Chat panel contains:
  - Header: "AI Assistant" with a close button
  - Model loading progress bar (shown only on first load)
  - Chat history area (scrollable, user messages right, assistant messages left)
  - Streaming tokens rendered in real time
  - Action confirmations shown as system messages: "✓ Applied: Top 5 by sales"
  - Text input box + Send button at the bottom
  - "Clear chat" button in header
- WebGPU not supported warning replaces chat if browser is incompatible
- Chat panel is independent of the Table / Analytics tabs — works alongside them

---

4. Non-Functional Requirements

┌────────┬────────────────────────────────────────┬────────────────────────────────┐
│ # │ Requirement │ Target │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-01 │ First token latency after model ready │ < 3 seconds │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-02 │ Model download size │ ~2GB (once, then cached) │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-03 │ Package bundle size (no model weights) │ < 100KB gzipped │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-04 │ Browser support │ Chrome 113+, Edge 113+ │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-05 │ TypeScript strict mode │ Enabled │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-06 │ Privacy │ Zero data leaves the browser │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-07 │ No backend required │ All inference runs client-side │
├────────┼────────────────────────────────────────┼────────────────────────────────┤
│ NFR-08 │ Build output │ ESM + CJS + type declarations │
└────────┴────────────────────────────────────────┴────────────────────────────────┘

---

5. Out of Scope (v1.0)

- ONNX / fast path fallback
- Cloud API fallback (OpenAI, Anthropic, Groq)
- Voice / speech input
- Multi-language support (English only)
- Persistent chat history across sessions
- Fine-tuning or custom model weights
- Node.js / SSR environments

---

6. Dependencies

┌──────────────────────────────────────┬────────────────────────────────────────────┐
│ Package │ Role │
├──────────────────────────────────────┼────────────────────────────────────────────┤
│ @mlc-ai/web-llm │ Browser LLM inference via WebGPU │
├──────────────────────────────────────┼────────────────────────────────────────────┤
│ @mindfiredigital/pivothead │ PivotEngine API (peer dependency) │
├──────────────────────────────────────┼────────────────────────────────────────────┤
│ @mindfiredigital/pivothead-analytics │ ChartEngine API (optional peer dependency) │
├──────────────────────────────────────┼────────────────────────────────────────────┤
│ typescript │ Language │
├──────────────────────────────────────┼────────────────────────────────────────────┤
│ tsup │ Build tool (ESM + CJS) │
└──────────────────────────────────────┴────────────────────────────────────────────┘

---
