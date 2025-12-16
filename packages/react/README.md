# PivotHead React Wrapper

A thin React wrapper around `@mindfiredigital/pivothead-web-component` that preserves all functionality and supports all modes: `default`, `minimal`, and `none`.

### Blazing Fast CSV Processing with WebAssembly

This component leverages the power of WebAssembly (WASM) for high-performance, in-browser CSV data processing. This allows for:

- **Large File Support:** Efficiently process CSV files up to 1GB directly in the browser.
- **Enhanced Performance:** Experience significantly faster data loading and manipulation, as the heavy lifting is done by a pre-compiled WASM module.
- **Improved User Experience:** Reduced wait times and a smoother, more responsive interface when working with large datasets.

Install (inside the monorepo):

- Add the package in workspace and run `pnpm -w i`
- Build with `pnpm -w build`

## Usage

Below are some examples of how to use the `PivotHead` component in your React application.

### Basic Example

Here's a basic example of how to render the pivot table with some data and options.

```tsx
import { PivotHead } from '@mindfiredigital/pivothead-react';
import { useRef, useEffect } from 'react';

// Sample Data
const data = [
  { product: 'A', region: 'East', sales: 100 },
  { product: 'B', region: 'West', sales: 150 },
  // ... more data
];

// Pivot Table Options
const options = {
  rows: ['product'],
  columns: ['region'],
  values: ['sales'],
};

export default function App() {
  return <PivotHead mode="default" data={data} options={options} />;
}
```

### Accessing Component Methods

You can access the methods of the underlying web component by using a `ref`.

```tsx
import { PivotHead } from '@mindfiredigital/pivothead-react';
import { useRef, useEffect } from 'react';

export default function App() {
  const pivotRef = useRef(null);

  useEffect(() => {
    // Example of calling a method on the component
    const state = pivotRef.current?.methods.getState();
    console.log('Pivot Table State:', state);
  }, []);

  return (
    <PivotHead
      // ... other props
      ref={pivotRef}
    />
  );
}
```

### Handling State Changes

The `onStateChange` event is fired whenever the internal state of the pivot table changes (e.g., when a user drags and drops a field).

```tsx
import { PivotHead } from '@mindfiredigital/pivothead-react';

export default function App() {
  const handleStateChange = event => {
    console.log('Pivot table state changed:', event.detail);
  };

  return (
    <PivotHead
      // ... other props
      onStateChange={handleStateChange}
    />
  );
}
```

### Using Different Modes

The component supports three modes: `default`, `minimal`, and `none`.

**Minimal Mode**

The `minimal` mode provides a simplified UI.

```tsx
<PivotHead mode="minimal" data={data} options={options} />
```

**None Mode (Headless)**

The `none` mode renders no UI, giving you complete control over the presentation. This is useful when you want to build a custom UI on top of the pivot engine.

```tsx
<PivotHead mode="none" data={data} options={options} />
```
