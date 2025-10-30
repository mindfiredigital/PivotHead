---
id: react-sample-project
title: Sample Project
sidebar_label: Sample Project
---

Let's build a simple React application to demonstrate how to use the `@pivothead/react` package to create a **headless pivot table**.

**1. Create a React App**

Start by creating a new React project:

```bash
npx create-react-app pivothead-react-example
cd pivothead-react-example
```

2. Install PivotHead for React

Add the PivotHead React library to your project:

```bash

npm install @pivothead/react
```

3. Create the Pivot Table Component

Replace the content of src/App.js with the following code:

```JavaScript

import React from 'react';
import { usePivotTable } from '@pivothead/react';

const data = [
  { city: 'New York', category: 'Fruit', sales: 500 },
  { city: 'New York', category: 'Vegetable', sales: 300 },
  { city: 'London', category: 'Fruit', sales: 600 },
  { city: 'London', category: 'Vegetable', sales: 350 },
];

const config = {
  rows: ['city'],
  columns: ['category'],
  measures: ['sales'],
};

function App() {
  const { headers, rows, values } = usePivotTable(data, config);

  return (
    <div>
      <h1>My Headless Pivot Table</h1>
      <table>
        <thead>
          <tr>
            {headers.map(header => <th key={header.key}>{header.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key}>
              {row.cells.map(cell => <td key={cell.key}>{cell.value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
```

4. Run the Application

Start the development server to see your pivot table in action:

```bash
npm start
```
