---
id: virtual-scrolling
title: Virtual Scrolling for Large Datasets
sidebar_label: Virtual Scrolling
---

# Virtual Scrolling for Large Datasets

When working with very large datasets, rendering thousands of rows in the pivot table can lead to performance issues and a sluggish user interface. To solve this, PivotHead includes a **virtual scrolling** feature.

## What is Virtual Scrolling?

Virtual scrolling is a rendering technique where only the visible rows are mounted in the DOM. As the user scrolls, rows that move out of the viewport are unmounted, and new rows that move into the viewport are mounted.

This approach has several key benefits:

- **Improved Performance**: By rendering only a small subset of the total rows, the browser has much less work to do, resulting in a faster and more responsive UI.
- **Reduced Memory Usage**: Fewer DOM elements mean less memory is consumed by the browser.
- **Faster Initial Load**: The pivot table can be displayed much more quickly, as it doesn't need to render the entire dataset at once.

## Enabling Virtual Scrolling

You can enable virtual scrolling by setting the `virtualScrolling` prop or attribute to `true`.

### React Example

```jsx
import { PivotHead } from '@mindfiredigital/pivothead-react';

function App() {
  return (
    <PivotHead
      data={largeDataset}
      options={pivotOptions}
      virtualScrolling={true}
    />
  );
}
```

### Vue Example

```vue
<template>
  <PivotHead
    :data="largeDataset"
    :options="pivotOptions"
    :virtual-scrolling="true"
  />
</template>

<script setup>
// ...
</script>
```

### Angular Example

```html
<pivot-head-wrapper
  [data]="largeDataset"
  [options]="pivotOptions"
  [virtualScrolling]="true"
>
</pivot-head-wrapper>
```

### Core Web Component Example

```html
<pivot-head id="pivot-table" virtual-scrolling> </pivot-head>

<script>
  const pivot = document.getElementById('pivot-table');
  pivot.data = largeDataset;
  pivot.options = pivotOptions;
</script>
```

## When to Use Virtual Scrolling

Virtual scrolling is recommended when you are dealing with datasets that can result in more than a few hundred rows in the pivot table view. For smaller datasets, the performance benefits will be negligible, and standard rendering is sufficient.
