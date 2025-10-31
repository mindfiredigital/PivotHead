---
title: Headless Quick Start
description: Get started with PivotHead's headless architecture in 5 minutes
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import HeadlessArchitectureVisual from '@site/src/components/HeadlessArchitectureVisual';

# **Quick Start**

This guide will walk you through creating your first project with PivotHead's headless architecture in just 10 minutes!

## **What You'll Build**

A simple, customized pivot table that showcases the power of headless architecture:

- 100% custom styling
- Interactive data exploration
- Framework of your choice
- Production-ready code

## **Choose Your Path**

<Tabs>
<TabItem value="react" label="React" default>

### React Setup (5 minutes)

#### 1. Create a new React project

```bash
npx create-react-app my-pivot-app
cd my-pivot-app
```

#### **2. Install PivotHead**

```bash
npm install @pivothead/react
```

#### **3. Create your custom pivot component**

Create `src/MyCustomPivot.jsx`:

```jsx
import React from 'react';
import { usePivot } from '@pivothead/react';
import './MyCustomPivot.css';

const sampleData = [
  {
    product: 'Widget A',
    region: 'North',
    quarter: 'Q1',
    sales: 1000,
    profit: 200,
  },
  {
    product: 'Widget A',
    region: 'South',
    quarter: 'Q1',
    sales: 1500,
    profit: 300,
  },
  {
    product: 'Widget B',
    region: 'North',
    quarter: 'Q1',
    sales: 2000,
    profit: 400,
  },
  {
    product: 'Widget B',
    region: 'South',
    quarter: 'Q1',
    sales: 1800,
    profit: 350,
  },
  {
    product: 'Widget A',
    region: 'North',
    quarter: 'Q2',
    sales: 1200,
    profit: 250,
  },
  {
    product: 'Widget A',
    region: 'South',
    quarter: 'Q2',
    sales: 1600,
    profit: 320,
  },
];

function MyCustomPivot() {
  const { pivotData, config, updateConfig } = usePivot(sampleData, {
    rows: ['product'],
    columns: ['region'],
    values: ['sales'],
    aggregation: 'sum',
  });

  return (
    <div className="custom-pivot-container">
      <h1>My Custom Pivot Dashboard</h1>

      {/* This is YOUR custom table - style it however you want! */}
      <div className="pivot-table">
        <table>
          <thead>
            <tr>
              <th className="corner-cell">Product</th>
              {pivotData.columns.map(col => (
                <th key={col} className="column-header">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pivotData.rows.map(row => (
              <tr key={row.key}>
                <td className="row-header">{row.label}</td>
                {row.values.map((value, idx) => (
                  <td key={idx} className="data-cell">
                    ${value.toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add your custom controls */}
      <div className="controls">
        <button onClick={() => updateConfig({ aggregation: 'sum' })}>
          Show Sum
        </button>
        <button onClick={() => updateConfig({ aggregation: 'avg' })}>
          Show Average
        </button>
      </div>
    </div>
  );
}

export default MyCustomPivot;
```

#### **4. Add your custom styling**

Create `src/MyCustomPivot.css`:

```css
.custom-pivot-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1 {
  color: #dc2626;
  text-align: center;
  margin-bottom: 2rem;
}

.pivot-table {
  overflow-x: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.corner-cell {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  font-weight: bold;
}

.column-header {
  background: #fee2e2;
  color: #991b1b;
  font-weight: 600;
  text-align: center;
}

.row-header {
  background: #fef2f2;
  color: #7f1d1d;
  font-weight: 600;
}

.data-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  background: white;
  transition: background-color 0.2s;
}

.data-cell:hover {
  background-color: #fef2f2;
  cursor: pointer;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.controls button {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls button:hover {
  background: #991b1b;
}
```

#### **5. Use it in your app**

Update `src/App.js`:

```jsx
import React from 'react';
import MyCustomPivot from './MyCustomPivot';
import './App.css';

function App() {
  return (
    <div className="App">
      <MyCustomPivot />
    </div>
  );
}

export default App;
```

#### **6. Run your app**

```bash
npm start
```

**That's it!** You now have a fully functional, custom-styled pivot table powered by PivotHead's headless engine.

</TabItem>

<TabItem value="vue" label="Vue">

### **Vue Setup (5 minutes)**

#### **1. Create a new Vue project**

```bash
npm create vue@latest my-pivot-app
cd my-pivot-app
npm install
```

#### **2. Install PivotHead**

```bash
npm install @pivothead/vue
```

#### **3. Create your custom pivot component**

Create `src/components/MyCustomPivot.vue`:

