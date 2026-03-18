---
id: llm-assistant
title: LLM Assistant
sidebar_label: LLM Assistant
description: Add a natural-language AI assistant to your PivotHead pivot table — runs entirely in the browser, no server required.
keywords:
  [
    llm,
    ai,
    assistant,
    natural language,
    webgpu,
    webllm,
    in-browser,
    pivot table,
    pivothead,
    chatbot,
  ]
---

# LLM Assistant

`@mindfiredigital/pivothead-llm` lets users control your pivot table with plain English — **no server, no API key, no data leaves the browser**.

> "filter country equals France" → filters the table
> "sort by price descending" → sorts the table
> "what is the sum of price for Bikes in Australia?" → computes and answers in chat
> "make the Accessories column red" → applies the style live

The model runs locally via [WebLLM](https://webllm.mlc.ai/) using **WebGPU**. The first load downloads ~1.5 GB (cached by the browser afterwards).

---

## Requirements

| Requirement     | Detail                                                     |
| --------------- | ---------------------------------------------------------- |
| Browser         | Chrome 113+, Edge 113+, or any browser with WebGPU         |
| Peer dependency | `@mindfiredigital/pivothead`                               |
| Optional peer   | `@mindfiredigital/pivothead-analytics` (for chart actions) |

:::tip Check WebGPU support
Users can verify their browser at [webgpureport.org](https://webgpureport.org). Chrome on macOS, Windows, and Linux all support it.
:::

---

## Installation

```bash
npm install @mindfiredigital/pivothead-llm
```

---

## Quick start — `LLMAssistant` (recommended)

`LLMAssistant` is the high-level class that wires everything together. Pass it your pivot engine and a callback to receive messages — that's it.

```js
import { LLMAssistant } from '@mindfiredigital/pivothead-llm';

const assistant = new LLMAssistant({
  engine: pivotEngine, // your PivotEngine instance
  onMessage: (role, text) => {
    // role is 'assistant' or 'error'
    addChatMessage(role, text); // render in your chat UI
  },
  onCapability: report => {
    if (!report.webgpu) {
      console.warn('WebGPU not available:', report.message);
    }
  },
});

// Download and initialise the model (~1.5 GB, cached after first load)
await assistant.load(progress => {
  console.log(`${Math.round(progress.progress * 100)}% — ${progress.text}`);
});

// Send a query — the result is applied to the table AND sent to onMessage
await assistant.query('filter country equals France');
await assistant.query('sort by price descending');
await assistant.query('what is the sum of price for Bikes in Australia?');
await assistant.query('make the Accessories column red');
```

That's the entire setup. No manual context building, no action wiring, no adapter code.

---

## What queries can it handle?

### Filtering

```
"filter country equals Australia"
"show only data for France"
"show Canada in the table"
"filter price greater than 1000"
```

### Sorting

```
"sort by price descending"
"sort by country ascending"
"sort price from highest to lowest"
```

### Aggregation & data questions

```
"what is the sum of price for Bikes and Cars in Australia?"
"total discount for Germany"
"average price by category"
```

The answer is computed from the live data and shown in chat.

### Styling

```
"make the Accessories column red"
"highlight Australia rows in yellow"
"make Canada text bold"
"make Bikes column background blue"
"make France rows italic"
"reset styles"
```

### Other

```
"reset"                         → clears all filters and sorting
"switch to analytics tab"       → switches the active tab
"change chart to bar"           → changes the chart type
```

---

## Adding a chat UI

`LLMAssistant` does not include a UI — it calls `onMessage` and you render whatever you like. Here's a minimal example:

```html
<div id="chat-messages"></div>
<input id="chat-input" placeholder="Ask anything about your data…" />
<button id="chat-send">Send</button>
```

```js
function addChatMessage(role, text) {
  const el = document.createElement('div');
  el.className = `chat-msg chat-msg-${role}`;
  el.textContent = text;
  document.getElementById('chat-messages').appendChild(el);
}

document.getElementById('chat-send').addEventListener('click', async () => {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !assistant.isReady()) return;

  input.value = '';
  addChatMessage('user', text);
  await assistant.query(text);
});
```

```css
.chat-msg {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 8px;
}
.chat-msg-user {
  background: #e3f2fd;
  align-self: flex-end;
}
.chat-msg-assistant {
  background: #f1f8e9;
}
.chat-msg-error {
  background: #fff3e0;
  color: #bf360c;
}
```

---

## With chart engine (optional)

If you're using `@mindfiredigital/pivothead-analytics`, pass the chart engine to enable chart-type switching:

```js
const assistant = new LLMAssistant({
  engine: pivotEngine,
  chartEngine: chartEngine,            // optional
  onMessage: (role, text) => { ... },
});
```

Users can then say things like `"change chart to bar"` or `"switch to line chart"`.

---

## Load progress

The `load()` method accepts a progress callback with three fields:

```js
await assistant.load(progress => {
  // progress.progress — number from 0 to 1
  // progress.text     — human-readable status string
  // progress.stage    — 'downloading' | 'initializing' | 'ready'

  progressBar.style.width = `${Math.round(progress.progress * 100)}%`;
  statusLabel.textContent = progress.text;
});
```

---

## Checking WebGPU before loading

The `onCapability` callback fires **synchronously in the constructor** — before the model is loaded — so you can show a warning or disable the load button early:

```js
const assistant = new LLMAssistant({
  engine: pivotEngine,
  onMessage: (role, text) => { ... },
  onCapability: (report) => {
    if (report.webgpu) {
      loadBtn.disabled = false;
      statusEl.textContent = '✓ WebGPU ready';
    } else {
      statusEl.textContent = `⚠ ${report.message}`;
      loadBtn.disabled = true;
    }
  },
});
```

---

## API summary

| Method                        | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| `new LLMAssistant(options)`   | Create the assistant. WebGPU is checked immediately.                  |
| `assistant.load(onProgress?)` | Download and initialise the model. Returns a Promise.                 |
| `assistant.isReady()`         | Returns `true` when the model is loaded and ready.                    |
| `assistant.query(text)`       | Send a query. Applies the action to the engine and calls `onMessage`. |
| `assistant.clearHistory()`    | Reset the conversation history.                                       |
| `assistant.unload()`          | Unload the model and free GPU memory.                                 |

### `LLMAssistantOptions`

| Option         | Type                   | Required | Description                                |
| -------------- | ---------------------- | -------- | ------------------------------------------ |
| `engine`       | `PivotEngineInstance`  | ✓        | Your PivotEngine instance                  |
| `onMessage`    | `(role, text) => void` | ✓        | Called with every assistant reply          |
| `onCapability` | `(report) => void`     |          | WebGPU check result, fires in constructor  |
| `chartEngine`  | `ChartEngineInstance`  |          | For chart-type switching actions           |
| `model`        | `string`               |          | Override the default model ID              |
| `maxHistory`   | `number`               |          | Conversation turns to retain (default: 10) |

---

## Framework examples

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="vanilla" label="Vanilla JS">

```js
import { LLMAssistant } from '@mindfiredigital/pivothead-llm';
import { PivotEngine } from '@mindfiredigital/pivothead';

const engine = new PivotEngine({
  /* your config */
});

const assistant = new LLMAssistant({
  engine,
  onMessage: (role, text) => appendMessage(role, text),
});

document.getElementById('load-btn').addEventListener('click', async () => {
  await assistant.load(p => {
    document.getElementById('progress').textContent =
      `${Math.round(p.progress * 100)}%`;
  });
  document.getElementById('query-input').disabled = false;
});

document.getElementById('send-btn').addEventListener('click', async () => {
  const input = document.getElementById('query-input');
  await assistant.query(input.value);
  input.value = '';
});
```

</TabItem>
<TabItem value="react" label="React">

```tsx
import { useEffect, useRef, useState } from 'react';
import { LLMAssistant } from '@mindfiredigital/pivothead-llm';

export function LLMChat({ engine }) {
  const assistantRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    assistantRef.current = new LLMAssistant({
      engine,
      onMessage: (role, text) => setMessages(prev => [...prev, { role, text }]),
    });
  }, [engine]);

  const load = async () => {
    await assistantRef.current.load();
    setReady(true);
  };

  const send = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    await assistantRef.current.query(input);
  };

  return (
    <div>
      {!ready && <button onClick={load}>Load LLM</button>}
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={!ready}
      />
      <button onClick={send} disabled={!ready}>
        Send
      </button>
    </div>
  );
}
```

</TabItem>
<TabItem value="vue" label="Vue">

```vue
<template>
  <div>
    <button v-if="!ready" @click="load">Load LLM</button>
    <div class="messages">
      <div v-for="(m, i) in messages" :key="i" :class="`msg msg-${m.role}`">
        {{ m.text }}
      </div>
    </div>
    <input v-model="input" :disabled="!ready" @keyup.enter="send" />
    <button @click="send" :disabled="!ready">Send</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { LLMAssistant } from '@mindfiredigital/pivothead-llm';

const props = defineProps(['engine']);
const messages = ref([]);
const ready = ref(false);
const input = ref('');
let assistant;

onMounted(() => {
  assistant = new LLMAssistant({
    engine: props.engine,
    onMessage: (role, text) => messages.value.push({ role, text }),
  });
});

const load = async () => {
  await assistant.load();
  ready.value = true;
};

const send = async () => {
  if (!input.value.trim()) return;
  messages.value.push({ role: 'user', text: input.value });
  await assistant.query(input.value);
  input.value = '';
};
</script>
```

</TabItem>
</Tabs>

---

## Troubleshooting

### "WebGPU is not available"

WebGPU requires a modern browser and hardware. Try:

- Use **Chrome 113+** or **Edge 113+**
- On Linux, start Chrome with `--enable-unsafe-webgpu` flag
- Check `chrome://flags/#enable-unsafe-webgpu`

### Model takes a long time to load

The first load downloads ~1.5 GB. This is normal — the browser caches it so subsequent loads are instant. Show a progress bar using the `onProgress` callback.

### Query returns no result or wrong result

The built-in model (Llama-3.2-3B) is a small model optimised for low memory use. For best results:

- Use clear, direct language: `"filter country equals France"` rather than `"can you please show me only the France data?"`
- For data questions, include field and value names exactly as they appear in the table

### Styling doesn't apply

Make sure the table has rendered before running a style query. If the table re-renders (due to filter or sort), styles are automatically re-applied.
