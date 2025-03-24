import { useEffect, useRef, useState } from 'react';
import '@mindfiredigital/pivothead-web-component';
import './App.css';
import React from 'react';

// Declare the custom element type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'pivot-head': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          data?: string;
          options?: string;
          filters?: string;
          pagination?: string;
          onStateChange?: (e: CustomEvent) => void;
        },
        HTMLElement
      >;
    }
  }
}

function App() {
  const pivotRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<any>(null);

  // Sample data
  const data = [
    { Category: "Furniture", SubCategory: "Chairs", Sales: 1200, Region: "North" },
    { Category: "Furniture", SubCategory: "Tables", Sales: 1500, Region: "South" },
    { Category: "Electronics", SubCategory: "Phones", Sales: 3000, Region: "East" },
    { Category: "Electronics", SubCategory: "Laptops", Sales: 4500, Region: "West" }
  ];

  // PivotHead configuration
  const options = {
    rows: ["Category"],
    columns: ["SubCategory"],
    measures: [
      {
        uniqueName: "Sales",
        aggregation: "sum",
        caption: "Total Sales"
      }
    ],
    dimensions: [
      {
        uniqueName: "Region",
        caption: "Region"
      }
    ]
  };

  useEffect(() => {
    const pivot = pivotRef.current;
    if (pivot) {
      // Listen for state changes
      const handleStateChange = (e: CustomEvent) => {
        setState(e.detail);
        console.log('PivotHead state changed:', e.detail);
      };

      pivot.addEventListener('stateChange', handleStateChange as EventListener);

      return () => {
        pivot.removeEventListener('stateChange', handleStateChange as EventListener);
      };
    }
  }, []);

  // Example of using the API methods
  const handleSort = () => {
    if (pivotRef.current) {
      (pivotRef.current as any).sort('Sales', 'desc');
    }
  };

  const handleFilter = () => {
    const filters = [
      {
        field: 'Category',
        operator: 'equals',
        value: 'Electronics'
      }
    ];
    if (pivotRef.current) {
      pivotRef.current.setAttribute('filters', JSON.stringify(filters));
    }
  };

  // Custom rendering of the pivot table data
  const renderPivotTable = () => {
    if (!state?.processedData) return null;

    const { headers, rows } = state.processedData;

    return (
      <table className="custom-table">
        <thead>
          <tr>
            {headers.map((header: string, index: number) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any[], rowIndex: number) => (
            <tr key={rowIndex}>
              {row.map((cell: any, cellIndex: number) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="app">
      <h1>PivotHead React Demo</h1>
      
      <div className="controls">
        <button onClick={handleSort}>Sort by Sales (DESC)</button>
        <button onClick={handleFilter}>Filter Electronics</button>
      </div>

      {/* PivotHead Web Component */}
      <pivot-head
        ref={pivotRef}
        data={JSON.stringify(data)}
        options={JSON.stringify(options)}
      />

      {/* Custom Rendering */}
      <div className="custom-view">
        <h2>Custom Rendering of Pivot Data</h2>
        {renderPivotTable()}
      </div>

      {/* Debug View */}
      <div className="debug-view">
        <h3>Current State:</h3>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App; 