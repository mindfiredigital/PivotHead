---
id: angular-setup-for-user-project
title: Setup for Your Project
sidebar_label: Setup for Your Project
---

To use PivotHead's **headless pivot table** in your Angular project, you'll need to use the `@pivothead/angular` package. Here's how to set it up.

**1. Installation**

Install the library via npm:

```bash
npm install @pivothead/angular
```

2. Import the PivotTableService

You'll need to import and inject the PivotTableService into your component or service where you want to use it.

```TypeScript

import { Component } from '@angular/core';
import { PivotTableService } from '@pivothead/angular';

@Component({ /* ... */ })
export class MyComponent {
  constructor(private pivotTableService: PivotTableService) {}
}
```

3. Create the Pivot Table

Use the createPivotTable method of the service to generate your pivot table data.

```TypeScript

const data = [/* ... */];
const config = { /* ... */ };

const pivotTableData = this.pivotTableService.createPivotTable(data, config);
```

4. Render Your View

You can then use the pivotTableData object in your template to render your custom pivot table. The data is structured for easy iteration, allowing you to build the exact UI you need for your headless pivot table.
