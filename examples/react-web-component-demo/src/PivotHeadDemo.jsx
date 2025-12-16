import React, { useEffect, useRef, useState } from 'react';
import '@mindfiredigital/pivothead-web-component';
import { data, options } from './config/config';

const PivotHeadDemo = () => {
  const pivotRef = useRef(null);
  const [state, setState] = useState();
  const [showRawData, setShowRawData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(100); // Show 100 rows per page for large datasets
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

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
          } catch {
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

  const handleUploadCSV = async () => {
    const pivot = pivotRef.current;
    if (pivot && typeof pivot.connectToLocalFile === 'function') {
      try {
        console.log('Opening file picker for CSV/JSON upload...');
        setIsLoading(true);
        setLoadingMessage('Uploading file...');

        const result = await pivot.connectToLocalFile({
          maxFileSize: 1024 * 1024 * 1024, // 1GB max file size (supports 800MB files)
          onProgress: (progress) => {
            console.log(`Upload progress: ${progress}%`);
            setLoadingMessage(`Processing file... ${progress}%`);
          },
        });

        if (result.success) {
          console.log('File uploaded successfully:', result);
          console.log(`- File: ${result.fileName}`);
          console.log(`- Size: ${result.fileSize} bytes`);
          console.log(`- Records: ${result.recordCount}`);
          console.log(`- Performance Mode: ${result.performanceMode}`);

          // Update the state to refresh the table with new data
          console.log('🔄 Refreshing state with uploaded data...');
          setLoadingMessage('Loading data into table...');

          // Wait a bit for the component to finish processing
          setTimeout(() => {
            if (typeof pivot.getState === 'function') {
              try {
                const newState = pivot.getState();
                console.log('✅ State updated with uploaded data:', newState);
                console.log(`   - Data rows: ${newState.data?.length || 0}`);
                console.log(`   - Columns: ${newState.data?.[0] ? Object.keys(newState.data[0]).length : 0}`);
                setState(newState);
                setCurrentPage(1); // Reset to first page
                setIsLoading(false);
                setLoadingMessage('');

                alert(`File uploaded successfully!\n\nFile: ${result.fileName}\nRecords: ${result.recordCount}\nPerformance Mode: ${result.performanceMode}\n\nData loaded into table!`);
              } catch (error) {
                console.error('Failed to get state after upload:', error);
                setIsLoading(false);
                setLoadingMessage('');
                alert('File uploaded but failed to update table. Please try refreshing the page.');
              }
            } else {
              setIsLoading(false);
              setLoadingMessage('');
              alert('File uploaded but getState method not available. Please try refreshing the page.');
            }
          }, 500); // Wait 500ms for processing to complete
        } else {
          console.error('File upload failed:', result.error);
          setIsLoading(false);
          setLoadingMessage('');
          alert(`File upload failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setIsLoading(false);
        setLoadingMessage('');
        alert(`Error uploading file: ${error.message}`);
      }
    } else {
      console.error('Pivot component or connectToLocalFile method not available');
      alert('Upload functionality is not available. Please ensure the component is fully loaded.');
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

  const renderFormattedTable = () => {
    if (!state || !state.data || state.data.length === 0) {
      return <div style={{color: 'red', padding: '20px'}}>No data available</div>;
    }

    const columns = Object.keys(state.data[0]);
    const totalRows = state.data.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const paginatedData = state.data.slice(startIndex, endIndex);

    // Detect numeric columns for aggregations
    const numericColumns = columns.filter(col => {
      const sampleValues = state.data.slice(0, 100).map(row => row[col]);
      return sampleValues.some(val => typeof val === 'number' || !isNaN(parseFloat(val)));
    });

    // Calculate aggregations for numeric columns
    const aggregations = {};
    numericColumns.forEach(col => {
      const values = state.data.map(row => {
        const val = row[col];
        return typeof val === 'number' ? val : parseFloat(val);
      }).filter(v => !isNaN(v));

      if (values.length > 0) {
        aggregations[col] = {
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    // Pagination controls
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
    const handleFirstPage = () => setCurrentPage(1);
    const handleLastPage = () => setCurrentPage(totalPages);
    const handlePageInput = (e) => {
      const page = parseInt(e.target.value);
      if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          marginBottom: '15px',
          padding: '15px',
          backgroundColor: '#e7f3ff',
          border: '1px solid #0066cc',
          borderRadius: '5px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>📊 Processed Data View</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
              <strong>Total Records:</strong> {totalRows.toLocaleString()}
            </div>
            <div>
              <strong>Columns:</strong> {columns.length}
            </div>
            <div>
              <strong>Numeric Columns:</strong> {numericColumns.length}
            </div>
            <div>
              <strong>Current Page:</strong> {currentPage} / {totalPages.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Aggregations Summary */}
        {numericColumns.length > 0 && (
          <div style={{
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '5px'
          }}>
            <h5 style={{ margin: '0 0 10px 0' }}>📈 Statistical Summary</h5>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Column</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Sum</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Average</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Min</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Max</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {numericColumns.map(col => (
                    <tr key={`agg-${col}`}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{col}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'right' }}>
                        {aggregations[col]?.sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'right' }}>
                        {aggregations[col]?.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'right' }}>
                        {aggregations[col]?.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'right' }}>
                        {aggregations[col]?.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'right' }}>
                        {aggregations[col]?.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls - Top */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <div>
            <small>Showing rows {startIndex + 1} - {endIndex} of {totalRows.toLocaleString()}</small>
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button onClick={handleFirstPage} disabled={currentPage === 1}
              style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
              «
            </button>
            <button onClick={handlePrevPage} disabled={currentPage === 1}
              style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
              ‹
            </button>
            <span style={{ padding: '0 10px' }}>
              Page
              <input type="number" min="1" max={totalPages} value={currentPage} onChange={handlePageInput}
                style={{ width: '60px', margin: '0 5px', padding: '3px', textAlign: 'center' }} />
              of {totalPages.toLocaleString()}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}
              style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
              ›
            </button>
            <button onClick={handleLastPage} disabled={currentPage === totalPages}
              style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
              »
            </button>
          </div>
        </div>

        {/* Data Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #dee2e6'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px',
                backgroundColor: '#0066cc',
                color: 'white',
                borderBottom: '2px solid #004999',
                borderRight: '1px solid #004999',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                #
              </th>
              {columns.map((col, index) => (
                <th key={`col-${index}-${col}`}
                  style={{
                    padding: '12px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    borderBottom: '2px solid #004999',
                    borderRight: '1px solid #004999',
                    fontWeight: 'bold',
                    textAlign: numericColumns.includes(col) ? 'right' : 'left',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                  {col}
                  {numericColumns.includes(col) && ' 📊'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const actualRowNumber = startIndex + rowIndex + 1;
              return (
                <tr key={`formatted-row-${actualRowNumber}`}
                  style={{ backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f8f9fa' }}>
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontWeight: 'bold',
                    backgroundColor: '#e9ecef'
                  }}>
                    {actualRowNumber}
                  </td>
                  {columns.map((col, colIndex) => {
                    const value = row[col];
                    const isNumeric = numericColumns.includes(col);
                    let displayValue = value;

                    // Format numeric values
                    if (isNumeric && (typeof value === 'number' || !isNaN(parseFloat(value)))) {
                      displayValue = parseFloat(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
                    } else if (value === null || value === undefined || value === '') {
                      displayValue = '-';
                    }

                    return (
                      <td key={`formatted-cell-${actualRowNumber}-${colIndex}`}
                        style={{
                          padding: '10px',
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: isNumeric ? 'right' : 'left',
                          fontFamily: isNumeric ? 'monospace' : 'inherit'
                        }}>
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Controls - Bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          <div>
            <small>Showing rows {startIndex + 1} - {endIndex} of {totalRows.toLocaleString()}</small>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={handleFirstPage} disabled={currentPage === 1}
              style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
              « First
            </button>
            <button onClick={handlePrevPage} disabled={currentPage === 1}
              style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
              ‹ Previous
            </button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}
              style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
              Next ›
            </button>
            <button onClick={handleLastPage} disabled={currentPage === totalPages}
              style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
              Last »
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRawData = () => {
    if (!state || !state.data || state.data.length === 0) {
      return <div style={{color: 'red', padding: '20px'}}>No raw data available</div>;
    }

    const columns = Object.keys(state.data[0]);
    const totalRows = state.data.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const paginatedData = state.data.slice(startIndex, endIndex);

    // Pagination controls
    const handlePrevPage = () => {
      setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
      setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const handleFirstPage = () => {
      setCurrentPage(1);
    };

    const handleLastPage = () => {
      setCurrentPage(totalPages);
    };

    const handlePageInput = (e) => {
      const page = parseInt(e.target.value);
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    return (
      <div style={{ overflowX: 'auto' }}>
        {/* Pagination Controls - Top */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <div>
            <strong>Total Rows:</strong> {totalRows.toLocaleString()} |
            <strong> Columns:</strong> {columns.length} |
            <strong> Page:</strong> {currentPage} / {totalPages.toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              «
            </button>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              ‹
            </button>
            <span style={{ padding: '0 10px' }}>
              Page
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={handlePageInput}
                style={{
                  width: '60px',
                  margin: '0 5px',
                  padding: '3px',
                  textAlign: 'center'
                }}
              />
              of {totalPages.toLocaleString()}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '5px 10px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              ›
            </button>
            <button
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '5px 10px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              »
            </button>
          </div>
        </div>

        {/* Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #dee2e6'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6',
                borderRight: '1px solid #dee2e6',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                #
              </th>
              {columns.map((col, index) => (
                <th
                  key={`col-${index}-${col}`}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const actualRowNumber = startIndex + rowIndex + 1;
              return (
                <tr key={`raw-row-${actualRowNumber}`}>
                  <td style={{
                    padding: '8px',
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa'
                  }}>
                    {actualRowNumber}
                  </td>
                  {columns.map((col, colIndex) => (
                    <td
                      key={`raw-cell-${actualRowNumber}-${colIndex}`}
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6'
                      }}
                    >
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Controls - Bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          <div>
            <small>
              Showing rows {startIndex + 1} - {endIndex} of {totalRows.toLocaleString()}
            </small>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              «
            </button>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              ‹ Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '5px 10px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next ›
            </button>
            <button
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '5px 10px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              »
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (!state || !state.data || state.data.length === 0) {
      return <div style={{color: 'red', padding: '20px'}}>No data available</div>;
    }

    // Check if this is a pivot table (has product/region) or generic CSV
    const hasPivotStructure = state.data[0]?.product !== undefined && state.data[0]?.region !== undefined;

    if (!hasPivotStructure) {
      // For uploaded CSVs without pivot structure, show a formatted table view
      return renderFormattedTable();
    }

    const uniqueRegions = [...new Set(state.data.map(item => item.region).filter(Boolean))];
    const uniqueProducts = [...new Set(state.data.map(item => item.product).filter(Boolean))];
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
                key={`header-region-${index}-${region}`}
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
            {uniqueRegions.flatMap(region =>
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
              key={`row-${rowIndex}-${product}`}
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
              {uniqueRegions.flatMap(region =>
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

      {/* File Upload handling */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Upload CSV/JSON File</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleUploadCSV} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Upload CSV/JSON File
          </button>
          <small style={{ color: '#666' }}>Supports large files up to 800 MB</small>
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

      {/* Reset and View Toggle */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleReset} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Reset All
        </button>
        <button
          onClick={() => {
            setShowRawData(!showRawData);
            setCurrentPage(1); // Reset to first page when switching views
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: showRawData ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {showRawData ? 'Show Processed Table' : 'Show Raw Data'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            {loadingMessage}
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#e9ecef',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ffc107',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
          </div>
        </div>
      )}

      {/* Debug info */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <small>
          <strong>Debug:</strong> Engine initialized: {state ? 'Yes' : 'No'} |
          Data rows: {state?.data?.length?.toLocaleString() || 'N/A'} |
          Measures: {state?.measures?.length || 'N/A'}
        </small>
      </div>
      
      {/* The web component - hidden since we're rendering our own table */}
      <pivot-head
        ref={pivotRef}
        style={{ display: 'none' }}
      ></pivot-head>

      {showRawData ? renderRawData() : renderTable()}
    </div>
  );
};

export default PivotHeadDemo;