---
id: react-conceptual-reference
title: React Concepts
sidebar_label: React
---

# React Wrapper

The PivotHead React Wrapper (`@mindfiredigital/pivothead-react`) is a thin, type-safe React component that bridges React applications with the PivotHead Web Component. It provides a seamless React developer experience while preserving all the functionality and modes of the underlying web component.

## Overview

The React wrapper serves as an intelligent bridge that:

- **Preserves All Web Component Functionality**: Supports all three modes (default, minimal, none) with full feature parity
- **Provides React-Native API**: Type-safe props, refs, and event handlers that feel natural in React applications
- **Handles React-Specific Concerns**: Proper prop synchronization, event handling, and lifecycle management
- **Maintains Performance**: Efficient updates and minimal re-rendering through smart prop management
- **Offers TypeScript Support**: Full type definitions for all props, events, and methods

## Architecture

### Bridge Design

The wrapper acts as a bridge between React's declarative paradigm and the Web Component's imperative API:

```
React App → React Wrapper → Web Component → PivotHead Engine
    ↑            ↑              ↑              ↑
 Props/JSX   Type Safety   Custom Element   Core Logic
```

### Key Components

- **PivotHead Component**: Main React wrapper component
- **Type Definitions**: Comprehensive TypeScript interfaces
- **Event Handlers**: React-friendly event system
- **Ref API**: Imperative access to web component methods
- **Prop Synchronization**: Efficient data flow management

## Installation

Install the React wrapper in your React project:

```bash
npm install @mindfiredigital/pivothead-react
```

The wrapper automatically includes the web component as a dependency, so no additional installations are needed.

### Peer Dependencies

- React ≥ 17
- React DOM ≥ 17

## Basic Usage

### Simple Integration

```tsx
import React from 'react';
import { PivotHead } from '@mindfiredigital/pivothead-react';

const salesData = [
  { country: 'USA', category: 'Electronics', sales: 1500, discount: 150 },
  { country: 'Canada', category: 'Cars', sales: 1800, discount: 90 },
  { country: 'Australia', category: 'Accessories', sales: 1200, discount: 120 },
];

const options = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
    { uniqueName: 'discount', caption: 'Total Discount', aggregation: 'sum' },
  ],
};

export default function App() {
  return (
    <div>
      <h1>Sales Dashboard</h1>
      <PivotHead mode="default" data={salesData} options={options} />
    </div>
  );
}
```

## Three Rendering Modes

The React wrapper supports all three modes from the web component, each optimized for different use cases:

### 1. Default Mode

Complete UI rendered by the component with built-in controls and functionality.

<details>
<summary>Click to view the complete Default Mode example</summary>

```tsx
import React, { useRef } from 'react';
import { PivotHead, PivotHeadRef } from '@mindfiredigital/pivothead-react';

export default function DefaultExample() {
  const pivotRef = useRef<PivotHeadRef>(null);

  const handleExport = () => {
    pivotRef.current?.methods.exportToExcel('sales-report');
  };

  const switchToRawData = () => {
    pivotRef.current?.methods.setViewMode('raw');
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button onClick={switchToRawData}>View Raw Data</button>
        <button onClick={handleExport}>Export Excel</button>
      </div>

      <PivotHead
        ref={pivotRef}
        mode="default"
        data={salesData}
        options={options}
        onStateChange={e => {
          console.log('Pivot state changed:', e.detail);
        }}
      />
    </div>
  );
}
```

</details>

### 2. Minimal Mode

Slot-based architecture where you provide custom header and body components.

<details>
<summary>Click to view the complete Minimal Mode example</summary>

