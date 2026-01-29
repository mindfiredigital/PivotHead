---
id: vue-sample-project
title: Sample Project
sidebar_label: Sample Project
---

This guide will show you how to create a basic Vue application using `@pivothead/vue` to build a **headless pivot table**.

**1. Create a Vue Project**

First, set up a new Vue project using the Vue CLI:

```bash
npm init vue@latest
Follow the prompts to create your project.

2. Install PivotHead for Vue

Navigate to your project directory and install the PivotHead Vue library:

Bash

cd <your-project-name>
npm install @pivothead/vue
3. Create the Pivot Table Component

In your src/components directory, create a new component, for example, PivotTable.vue:

Code snippet

<template>
  <div>
    <h1>My Headless Pivot Table</h1>
    <table>
      <thead>
        <tr>
          <th v-for="header in pivotTable.headers" :key="header.key">{{ header.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in pivotTable.rows" :key="row.key">
          <td v-for="cell in row.cells" :key="cell.key">{{ cell.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { usePivotTable } from '@pivothead/vue';

const data = [
  { continent: 'NA', country: 'USA', sales: 1000 },
  { continent: 'NA', country: 'Canada', sales: 800 },
  { continent: 'EU', country: 'UK', sales: 1200 },
  { continent: 'EU', country: 'Germany', sales: 1100 },
];



const pivotTable = usePivotTable(data, config);
</script>
4. Use the Component

You can now use your PivotTable component in your App.vue or any other part of your application.
```
