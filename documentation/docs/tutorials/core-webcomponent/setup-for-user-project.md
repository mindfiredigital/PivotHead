# setup-for-user-project

## Overview

The PivotHead Web Component (`@mindfiredigital/pivothead-web-component`) provides a flexible, framework-agnostic solution for integrating pivot table functionality into any web application. Built as a native Web Component, it offers three distinct rendering modes to accommodate different use cases and UI requirements.

The package wraps the core PivotHead functionality in a custom HTML element (`<pivot-head>`). This approach ensures compatibility with any JavaScript framework or vanilla HTML while providing:

- **Framework Agnostic**: Works with React, Vue, Angular, or plain HTML
- **Three Rendering Modes**: Choose between a full UI, a slot-based layout, or a completely headless implementation
- **Rich API**: Complete access to pivot functionality through properties, methods, and events
- **TypeScript Support**: Full type definitions included for a better development experience
- **Shadow DOM**: Encapsulated styles prevent CSS conflicts with your application

## Installation

Install the web component package in your project:

```bash
npm install @mindfiredigital/pivothead-web-component
```

Then, import the component in your main JavaScript file to register the `<pivot-head>` custom element:

```javascript
import '@mindfiredigital/pivothead-web-component';
```

## Rendering Modes

The web component supports three modes, controlled by the `mode` attribute.

### 1. Default Mode (Full UI)

This mode renders a complete pivot table interface with built-in controls, filters, and pagination. It's the quickest way to get a full-featured pivot table running.

**Usage:**

```html
<pivot-head
  data='[{"country":"USA","category":"Bikes","price":1500}]'
  options='{
    "rows":[{"uniqueName":"country","caption":"Country"}],
    "columns":[{"uniqueName":"category","caption":"Category"}],
    "measures":[{"uniqueName":"price","caption":"Total Price","aggregation":"sum"}]
  }'
></pivot-head>
```

**When to Use:**

- For rapid prototyping and demos
- When you need a standard, out-of-the-box pivot table with minimal setup

### 2. Minimal Mode (Slot-based)

This mode provides a lightweight container with named slots (header and body), giving you control over the UI while leveraging the component's data processing.

**Usage:**

```html
<pivot-head mode="minimal" id="pivot">
  <div slot="header">
    <button id="exportBtn">Export PDF</button>
  </div>

  <div slot="body">
    <table id="custom-table"></table>
  </div>
</pivot-head>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';
  const pivot = document.getElementById('pivot');
  const table = document.getElementById('custom-table');

  pivot.data = yourDataArray;
  pivot.options = yourOptionsObject;

  pivot.addEventListener('stateChange', e => {
    const state = e.detail;
    // Your custom rendering logic here
    renderMyTable(table, state.processedData);
  });

  document.getElementById('exportBtn').onclick = () => {
    pivot.exportToPDF();
  };
</script>
```

**When to Use:**

- When you need to match your application's specific design system
- For adding custom controls or integrating with existing component libraries

### 3. None Mode (Headless)

This mode provides pure data processing without rendering any UI. The component can be hidden, and you interact with it entirely through its JavaScript API to build a completely custom experience.

**Usage:**

```html
<pivot-head id="pivot" mode="none" style="display: none;"></pivot-head>

<div id="my-custom-ui">
  <button id="sortBtn">Sort by Sales</button>
  <div id="results"></div>
</div>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';
  const pivot = document.getElementById('pivot');

  pivot.data = yourDataArray;
  pivot.options = yourOptionsObject;

  pivot.addEventListener('stateChange', e => {
    const state = e.detail;
    // Logic to render your entire UI from scratch
    buildMyUI(state);
  });

  document.getElementById('sortBtn').onclick = () => {
    pivot.sort('sales', 'desc');
  };
</script>
```

**When to Use:**

- For maximum flexibility and complete control over the UI
- When integrating pivot logic into complex or non-tabular data visualizations

## Setup for Your Project

Integrating PivotHead's core web component into your existing project is a straightforward process.

### Step 1: Installation

Add the PivotHead web component to your project's dependencies:

```bash
npm install @mindfiredigital/pivothead-web-component
```

### Step 2: Import the Component

In your main JavaScript file (e.g., `index.js` or `app.js`), import the library to register the `<pivot-head>` custom element. This only needs to be done once in your application.

```javascript
import '@mindfiredigital/pivothead-web-component';
```

### Step 3: Add to Your HTML

Place the `<pivot-head>` tag in your HTML file where you want the pivot table to appear. You can configure it directly with attributes.

```html
<pivot-head
  data-url="path/to/your/data.json"
  options-url="path/to/your/config.json"
></pivot-head>
```

### Step 4: (Optional) Configure with JavaScript

For more dynamic control, you can get a reference to the element and set its properties in JavaScript.

```html
<pivot-head id="my-pivot-table"></pivot-head>
```

```javascript
const pivotElement = document.getElementById('my-pivot-table');

const myData = [
  { country: 'USA', sales: 1500 },
  // ... more data
];

const myOptions = {
  rows: [{ uniqueName: 'country' }],
  measures: [{ uniqueName: 'sales', aggregation: 'sum' }],
};

// Set properties directly
pivotElement.data = myData;
pivotElement.options = myOptions;

// Listen for events
pivotElement.addEventListener('stateChange', event => {
  console.log('Pivot table state has changed:', event.detail);
});
```