```tsx
import React, { useState, useRef } from 'react';
import {
  PivotHead,
  PivotHeadRef,
  PivotTableState,
} from '@mindfiredigital/pivothead-react';

export default function MinimalExample() {
  const pivotRef = useRef<PivotHeadRef>(null);
  const [currentState, setCurrentState] = useState<PivotTableState | null>(
    null
  );
  const [pageSize, setPageSize] = useState(10);

  const handleStateChange = (e: CustomEvent<PivotTableState>) => {
    setCurrentState(e.detail);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    pivotRef.current?.methods.setPageSize(size);
  };

  const handleExport = () => {
    pivotRef.current?.methods.exportToPDF('custom-report');
  };

  // Custom toolbar component
  const CustomToolbar = () => (
    <div
      className="custom-toolbar"
      style={{
        display: 'flex',
        gap: 12,
        padding: 12,
        background: '#f8f9fa',
        borderRadius: 6,
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label>Page Size:</label>
        <select
          value={pageSize}
          onChange={e => handlePageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          onClick={() => pivotRef.current?.methods.setViewMode('processed')}
        >
          Processed
        </button>
        <button onClick={() => pivotRef.current?.methods.setViewMode('raw')}>
          Raw Data
        </button>
        <button onClick={handleExport}>Export PDF</button>
      </div>
    </div>
  );

  // Custom table component
  const CustomTable = () => {
    if (!currentState?.processedData) return <div>Loading...</div>;

    const { headers, rows } = currentState.processedData;

    return (
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #dee2e6',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#e9ecef' }}>
            {headers.map((header: string, index: number) => (
              <th
                key={index}
                style={{
                  padding: '12px 8px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: 600,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any[], rowIndex: number) => (
            <tr
              key={rowIndex}
              style={{
                borderBottom: '1px solid #dee2e6',
                ':hover': { backgroundColor: '#f8f9fa' },
              }}
            >
              {row.map((cell: any, cellIndex: number) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: '8px',
                    borderRight: '1px solid #dee2e6',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <PivotHead
      ref={pivotRef}
      mode="minimal"
      data={salesData}
      options={options}
      onStateChange={handleStateChange}
      headerSlot={<CustomToolbar />}
      bodySlot={<CustomTable />}
    />
  );
}
```

</details>

### 3. None Mode (Headless)

Complete UI control with access to all pivot functionality through the component API.

<details>
<summary>Click to view the complete None Mode (Headless) example</summary>

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { PivotHead, PivotHeadRef, PivotTableState, FilterConfig } from '@mindfiredigital/pivothead-react';

