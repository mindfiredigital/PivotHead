import { useEffect, useRef, useState } from 'react';
import '@mindfiredigital/pivothead-web-component';
import PivotHead, { PivotHeadEl } from '../components/PivotHead';
import { demoData, demoOptions } from '../demoConfig';
import '../minimal.css';
import ProcessedTable from '../minimalcomponent/ProcessedTable';
import RawTable from '../minimalcomponent/RawTable';

// Local types for state we derive from the web component
type ViewMode = 'processed' | 'raw';
interface SortState { field: string | null; dir: 'asc' | 'desc'; }
interface UiModeStore { colOrder: string[]; rowOrder: string[]; sort: SortState }
interface PivotState {
  rows?: Array<{ uniqueName: string; caption: string }>;
  columns?: Array<{ uniqueName: string; caption: string }>;
  measures?: Array<{ uniqueName: string; caption: string; aggregation: string }>;
  processedData?: { rows?: unknown[] } | null;
  rawData?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
}

// Type guard for optional APIs
function hasSwapRows(el: PivotHeadEl | null): el is PivotHeadEl & { swapRows: (fromIndex: number, toIndex: number) => void } {
  const maybe = (el as unknown) as { swapRows?: unknown };
  return !!el && typeof maybe.swapRows === 'function';
}