```vue
<template>
  <div class="custom-pivot-container">
    <h1>My Custom Pivot Dashboard</h1>

    <div class="pivot-table">
      <table>
        <thead>
          <tr>
            <th class="corner-cell">Product</th>
            <th v-for="col in columns" :key="col" class="column-header">
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <td class="row-header">{{ row.label }}</td>
            <td v-for="(value, idx) in row.values" :key="idx" class="data-cell">
              ${{ value.toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="controls">
      <button @click="setAggregation('sum')">Show Sum</button>
      <button @click="setAggregation('avg')">Show Average</button>
    </div>
  </div>
</template>

<script setup>
import { usePivot } from '@pivothead/vue';

const sampleData = [
  {
    product: 'Widget A',
    region: 'North',
    quarter: 'Q1',
    sales: 1000,
    profit: 200,
  },
  {
    product: 'Widget A',
    region: 'South',
    quarter: 'Q1',
    sales: 1500,
    profit: 300,
  },
  {
    product: 'Widget B',
    region: 'North',
    quarter: 'Q1',
    sales: 2000,
    profit: 400,
  },
  {
    product: 'Widget B',
    region: 'South',
    quarter: 'Q1',
    sales: 1800,
    profit: 350,
  },
];

const { rows, columns, updateConfig } = usePivot(sampleData, {
  rows: ['product'],
  columns: ['region'],
  values: ['sales'],
  aggregation: 'sum',
});

const setAggregation = type => {
  updateConfig({ aggregation: type });
};
</script>

<style scoped>
.custom-pivot-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

h1 {
  color: #dc2626;
  text-align: center;
  margin-bottom: 2rem;
}

.pivot-table {
  overflow-x: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.corner-cell {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  font-weight: bold;
}

.column-header {
  background: #fee2e2;
  color: #991b1b;
  font-weight: 600;
  text-align: center;
}

.row-header {
  background: #fef2f2;
  color: #7f1d1d;
  font-weight: 600;
}

.data-cell {
  text-align: right;
  background: white;
  transition: background-color 0.2s;
}

.data-cell:hover {
  background-color: #fef2f2;
  cursor: pointer;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.controls button {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls button:hover {
  background: #991b1b;
}
</style>
```

#### 4. Use it in your app

Update `src/App.vue`:

```vue
<template>
  <MyCustomPivot />
</template>

<script setup>
import MyCustomPivot from './components/MyCustomPivot.vue';
</script>
```

#### **5. Run your app**

```bash
npm run dev
```

**Done!** You have a beautiful, custom pivot table with Vue!

</TabItem>

<TabItem value="angular" label="Angular">

### **Angular Setup (5 minutes)**

#### **1. Create a new Angular project**

```bash
npx @angular/cli new my-pivot-app
cd my-pivot-app
```

#### **2. Install PivotHead**

```bash
npm install @pivothead/core @pivothead/angular
```

#### **3. Create your custom pivot component**

```bash
ng generate component my-custom-pivot
```

Update `src/app/my-custom-pivot/my-custom-pivot.component.ts`:

```typescript
import { Component } from '@angular/core';
import { PivotService } from '@pivothead/angular';

@Component({
  selector: 'app-my-custom-pivot',
  templateUrl: './my-custom-pivot.component.html',
  styleUrls: ['./my-custom-pivot.component.css'],
})
export class MyCustomPivotComponent {
  sampleData = [
    { product: 'Widget A', region: 'North', sales: 1000 },
    { product: 'Widget A', region: 'South', sales: 1500 },
    { product: 'Widget B', region: 'North', sales: 2000 },
    { product: 'Widget B', region: 'South', sales: 1800 },
  ];

  pivotConfig = {
    rows: ['product'],
    columns: ['region'],
    values: ['sales'],
    aggregation: 'sum',
  };

  constructor(public pivotService: PivotService) {
    this.pivotService.initialize(this.sampleData, this.pivotConfig);
  }

  setAggregation(type: string) {
    this.pivotService.updateConfig({ aggregation: type });
  }
}
```

Update `src/app/my-custom-pivot/my-custom-pivot.component.html`:

```html
<div class="custom-pivot-container">
  <h1>My Custom Pivot Dashboard</h1>

  <div class="pivot-table">
    <table>
      <thead>
        <tr>
          <th class="corner-cell">Product</th>
          <th *ngFor="let col of pivotService.columns" class="column-header">
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of pivotService.rows">
          <td class="row-header">{{ row.label }}</td>
          <td *ngFor="let value of row.values" class="data-cell">
            ${{ value | number }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="controls">
    <button (click)="setAggregation('sum')">Show Sum</button>
    <button (click)="setAggregation('avg')">Show Average</button>
  </div>
</div>
```