export default function HeadlessExample() {
  const pivotRef = useRef<PivotHeadRef>(null);
  const [pivotState, setPivotState] = useState<PivotTableState | null>(null);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [viewMode, setViewMode] = useState<'processed' | 'raw'>('processed');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
  });

  const handleStateChange = (e: CustomEvent<PivotTableState>) => {
    setPivotState(e.detail);
  };

  const handlePaginationChange = (e: CustomEvent) => {
    setPagination(e.detail);
  };

  const applyFilter = (field: string, operator: string, value: string) => {
    const newFilters = [{ field, operator, value }] as FilterConfig[];
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters([]);
  };

  const changePageSize = (size: number) => {
    pivotRef.current?.methods.setPageSize(size);
  };

  const goToPage = (page: number) => {
    pivotRef.current?.methods.goToPage(page);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Hidden pivot component */}
      <PivotHead
        ref={pivotRef}
        mode="none"
        data={salesData}
        options={options}
        filters={filters}
        onStateChange={handleStateChange}
        onPaginationChange={handlePaginationChange}
        style={{ display: 'none' }}
      />

      {/* Custom Control Panel */}
      <div style={{
        width: 300,
        padding: 20,
        background: '#f8f9fa',
        borderRight: '1px solid #dee2e6'
      }}>
        <h3>Pivot Controls</h3>

        <div style={{ marginBottom: 20 }}>
          <h4>View Mode</h4>
          <div>
            <label>
              <input
                type="radio"
                checked={viewMode === 'processed'}
                onChange={() => {
                  setViewMode('processed');
                  pivotRef.current?.methods.setViewMode('processed');
                }}
              />
              Processed Data
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                checked={viewMode === 'raw'}
                onChange={() => {
                  setViewMode('raw');
                  pivotRef.current?.methods.setViewMode('raw');
                }}
              />
              Raw Data
            </label>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h4>Quick Filters</h4>
          <button
            onClick={() => applyFilter('sales', 'greaterThan', '1000')}
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          >
            Sales > $1000
          </button>
          <button
            onClick={() => applyFilter('country', 'equals', 'USA')}
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          >
            USA Only
          </button>
          <button
            onClick={clearFilters}
            style={{ display: 'block', width: '100%' }}
          >
            Clear Filters
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h4>Page Size</h4>
          <select
            value={pagination.pageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h4>Export Options</h4>
          <button
            onClick={() => pivotRef.current?.methods.exportToExcel()}
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          >
            Export Excel
          </button>
          <button
            onClick={() => pivotRef.current?.methods.exportToPDF()}
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          >
            Export PDF
          </button>
          <button
            onClick={() => pivotRef.current?.methods.openPrintDialog()}
            style={{ display: 'block', width: '100%' }}
          >
            Print
          </button>
        </div>
      </div>

      {/* Custom Results Area */}
      <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Sales Analysis Results</h2>
          <div>
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>

        {/* Summary Statistics */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <div style={{
            background: 'white',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #dee2e6',
            flex: 1
          }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#007bff' }}>
              {salesData.length}
            </div>
            <div>Total Records</div>
          </div>
          <div style={{
            background: 'white',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #dee2e6',
            flex: 1
          }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>
              ${salesData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
            </div>
            <div>Total Sales</div>
          </div>
          <div style={{
            background: 'white',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #dee2e6',
            flex: 1
          }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ffc107' }}>
              {new Set(salesData.map(item => item.country)).size}
            </div>
            <div>Countries</div>
          </div>
        </div>

        {/* Custom Data Table */}
        {pivotState?.processedData && (
          <CustomDataTable
            data={pivotState.processedData}
            onSort={(field, direction) => {
              pivotRef.current?.methods.sort(field, direction);
            }}
          />
        )}

        {/* Pagination Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginTop: 20
        }}>
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
          >
            Previous
          </button>
          <span style={{
            padding: '6px 12px',
            background: '#e9ecef',
            borderRadius: 4
          }}>
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom table component with sorting
function CustomDataTable({ data, onSort }: {
  data: { headers: string[], rows: any[][] },
  onSort: (field: string, direction: 'asc' | 'desc') => void
}) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: 8
    }}>
      <thead>
        <tr style={{ backgroundColor: '#f8f9fa' }}>
          {data.headers.map((header: string, index: number) => (
            <th
              key={index}
              onClick={() => handleSort(header)}
              style={{
                padding: '12px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #dee2e6',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {header}
                {sortField === header && (
                  <span style={{ fontSize: 12 }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row: any[], rowIndex: number) => (
          <tr
            key={rowIndex}
            style={{
              borderBottom: '1px solid #dee2e6',
              ':hover': { backgroundColor: '#f8f9fa' }
            }}
          >
            {row.map((cell: any, cellIndex: number) => (
              <td
                key={cellIndex}
                style={{
                  padding: '8px',
                  borderRight: cellIndex < row.length - 1 ? '1px solid #dee2e6' : 'none'
                }}
              >
                {typeof cell === 'number' && data.headers[cellIndex].includes('Sales')
                  ? `$${cell.toLocaleString()}`
                  : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

</details>

### 1. Performance

- Use `React.memo` for components that receive stable props
- Memoize expensive calculations with `useMemo`
- Debounce rapid state changes to prevent excessive re-renders
- Consider virtualization for very large datasets

### 2. Error Handling

- Always wrap pivot components in error boundaries
- Validate data before passing to the component
- Handle loading and error states gracefully
- Provide meaningful error messages to users

### 3. Accessibility

- Ensure proper ARIA labels for screen readers
- Support keyboard navigation
- Use semantic HTML elements
- Test with accessibility tools

### 4. Data Management

- Validate data structure before passing to the component
- Handle missing or invalid data gracefully
- Consider implementing data caching for large datasets
- Use TypeScript for better data type safety

## Troubleshooting

### Common Issues

1. **Component not rendering**:
   - Ensure data is in the correct format
   - Check that options are properly configured
   - Verify that the web component is loaded

2. **TypeScript errors**:
   - Import types from the correct package
   - Ensure data matches expected interface
   - Check that ref types are properly defined

3. **Performance issues**:
   - Implement proper memoization
   - Consider pagination for large datasets
   - Use React DevTools to identify re-render causes

4. **Event handlers not working**:
   - Ensure proper event listener setup
   - Check that component ref is properly attached
   - Verify event handler function signatures

### Browser Support

- Modern browsers (Chrome 67+, Firefox 63+, Safari 12+, Edge 79+)
- React 17+ required
- Web Components support (use polyfills for older browsers)

### From Other Pivot Libraries

1. **Update imports**: Replace old library imports with PivotHead React
2. **Convert configuration**: Map old config format to PivotHead options
3. **Update event handlers**: Use React-style event props
4. **Migrate custom UI**: Use appropriate mode (minimal or none) for customization

## Conclusion

The PivotHead React Wrapper provides a seamless bridge between React applications and the powerful PivotHead pivot table functionality. With its three rendering modes, comprehensive TypeScript support, and React-native API, it enables developers to quickly integrate sophisticated data analysis capabilities into their React applications while maintaining full control over the user experience.

Whether you need a drop-in solution with the default mode, customizable UI with minimal mode, or complete control with none mode, the React wrapper adapts to your requirements while preserving all the underlying pivot functionality.