export default function MinimalDemo() {
  const pivotRef = useRef<PivotHeadEl | null>(null);

  // View mode and pivot state snapshot
  const [viewMode, setViewMode] = useState<ViewMode>('processed');
  const [pivotState, setPivotState] = useState<PivotState | null>(null);

  // Pagination
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 10 });

  // Per-mode UI store
  const [processedStore, setProcessedStore] = useState<UiModeStore>({ colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } });
  const [rawStore, setRawStore] = useState<UiModeStore>({ colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } });

  // DnD state
  const [dnd, setDnd] = useState<{ type: 'row' | 'col' | null; fromIndex: number }>({ type: null, fromIndex: -1 });

  // Filter state
  const [filterField, setFilterField] = useState('');
  const [filterOperator, setFilterOperator] = useState('equals');
  const [filterValue, setFilterValue] = useState('');
  const [filterOptions, setFilterOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Drilldown modal state (declarative React UI)
  const [drilldown, setDrilldown] = useState<{ open: boolean; title: string; summary: string; rows: Array<Record<string, unknown>> }>({ open: false, title: '', summary: '', rows: [] });

  const currentStore = viewMode === 'processed' ? processedStore : rawStore;
  const setCurrentStore = viewMode === 'processed' ? setProcessedStore : setRawStore;

  // Derive filter field options from current pivot state
  useEffect(() => {
    const st = pivotState;
    if (!st) return;
    const opts: Array<{ value: string; label: string }> = [];
    if (viewMode === 'processed') {
      st.rows?.forEach(r => opts.push({ value: r.uniqueName, label: r.caption }));
      st.columns?.forEach(c => opts.push({ value: c.uniqueName, label: c.caption }));
      st.measures?.forEach(m => opts.push({ value: `${m.aggregation}_${m.uniqueName}`, label: m.caption }));
    } else {
      const rows = (st.rawData || st.data || []) as Array<Record<string, unknown>>;
      const keys = rows.length ? Object.keys(rows[0]) : [];
      keys.forEach(k => opts.push({ value: k, label: k }));
    }
    setFilterOptions(opts);
    // Keep selected field valid
    if (opts.length && !opts.find(o => o.value === filterField)) {
      setFilterField(opts[0].value);
    }
  }, [pivotState, viewMode]);

  // Keep pagination in sync with the web component
  const syncPagination = () => {
    const pivot = pivotRef.current;
    if (!pivot) return;
    const p = pivot.getPagination?.();
    if (p) setPagination({ currentPage: p.currentPage, totalPages: p.totalPages, pageSize: p.pageSize });
  };

  // Initialize web component, data/options, and wire events
  useEffect(() => {
    const el = pivotRef.current;
    if (!el) return;

    el.setAttribute('mode', 'minimal');
    el.data = demoData as unknown[];
    el.options = demoOptions as unknown;
    el.setViewMode('processed');

    const handleStateChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as PivotState;
      setPivotState(detail);
      syncPagination();
    };
    const handlePaginationChange = () => { syncPagination(); };
    const handleViewModeChange = () => {
      const vm = el.getViewMode() as ViewMode;
      setViewMode(vm);
      // Refresh snapshot and pagination after mode switch
      setPivotState(el.getState?.() as PivotState);
      syncPagination();
    };
    const handleError = (e: Event) => { console.warn('Pivot error:', (e as CustomEvent).detail || {}); };

    el.addEventListener('stateChange', handleStateChange as EventListener);
    el.addEventListener('paginationChange', handlePaginationChange as EventListener);
    el.addEventListener('viewModeChange', handleViewModeChange as EventListener);
    el.addEventListener('pivotError', handleError as EventListener);

    // Bootstrap initial state after definition
    customElements.whenDefined('pivot-head').then(() => {
      const st = el.getState?.();
      setPivotState(st as PivotState);
      syncPagination();
    });

    return () => {
      el.removeEventListener('stateChange', handleStateChange as EventListener);
      el.removeEventListener('paginationChange', handlePaginationChange as EventListener);
      el.removeEventListener('viewModeChange', handleViewModeChange as EventListener);
      el.removeEventListener('pivotError', handleError as EventListener);
    };
  }, []);

  // Helpers
  const toggleSort = (field: string) => {
    const store = currentStore;
    const nextDir: 'asc' | 'desc' = store.sort.field === field && store.sort.dir === 'asc' ? 'desc' : 'asc';
    setCurrentStore(s => ({ ...s, sort: { field, dir: nextDir } }));
    pivotRef.current?.sort?.(field, nextDir);
  };

  const handleColDragStart = (index: number) => setDnd({ type: 'col', fromIndex: index });
  const handleColDrop = (toIndex: number) => {
    if (dnd.type !== 'col') return;
    setCurrentStore(s => {
      const arr = [...(s.colOrder.length ? s.colOrder : [])];
      // If not initialized yet, initialize from current visible columns
      const visibleCols = getVisibleColumns();
      if (arr.length === 0) arr.push(...visibleCols);
      const moved = arr.splice(dnd.fromIndex, 1)[0];
      arr.splice(toIndex, 0, moved);
      return { ...s, colOrder: arr };
    });
    setDnd({ type: null, fromIndex: -1 });
  };

  const handleRowDragStart = (index: number) => setDnd({ type: 'row', fromIndex: index });
  const handleRowDropProcessed = (toIndex: number, currentRows: string[]) => {
    if (dnd.type !== 'row') return;
    setCurrentStore(s => {
      const order = s.rowOrder.length ? [...s.rowOrder] : [...currentRows];
      const moved = order.splice(dnd.fromIndex, 1)[0];
      order.splice(toIndex, 0, moved);
      return { ...s, rowOrder: order };
    });
    setDnd({ type: null, fromIndex: -1 });
  };
  const handleRowDropRaw = (globalToIndex: number) => {
    if (dnd.type !== 'row') return;
    // Delegate swap to the web component so pagination and data stay consistent
    if (hasSwapRows(pivotRef.current)) {
      pivotRef.current.swapRows(dnd.fromIndex, globalToIndex);
    }
    setDnd({ type: null, fromIndex: -1 });
  };

  const applyFilter = () => {
    const pivot = pivotRef.current;
    if (!pivot || !filterField || !filterOperator) return;
    (pivot as PivotHeadEl).filters = [{ field: filterField, operator: filterOperator, value: filterValue }] as unknown[];
    pivot.goToPage?.(1);
  };

  const resetFilter = () => {
    const pivot = pivotRef.current;
    if (!pivot) return;
    (pivot as PivotHeadEl).filters = [] as unknown[];
    pivot.reset?.();
    setFilterValue('');
    // Keep field and operator; user can change if needed
    pivot.goToPage?.(1);
  };

  const switchView = () => {
    const pivot = pivotRef.current;
    if (!pivot) return;
    const next: ViewMode = viewMode === 'processed' ? 'raw' : 'processed';
    pivot.setViewMode(next);
    setViewMode(next);
    setPivotState(pivot.getState?.() as PivotState);
  };

  const getVisibleColumns = (): string[] => {
    if (viewMode === 'processed') {
      // For processed, columns are the distinct column field values
      const st = pivotState;
      if (!st) return [];
      const groups = (pivotRef.current?.getGroupedData?.() || []) as Array<{ key?: string }>;
      const unique = Array.from(new Set(groups.map(g => (g.key ? (g.key.includes('|') ? g.key.split('|')[1] : g.key.split('|')[0]) : '')))).filter(Boolean) as string[];
      return unique;
    } else {
      const st = pivotState;
      const rows = st ? ((st.rawData || st.data || []) as Array<Record<string, unknown>>) : [];
      return rows.length ? Object.keys(rows[0]) : [];
    }
  };

  // ----------------------------------------------------------------------------------
  // Declarative sub-components moved to minimalcomponent folder
  // ----------------------------------------------------------------------------------

  // Declarative drilldown modal trigger
  const showDrillDownModal = ({ title, summary, rows }: { title: string; summary: string; rows: Array<Record<string, unknown>> }) => {
    setDrilldown({ open: true, title, summary, rows });
  };

  return (
    <div>
      <h1>Minimal UI</h1>
      <PivotHead ref={pivotRef} id="pivot" style={{ display: 'block' }}>
        <div slot="header" className="grid-header">
          <div className="toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <label>Field</label>
            <select value={filterField} onChange={e => setFilterField(e.target.value)} aria-label="Filter field">
              {filterOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select value={filterOperator} onChange={e => setFilterOperator(e.target.value)} aria-label="Filter operator">
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
              <option value="greaterThan">Greater Than</option>
              <option value="lessThan">Less Than</option>
            </select>
            <input type="text" value={filterValue} onChange={e => setFilterValue(e.target.value)} placeholder="Value" aria-label="Filter value" />
            <button onClick={applyFilter} aria-label="Apply filter">Apply</button>
            <button onClick={resetFilter} aria-label="Reset filter">Reset</button>

            <span style={{ marginLeft: 'auto' }} />
            <label>Page Size</label>
            <select value={String(pagination.pageSize)} onChange={e => pivotRef.current?.setPageSize?.(Number(e.target.value))} aria-label="Page size">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <button onClick={() => pivotRef.current?.previousPage?.()} aria-label="Previous page">Prev</button>
            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <button onClick={() => pivotRef.current?.nextPage?.()} aria-label="Next page">Next</button>

            <span style={{ flexBasis: '100%', height: 0 }} />
            <button onClick={switchView} aria-label="Switch view">{viewMode === 'processed' ? 'Switch to Raw' : 'Switch to Processed'}</button>
            <button onClick={() => pivotRef.current?.exportToHTML?.('pivot-table')} aria-label="Export to HTML">Export HTML</button>
            <button onClick={() => pivotRef.current?.exportToPDF?.('pivot-table')} aria-label="Export to PDF">Export PDF</button>
            <button onClick={() => pivotRef.current?.exportToExcel?.('pivot-table')} aria-label="Export to Excel">Export Excel</button>
            <button onClick={() => pivotRef.current?.openPrintDialog?.()} aria-label="Print table">Print</button>
          </div>
        </div>

        <div slot="body" className="grid-body">
          <div className="grid">
            {viewMode === 'processed' ? (
              <ProcessedTable
                pivot={pivotRef.current}
                pivotState={pivotState}
                store={processedStore}
                setStore={setProcessedStore}
                pagination={pagination}
                toggleSort={toggleSort}
                onColDragStart={handleColDragStart}
                onColDrop={handleColDrop}
                onRowDragStart={handleRowDragStart}
                onRowDropProcessed={handleRowDropProcessed}
                showDrillDownModal={showDrillDownModal}
              />
            ) : (
              <RawTable
                pivot={pivotRef.current}
                pivotState={pivotState}
                store={rawStore}
                setStore={setRawStore}
                pagination={pagination}
                toggleSort={toggleSort}
                onColDragStart={handleColDragStart}
                onColDrop={handleColDrop}
                onRowDragStart={handleRowDragStart}
                onRowDropRaw={handleRowDropRaw}
              />
            )}
          </div>
        </div>
      </PivotHead>

      {drilldown.open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drilldown-title"
          onClick={e => { if (e.currentTarget === e.target) setDrilldown(d => ({ ...d, open: false })); }}
        >
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,.2)', padding: 16, width: '90%', maxWidth: 840, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div id="drilldown-title" style={{ fontWeight: 700 }}>Details: {drilldown.title}</div>
              <button onClick={() => setDrilldown(d => ({ ...d, open: false }))} style={{ fontSize: 18, border: 'none', background: '#ef4444', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer' }} aria-label="Close dialog">×</button>
            </div>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: 6, margin: '8px 0' }}>{drilldown.summary}</div>
            <div>
              {drilldown.rows.length ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }} aria-label="Drilldown records">
                  <thead>
                    <tr>
                      {Object.keys(drilldown.rows[0]).map(k => (
                        <th key={k} style={{ border: '1px solid #e5e7eb', padding: '6px 8px', background: '#f9fafb', textAlign: 'left' }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drilldown.rows.map((r, i) => (
                      <tr key={i}>
                        {Object.keys(drilldown.rows[0]).map(k => (
                          <td key={`${i}-${k}`} style={{ border: '1px solid #e5e7eb', padding: '6px 8px' }}>{r[k] != null ? String(r[k]) : ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No matching records.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