Add the same CSS from the React example to `my-custom-pivot.component.css`

#### **4. Run your app**

```bash
ng serve
```

**Success!** Your Angular app with custom pivot is ready!

</TabItem>

<TabItem value="vanilla" label="Vanilla JS">

### **Vanilla JavaScript Setup (5 minutes)**

#### **1. Create project structure**

```bash
mkdir my-pivot-app
cd my-pivot-app
npm init -y
```

#### **2. Install PivotHead**

```bash
npm install @pivothead/core @pivothead/webcomponent
```

#### **3. Create your HTML file**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Pivot App</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="custom-pivot-container">
      <h1>My Custom Pivot Dashboard</h1>

      <div id="pivot-table" class="pivot-table"></div>

      <div class="controls">
        <button onclick="updateAggregation('sum')">Show Sum</button>
        <button onclick="updateAggregation('avg')">Show Average</button>
      </div>
    </div>

    <script type="module" src="app.js"></script>
  </body>
</html>
```

#### **4. Create your JavaScript**

Create `app.js`:

```javascript
import { PivotEngine } from '@pivothead/core';

const sampleData = [
  { product: 'Widget A', region: 'North', sales: 1000 },
  { product: 'Widget A', region: 'South', sales: 1500 },
  { product: 'Widget B', region: 'North', sales: 2000 },
  { product: 'Widget B', region: 'South', sales: 1800 },
];

let config = {
  rows: ['product'],
  columns: ['region'],
  values: ['sales'],
  aggregation: 'sum',
};

let engine = new PivotEngine(sampleData, config);

function renderTable() {
  const data = engine.getPivotData();
  const tableContainer = document.getElementById('pivot-table');

  let html = '<table><thead><tr>';
  html += '<th class="corner-cell">Product</th>';
  data.columns.forEach(col => {
    html += `<th class="column-header">${col}</th>`;
  });
  html += '</tr></thead><tbody>';

  data.rows.forEach(row => {
    html += '<tr>';
    html += `<td class="row-header">${row.label}</td>`;
    row.values.forEach(value => {
      html += `<td class="data-cell">$${value.toLocaleString()}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}

window.updateAggregation = function (type) {
  config.aggregation = type;
  engine.updateConfig(config);
  renderTable();
};

renderTable();
```

#### 5. Add styling

Create `styles.css` (use the same CSS from React example)

#### 6. Run with a local server

```bash
npx serve
```

**Perfect!** No framework, pure JavaScript power!

</TabItem>
</Tabs>

## What's Next?

Now that you have a working headless pivot table, here are some ways to extend it:

### 1. Add Custom Visualizations

```jsx
import { Chart } from 'chart.js';

function MyPivotWithChart() {
  const { pivotData } = usePivot(data, config);

  return (
    <>
      <MyCustomTable data={pivotData} />
      <MyCustomChart data={pivotData} />
    </>
  );
}
```

### **2. Add Export Functionality**

```jsx
function exportToCSV() {
  const csv = engine.exportToCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pivot-data.csv';
  a.click();
}
```

### **3. Add Real-time Data**

```jsx
function MyLivePivot() {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/live-data')
        .then(res => res.json())
        .then(newData => setData(newData));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const { pivotData } = usePivot(data, config);

  return <MyCustomTable data={pivotData} />;
}
```

### **4. Integrate with Your Design System**

```jsx
// Use Material-UI
import { Table, TableHead, TableBody } from '@mui/material';

// Use Ant Design
import { Table } from 'antd';

// Use Bootstrap
import { Table } from 'react-bootstrap';

// Or your own custom components!
```

## **Pro Tips**

1. **Start Simple**: Begin with basic functionality, then add features incrementally
2. **Test Early**: Write tests for both the engine logic and your UI components
3. **Performance**: Use React.memo / Vue computed / Angular trackBy for large datasets
4. **Accessibility**: Add ARIA labels and keyboard navigation to your custom UI
5. **Responsive**: Make your pivot table mobile-friendly from the start

## **Customization Ideas**

Here are some ways you can customize your pivot table:

1. **Themes**: Dark mode, light mode, brand colors
2. **Layouts**: Card view, compact view, expanded view
3. **Interactions**: Drag-and-drop, inline editing, drill-down
4. **Visualizations**: Charts, sparklines, heatmaps
5. **Export**: PDF, Excel, CSV, JSON
6. **Filters**: Advanced filtering UI, date ranges, search
7. **Calculations**: Custom formulas, running totals, percentages

## Remember: With PivotHead's headless architecture, your imagination is the only limit!
