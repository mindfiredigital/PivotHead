---
id: angular-sample-project
title: Sample Project
sidebar_label: Sample Project
---

This tutorial will guide you through creating a simple Angular application that uses `@pivothead/angular` to render a **headless pivot table**.

**1. Create an Angular Project**

Use the Angular CLI to create a new project:

```bash
ng new pivothead-angular-example
cd pivothead-angular-example



2. Install PivotHead for Angular

Install the PivotHead Angular library:

Bash

npm install @pivothead/angular
3. Implement the Pivot Table

In your src/app/app.component.ts, set up the pivot table:

TypeScript

import { Component } from '@angular/core';
import { PivotTableService } from '@pivothead/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  pivotTableData;

  constructor(private pivotTableService: PivotTableService) {
    const data = [
      { year: 2023, quarter: 'Q1', revenue: 5000 },
      { year: 2023, quarter: 'Q2', revenue: 6000 },
      { year: 2024, quarter: 'Q1', revenue: 5500 },
      { year: 2024, quarter: 'Q2', revenue: 6500 },
    ];

    const config = {
      rows: ['year'],
      columns: ['quarter'],
      measures: ['revenue'],
    };

    this.pivotTableData = this.pivotTableService.createPivotTable(data, config);
  }
}
And in your src/app/app.component.html:

HTML

<div>
  <h1>My Headless Pivot Table</h1>
  <table>
    <thead>
      <tr>
        <th *ngFor="let header of pivotTableData.headers">{{ header.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let row of pivotTableData.rows">
        <td *ngFor="let cell of row.cells">{{ cell.value }}</td>
      </tr>
    </tbody>
  </table>
</div>
4. Run the Application

Start the development server:

Bash

ng serve
```
