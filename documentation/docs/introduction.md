---
sidebar_position: 1
title: Introduction
description: An introduction to the first truly headless pivot table library for JavaScript.
---

# What is PivotHead Core?

**PivotHead is a powerful and flexible headless library for creating interactive pivot tables in JavaScript applications.** It provides a core engine for data manipulation, aggregation, and analysis, completely decoupled from the user interface. This makes it the first truly headless pivot table solution, giving you the power to build any data visualization you can imagine.

![PivotHead Banner](https://github.com/user-attachments/assets/78de8bf8-7738-4917-88ce-7cf0a16da24b)

## **The Headless Advantage**

A "headless" library provides all the backend logic without shipping a pre-built, styled user interface. Think of it as a powerful car engine without the car's body. You get all the performance and functionality, with complete freedom to design the vehicle around it.

### Pros of the Headless Approach

- **✨ Ultimate UI Flexibility**: You are not locked into a specific table design. Build custom tables, grids, charts, or any other visualization that fits your application's design system perfectly.
- **🌐 Framework Agnostic**: The core engine is pure TypeScript, making it compatible with any JavaScript framework (React, Vue, Svelte, Angular) or even vanilla JavaScript.
- **⚡️ Better Performance**: By separating data logic from rendering, your application can perform complex calculations without being slowed down by UI updates. You control the rendering strategy.
- **🧩 Seamless Integration**: Easily integrate PivotHead into your existing component libraries and design systems without fighting against pre-defined styles.

### Cons of the Headless Approach

- **More Initial Setup**: Since there is no pre-built UI, you are responsible for writing the code that renders the pivot table's state.
- **Not a Drop-in UI Component**: If you need a fully-styled pivot table out of the box with minimal effort, a headless library requires more work than a traditional UI-component library.

## Key Features

PivotHead comes packed with features designed to handle complex data visualization needs:

| Feature                        | Description                                                                 |
| ------------------------------ | --------------------------------------------------------------------------- |
| **Flexible Data Pivoting**     | Transform and analyze data from multiple perspectives.                      |
| **Advanced Aggregation**       | Use sum, average, count, min, max, or define your own custom aggregations.  |
| **Sorting & Filtering**        | Comprehensive options for data refinement and exploration.                  |
| **Multi-dimensional Grouping** | Group data by multiple row and column fields simultaneously.                |
| **Interactive UI Support**     | Core logic for drag & drop, column resizing, and row expansion is built-in. |
| **Conditional Formatting**     | Define rules to highlight important data with custom styling.               |
| **Custom Measures & Formulas** | Create new, calculated fields using powerful custom formulas.               |
| **Framework Compatibility**    | Built to be used with wrappers for React, Vue, Svelte, and Angular.         |
