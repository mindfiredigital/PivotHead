---
id: angular-conceptual-reference
title: Angular concept
sidebar_label: Angular
---

## **Angular Service Integration**

A powerful, headless integration for Angular that provides pivot logic via a native Angular Service. This approach ensures seamless integration with Angular's Dependency Injection (DI) system, TypeScript support, and common design patterns.

## Overview

The PivotHead Angular integration (@pivothead/angular) offers:

Native Angular Service: Integrates via DI, aligning with Angular's core architecture.

Headless Architecture: Provides pure data processing logic with no UI. You build a 100% custom component template.

TypeScript Support: Complete type definitions for all service methods and data models.

Separation of Concerns: Enforces Angular's philosophy by keeping data logic in the service and presentation logic in the component.

Testability: The service-based architecture is easily mockable, simplifying component unit testing.

Ecosystem Compatibility: Works naturally within the Angular ecosystem, including change detection and component lifecycles.

## **Architecture**

Data Flow

The conceptual flow follows Angular's standard service-oriented pattern:

```
Angular Component (Template)
     ↓ (Injects)
PivotTableService
     ↓ (Consumes)
@mindfiredigital/pivothead (Core Engine)
```

## **Integration Concept**

The Angular integration operates on a principle of logic separation:

The Component: Your Angular component is responsible for gathering inputs (raw data, configuration) and rendering the final UI in its template (e.g., using \*ngFor to build a custom table).

The Service: The PivotTableService is injected into your component. Its sole responsibility is to receive the raw data and configuration, run the core pivot engine, and return the processed PivotData object.

The Contract: The component calls methods on the service (e.g., createPivotTable()) and receives the processed data, which it then binds to its template. This keeps your component "dumb" (focused on presentation) and the service "smart" (focused on logic).

## **Conclusion**

The PivotHead Angular integration provides a robust, developer-friendly solution that is idiomatic to the Angular ecosystem. By focusing on a headless, service-based architecture, it offers maximum flexibility and testability.

Key Strengths

**Native Integration:** Feels like a natural part of Angular, using DI and services.

**Headless Flexibility:** You have 100% control over the HTML template, styling, and user interaction.

**Testability:** Decoupling the UI from the logic makes testing components and services in isolation simple.

**Separation of Concerns:** Enforces clean architecture, leading to more maintainable and scalable code.

## **Use Cases**

The Angular service integration excels in:

Custom Business Intelligence (BI) Dashboards: Building bespoke BI tools that match your company's design system.

Enterprise Reporting: Creating complex, data-heavy reports with custom export and filtering logic.

Data-Heavy Admin Panels: Implementing advanced data tables within internal applications.

Performance-Critical Applications: Giving you full control over the rendering strategy (e.g., virtual scrolling) for large datasets.
The @pivothead/angular library integrates the PivotHead engine into the Angular ecosystem. It provides a headless pivot table solution that feels native to Angular development.

## **Definitions and Scope**

This package provides its functionality as an Angular Service, which is the standard Angular pattern for sharing logic and data across components. This document outlines the high-level concept of this integration.

This document excludes procedural setup instructions and specific API method signatures, which are available in the API and tutorial documents.

## **Context and Background**

A Service-Based Architecture
Unlike wrappers that provide a component, the Angular integration provides the PivotTableService.

## **Dependency Injection**

You import and inject PivotTableService into your Angular components or other services using Angular's built-in dependency injection (DI) system.

## **Logic Separation**

This approach aligns with Angular's philosophy of separating presentation logic (in the Component) from business logic (in the Service). Your component remains lean and focused on rendering, while the service handles the work of data processing.

## **Testability**

By isolating the pivot logic in a service, you can easily mock and test your components and the pivot logic separately.

## **Organization**

The primary concept is the createPivotTable method on the injected service. Your component collects the raw data and configuration, passes it to this service method, and receives the processed pivot table object in return, which it can then use to render a custom template.
