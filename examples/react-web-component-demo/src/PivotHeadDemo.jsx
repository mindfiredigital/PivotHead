import React, { useEffect, useRef, useState } from 'react';
import '@mindfiredigital/pivothead-web-component';
import { data, options } from './config/config';

const PivotHeadDemo = () => {
  const pivotRef = useRef(null);
  const [state, setState] = useState();

  // Controlled filter state
  const [field, setField] = useState('product');
  const [operator, setOperator] = useState('equals');
  const [value, setValue] = useState('');

  useEffect(() => {
    const pivot = pivotRef.current;

    if (!pivot) return;

    // Wait for the component to be defined
    customElements.whenDefined('pivot-head').then(() => {
      console.log('Setting data and options programmatically...');
      
      // Set data and options via properties (this triggers the setters)
      pivot.data = data;
      pivot.options = options;

      // Add event listener for state changes
      const handleStateChange = (event) => {
        console.log('✅ State changed:', event.detail);
        setState(event.detail);
      };

      pivot.addEventListener('stateChange', handleStateChange);

      // Poll for getState to become available (fallback)
      const interval = setInterval(() => {
        if (typeof pivot.getState === 'function') {
          try {
            const s = pivot.getState();
            console.log('✅ Engine state from polling:', s);
            setState(s);
            clearInterval(interval);
          } catch (error) {
            console.log('Engine not ready yet, continuing to poll...');
          }
        }
      }, 100);

      // Cleanup
      return () => {
        pivot.removeEventListener('stateChange', handleStateChange);
        clearInterval(interval);
      };
    });
  }, []);

  const handleFilter = () => {
    console.log('Filter Field:', field);
    console.log('Operator:', operator);
    console.log('Value:', value);

    const pivot = pivotRef.current;
    if (pivot && typeof pivot.applyFiltersWithEvent === 'function') {
      const filters = [{ field: field, operator: operator, value: value }];
      
      // Use the method that applies filters and dispatches events
      pivot.applyFiltersWithEvent(filters);
    } else {
      console.error('Pivot component or applyFiltersWithEvent method not available');
    }
  };

  const handleExport = () => {
    const pivot = pivotRef.current;
    if (pivot) {
      // Example: export to PDF
      if (typeof pivot.exportToPDF === 'function') {
        pivot.exportToPDF('pivot-export');
      }
    }
  };

  const handleReset = () => {
    const pivot = pivotRef.current;
    if (pivot && typeof pivot.refresh === 'function') {
      pivot.refresh();
      // Reset form fields
      setField('product');
      setOperator('equals');
      setValue('');
    }
  };

  const handleProductSort = () => {
    const pivot = pivotRef.current;
    if (!pivot || typeof pivot.sortWithEvent !== 'function' || !state) return;
    
    const currentSortConfig = state.sortConfig?.[0];
    const direction = currentSortConfig?.field === 'product' && currentSortConfig?.direction === 'asc' ? 'desc' : 'asc';
    pivot.sortWithEvent('product', direction);
  };

  const handleMeasureSort = (measure) => {
    const pivot = pivotRef.current;
    if (!pivot || typeof pivot.sortWithEvent !== 'function' || !state) return;
    
    const currentSortConfig = state.sortConfig?.[0];
    const direction = currentSortConfig?.field === measure.uniqueName && currentSortConfig?.direction === 'asc' ? 'desc' : 'asc';
    pivot.sortWithEvent(measure.uniqueName, direction);
  };

  const renderTable = () => {
    if (!state || !state.processedData) {
      return <div style={{color: 'red', padding: '20px'}}>No processed data available</div>;
    }

    const uniqueRegions = [...new Set(state.data.map(item => item.region))];
    const uniqueProducts = [...new Set(state.data.map(item => item.product))];
    const currentSortConfig = state.sortConfig?.[0];

    return (
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        border: '1px solid #dee2e6'
      }}>
        <thead>
          <tr>
            <th style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6',
              borderRight: '1px solid #dee2e6'
            }}>
              Product / Region
            </th>
            {uniqueRegions.map((region, index) => (
              <th
                key={region}
                colSpan={state.measures.length}
                draggable="true"
                data-index={index + 1}
                style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6',
                  borderRight: '1px solid #dee2e6',
                  textAlign: 'center',
                  cursor: 'move'
                }}
              >
                {region}
              </th>
            ))}
          </tr>
          
          <tr>
            <th
              onClick={handleProductSort}
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6',
                borderRight: '1px solid #dee2e6',
                cursor: 'pointer'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <span>Product</span>
                {currentSortConfig?.field === 'product' && (
                  <span style={{ marginLeft: '5px' }}>
                    {currentSortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </th>
            {uniqueRegions.map(region =>
              state.measures.map(measure => (
                <th
                  key={`${region}-${measure.uniqueName}`}
                  onClick={() => handleMeasureSort(measure)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{measure.caption}</span>
                    {currentSortConfig?.field === measure.uniqueName && (
                      <span style={{ marginLeft: '5px' }}>
                        {currentSortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))
            )}
          </tr>
        </thead>
        
        <tbody>
          {uniqueProducts.map((product, rowIndex) => (
            <tr
              key={product}
              data-row-index={rowIndex}
              draggable="true"
              style={{ cursor: 'move' }}
            >
              <td style={{
                fontWeight: 'bold',
                padding: '8px',
                borderBottom: '1px solid #dee2e6'
              }}>
                {product}
              </td>
              {uniqueRegions.map(region =>
                state.measures.map(measure => {
                  const filteredData = state.data.filter(
                    item => item.product === product && item.region === region
                  );

                  let value = 0;
                  if (filteredData.length > 0) {
                    switch (measure.aggregation) {
                      case 'sum':
                        value = filteredData.reduce((sum, item) => sum + (item[measure.uniqueName] || 0), 0);
                        break;
                      case 'avg':
                        if (measure.formula) {
                          value = filteredData.reduce((sum, item) => sum + measure.formula(item), 0) / filteredData.length;
                        } else {
                          value = filteredData.reduce((sum, item) => sum + (item[measure.uniqueName] || 0), 0) / filteredData.length;
                        }
                        break;
                      case 'max':
                        value = Math.max(...filteredData.map(item => item[measure.uniqueName] || 0));
                        break;
                      case 'min':
                        value = Math.min(...filteredData.map(item => item[measure.uniqueName] || 0));
                        break;
                      default:
                        value = 0;
                    }
                  }

                  let formattedValue = value;
                  if (measure.format) {
                    if (measure.format.type === 'currency') {
                      formattedValue = new Intl.NumberFormat(measure.format.locale, {
                        style: 'currency',
                        currency: measure.format.currency,
                        minimumFractionDigits: measure.format.decimals,
                        maximumFractionDigits: measure.format.decimals,
                      }).format(value);
                    } else if (measure.format.type === 'number') {
                      formattedValue = new Intl.NumberFormat(measure.format.locale, {
                        minimumFractionDigits: measure.format.decimals,
                        maximumFractionDigits: measure.format.decimals,
                      }).format(value);
                    }
                  }

                  let cellStyle = {
                    padding: '8px',
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    textAlign: 'right'
                  };

                  return (
                    <td
                      key={`${product}-${region}-${measure.uniqueName}`}
                      style={cellStyle}
                    >
                      {formattedValue}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  console.log('Current state:', state);

  return (
    <div style={{ padding: '20px' }}>
      <h2>PivotHead React Demo</h2>

      {/* Filter handling */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={field} onChange={(e) => setField(e.target.value)} style={{ padding: '5px' }}>
            <option value="product">Product</option>
            <option value="region">Region</option>
            <option value="sales">Sales</option>
            <option value="quantity">Quantity</option>
            <option value="date">Date</option>
          </select>

          <select value={operator} onChange={(e) => setOperator(e.target.value)} style={{ padding: '5px' }}>
            <option value="equals">Equals</option>
            <option value="greater">Greater than</option>
            <option value="less">Less than</option>
            <option value="contains">Contains</option>
          </select>

          <input
            type="text"
            placeholder="Filter Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ padding: '5px' }}
          />

          <button onClick={handleFilter} style={{ padding: '5px 15px' }}>Apply Filter</button>
        </div>
      </div>

      {/* Export handling */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Export Options</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select style={{ padding: '5px' }}>
            <option value="pdf">Export as PDF</option>
            <option value="html">Export as HTML</option>
            <option value="excel">Export as Excel</option>
          </select>

          <button onClick={handleExport} style={{ padding: '5px 15px' }}>Export</button>
        </div>
      </div>

      {/* Reset */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleReset} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}>
          Reset All
        </button>
      </div>

      {/* Debug info */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <small>
          <strong>Debug:</strong> Engine initialized: {state ? 'Yes' : 'No'} | 
          Data rows: {state?.data?.length || 'N/A'} | 
          Measures: {state?.measures?.length || 'N/A'}
        </small>
      </div>
      
      {/* The web component - hidden since we're rendering our own table */}
      <pivot-head 
        ref={pivotRef} 
        style={{ display: 'none' }}
      ></pivot-head>
      
      {renderTable()}
    </div>
  );
};

export default PivotHeadDemo;