import React, { useEffect, useRef, useState } from 'react';
import {
  PivotHead,
  type PivotHeadRef,
  type PivotTableState,
  type FilterConfig,
  type PivotOptions,
  type PivotDataRecord,
  type PivotHeadProps,
} from '@mindfiredigital/pivothead-react';

// Local UI store types
type SortDir = 'asc' | 'desc';
interface SortState { field: string | null; dir: SortDir }
interface UiStore { colOrder: string[]; rowOrder: string[]; sort: SortState }
interface DndState { type: 'row' | 'col' | null; fromIndex: number }

// Narrowed shapes from state we rely upon
interface AxisField { uniqueName: string; caption: string }
interface MeasureField { uniqueName: string; caption: string; aggregation: string }
interface MinimalProcessedData { rows: unknown[][] }
interface MinimalState {
  rows?: AxisField[];
  columns?: AxisField[];
  measures?: MeasureField[];
  processedData?: MinimalProcessedData;
  rawData?: PivotDataRecord[];
  data?: PivotDataRecord[];
}

// Simple modal for drill-down
function Modal({ open, title, summary, rows, onClose }: { open: boolean; title: string; summary: string; rows: Array<Record<string, unknown>>; onClose: () => void }) {
  if (!open) return null;
  const headers = rows && rows.length ? Object.keys(rows[0]) : [];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,.2)', padding: 16, width: '90%', maxWidth: 840, maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>Details: {title}</div>
          <button onClick={onClose} style={{ fontSize: 18, border: 'none', background: '#ef4444', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ background: '#f3f4f6', padding: 8, borderRadius: 6, margin: '8px 0' }}>{summary}</div>
        {rows && rows.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h} style={{ border: '1px solid #e5e7eb', padding: '6px 8px', background: '#f9fafb', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {headers.map(h => {
                    const v = r[h as keyof typeof r];
                    return (
                      <td key={h} style={{ border: '1px solid #e5e7eb', padding: '6px 8px' }}>{v != null ? String(v) : ''}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No matching records.</div>
        )}
      </div>
    </div>
  );
}

type Props = {
  data: PivotDataRecord[];
  options?: PivotOptions;
};

export default function NoneMode({ data, options }: Props) {
  const ref = useRef<PivotHeadRef>(null);
  // JSX-friendly alias for wrapper
  const PivotHeadComponent = PivotHead as unknown as React.ComponentType<PivotHeadProps & React.RefAttributes<PivotHeadRef>>;

  // View mode and filters controlled here
  const [viewMode, setViewMode] = useState<'processed' | 'raw'>('processed');
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  // Snapshot of engine state and pagination
  const [pivotState, setPivotState] = useState<PivotTableState<PivotDataRecord> | null>(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 10 });
  const [pageInput, setPageInput] = useState<string>('1');

  // Per-mode UI stores
  const [processedStore, setProcessedStore] = useState<UiStore>({ colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } });
  const [rawStore, setRawStore] = useState<UiStore>({ colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } });
  const currentStore = viewMode === 'processed' ? processedStore : rawStore;
  const setCurrentStore = viewMode === 'processed' ? setProcessedStore : setRawStore;

  // DnD state
  const [dnd, setDnd] = useState<DndState>({ type: null, fromIndex: -1 });

  // Filter UI controls
  const [filterField, setFilterField] = useState<string>('');
  const [filterOperator, setFilterOperator] = useState<'equals' | 'contains' | 'greaterThan' | 'lessThan'>('equals');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Drill-down modal
  const [modal, setModal] = useState<{ open: boolean; title: string; summary: string; rows: Array<Record<string, unknown>> }>({ open: false, title: '', summary: '', rows: [] });

  // Format version for forcing re-renders when formatting changes
  const [formatVersion, setFormatVersion] = useState(0);

  // Prevent re-render during drag operations
  const [isDragging, setIsDragging] = useState(false);

  // Helpers
  const getPagination = () => ref.current?.methods.getPagination?.();
  const syncPagination = () => {
    const p = getPagination();
    if (p) setPagination({ currentPage: p.currentPage, totalPages: p.totalPages, pageSize: p.pageSize });
  };

  // Keep page input in sync with current page
  useEffect(() => {
    setPageInput(String(pagination.currentPage));
  }, [pagination.currentPage]);

  // Derive filter field options from current pivot state
  useEffect(() => {
    const st = pivotState as unknown as MinimalState | null;
    if (!st) return;
    const opts: Array<{ value: string; label: string }> = [];
    if (viewMode === 'processed') {
      st.rows?.forEach((r) => opts.push({ value: r.uniqueName, label: r.caption }));
      st.columns?.forEach((c) => opts.push({ value: c.uniqueName, label: c.caption }));
      st.measures?.forEach((m) => opts.push({ value: `${m.aggregation}_${m.uniqueName}`, label: m.caption }));
    } else {
      const rows = (st.rawData || st.data || []) as Array<Record<string, unknown>>;
      const keys = rows.length ? Object.keys(rows[0]) : [];
      keys.forEach(k => opts.push({ value: k, label: k }));
    }
    setFilterOptions(opts);
    if (opts.length && !opts.find(o => o.value === filterField)) {
      setFilterField(opts[0].value);
    }
  }, [pivotState, viewMode]);

  // Initialize column order once per view when data/state changes (avoid setState inside render)
  useEffect(() => {
    if (!ref.current) return;
    const st = ref.current.methods.getState?.();
    if (!st) return;
    if (viewMode === 'processed') {
      const groups = (ref.current.methods.getGroupedData?.() || []) as Array<{ key?: string }>;
      const uniqueCols = Array.from(new Set(groups.map(g => {
        const key = g?.key ?? '';
        const parts = String(key).split('|');
        return parts[1] || parts[0] || '';
      }))).filter(Boolean) as string[];
      if (uniqueCols.length) {
        setProcessedStore(s => (s.colOrder.length === 0 ? { ...s, colOrder: [...uniqueCols] } : s));
      }
    } else {
      const rows = (ref.current.methods.getData?.() || st.rawData || st.data || []) as Array<Record<string, unknown>>;
      const keys = rows.length ? Object.keys(rows[0]) : [];
      if (keys.length) {
        setRawStore(s => (s.colOrder.length === 0 ? { ...s, colOrder: [...keys] } : s));
      }
    }
  }, [viewMode, pivotState]);

  // Events from wrapper -> update local state
  const handleStateChange = (e: CustomEvent) => {
    // Ignore state changes during drag operations to prevent interference
    if (isDragging) {
      return;
    }
    setPivotState(e.detail as PivotTableState<PivotDataRecord>);
    // No engine-order mirroring; we control row order locally
    syncPagination();
  };
  const handleViewMode = (e: CustomEvent<{ mode: 'raw' | 'processed' }>) => {
    setViewMode(e.detail.mode);
    const st = ref.current?.methods.getState?.();
    setPivotState(st as PivotTableState<PivotDataRecord>);
    syncPagination();
  };

  // Toolbar actions
  const applyFilter = () => {
    if (!filterField || !filterOperator) return;
    const next: FilterConfig[] = [
      { field: filterField, operator: filterOperator, value: filterValue } as unknown as FilterConfig,
    ];
    setFilters(next);
    ref.current?.methods.goToPage(1);
  };
  const resetFilter = () => {
    setFilters([]);
    setFilterValue('');
    ref.current?.methods.goToPage(1);
  };
  const changePageSize = (size: number) => {
    if (!Number.isFinite(size) || size <= 0) return;
    ref.current?.methods.setPageSize(size);
  };
  const goToPageInput = () => {
    const total = Math.max(1, Number(pagination.totalPages) || 1);
    let n = Number(pageInput);
    if (!Number.isFinite(n)) n = pagination.currentPage;
    n = Math.max(1, Math.min(total, Math.trunc(n)));
    ref.current?.methods.goToPage(n);
  };

  // Custom format handler that triggers re-render
  const handleFormat = () => {
    ref.current?.methods.showFormatPopup?.();
    // Force re-render after a short delay to pick up format changes
    setTimeout(() => setFormatVersion(v => v + 1), 500);
  };

  // Sorting
  const toggleSort = (field: string, columnValue?: string, isMeasureHeader?: boolean) => {
    // Determine next direction from local UI state so UI toggles immediately
    const prev = currentStore.sort;
    const nextDir: SortDir = prev.field === field ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc';

    // Update local sort state so arrows toggle immediately
    setCurrentStore(s => ({ ...s, sort: { field, dir: nextDir } }));

    // Raw mode: just update local state and rely on local rendering
    if (viewMode === 'raw') return;

    // Processed mode: compute local row order only (no engine custom order)
    try {
      const s = (pivotState as unknown as MinimalState | null);
      const rowFieldName = s?.rows?.[0]?.uniqueName || '';

      if (isMeasureHeader && columnValue) {
        // Sorting by a measure under a specific column: order rows by that column's aggregate
        const measures = (s?.measures || []) as Array<{ uniqueName: string; aggregation?: string }>;
        const cfg = measures.find(m => m.uniqueName === field);
        const aggregation = (cfg?.aggregation || 'sum') as string;
        const aggKey = `${aggregation}_${field}`;
        const groups = (ref.current?.methods.getGroupedData?.() || []) as Array<{ key?: string; aggregates?: Record<string, number> }>;

        // Build the set of all row labels across all groups
        const allRowSet = new Set<string>();
        groups.forEach(g => {
          const parts = (g?.key || '').split('|');
          if (parts[0]) allRowSet.add(parts[0]);
        });
        const allRows = Array.from(allRowSet);

        // Create [row, value] pairs for the chosen column; fill missing with 0
        const pairs = allRows.map(rv => {
          const grp = groups.find(gr => {
            const parts = (gr?.key || '').split('|');
            return parts[0] === rv && parts[1] === columnValue;
          });
          const val = Number((grp?.aggregates || {})[aggKey] ?? 0);
          return { row: rv, val: Number.isFinite(val) ? val : 0 };
        });

        pairs.sort((a, b) => (nextDir === 'asc' ? a.val - b.val : b.val - a.val));
        const orderedRows = pairs.map(p => p.row);
        if (rowFieldName && orderedRows.length > 0) {
          setProcessedStore(su => ({ ...su, rowOrder: orderedRows }));
        }
      } else if (rowFieldName && field === rowFieldName) {
        // Sorting by the row dimension header: alphabetical ordering
        const groups = (ref.current?.methods.getGroupedData?.() || []) as Array<{ key?: string }>;
        const rowSet = new Set<string>();
        groups.forEach(g => {
          const parts = (g?.key || '').split('|');
          if (parts[0]) rowSet.add(parts[0]);
        });
        const rows = Array.from(rowSet);
        rows.sort((a, b) => (nextDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));
        if (rows.length > 0) {
          setProcessedStore(su => ({ ...su, rowOrder: rows }));
        }
      }
    } catch (err) {
      console.warn('Failed to compute local row order for processed sort:', err);
    }
  };

  // Helper to read currently visible columns from the engine (matches minimal demo logic)
  const getVisibleColumns = (): string[] => {
    const st = pivotState as unknown as MinimalState | null;
    if (!st) return [];
    if (viewMode === 'processed') {
      const groups = (ref.current?.methods.getGroupedData?.() || []) as Array<{ key?: string }>;
      const unique = Array.from(new Set(groups.map(g => {
        const key = g?.key ?? '';
        const parts = String(key).split('|');
        return parts[1] || parts[0] || '';
      })));
      return unique.filter(Boolean) as string[];
    } else {
      const rows = (st.rawData || st.data || []) as Array<Record<string, unknown>>;
      return rows.length ? Object.keys(rows[0]) : [];
    }
  };

  // Column DnD
  const handleColDragStart = (e: React.DragEvent, index: number) => {
    try { e.dataTransfer?.setData('text/plain', String(index)); } catch (_err) { /* ignore */ }
    setDnd({ type: 'col', fromIndex: index });
  };
  const handleColDrop = (toIndex: number) => {
    if (dnd.type !== 'col') return;
    const from = dnd.fromIndex;
    const to = toIndex;
    // Perform swap at engine level when available
    try { ref.current?.methods.swapColumns?.(from, to); } catch (err) { console.warn('swapColumns failed', err); }
    // Mirror swap locally for deterministic UI
    setCurrentStore(s => {
      const arr = [...(s.colOrder.length ? s.colOrder : [])];
      if (arr.length === 0) arr.push(...getVisibleColumns());
      if (arr.length === 0) return s;
      if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return s;
      const tmp = arr[from];
      arr[from] = arr[to];
      arr[to] = tmp;
      return { ...s, colOrder: arr };
    });
    setDnd({ type: null, fromIndex: -1 });
  };

  // Row DnD - simple implementation that delegates to web component
  const handleRowDragStart = (index: number) => {
    console.log(`[DRAG] Starting row drag: index=${index}, viewMode=${viewMode}`);
    setIsDragging(true);
    setDnd({ type: 'row', fromIndex: index });
  };
  const handleRowDropProcessed = (toIndex: number, visibleLabels: string[]) => {
    if (dnd.type !== 'row') return;
    console.log(`[DRAG] Processing row drop: fromIndex=${dnd.fromIndex}, toIndex=${toIndex}, viewMode=${viewMode}`);
    setCurrentStore(s => {
      const order = s.rowOrder.length ? [...s.rowOrder] : [...visibleLabels];
      const from = dnd.fromIndex;
      const to = toIndex;
      if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return s;
      const tmp = order[from];
      order[from] = order[to];
      order[to] = tmp;
      console.log(`[DRAG] Updated processed row order:`, order);
      return { ...s, rowOrder: order };
    });
    setDnd({ type: null, fromIndex: -1 });
    setIsDragging(false);
  };
  const handleRowDropRaw = (toIndex: number) => {
    if (dnd.type !== 'row') return;
    console.log(`[DRAG] Raw row drop: fromIndex=${dnd.fromIndex}, toIndex=${toIndex}, viewMode=${viewMode}`);
    const elSwap = ref.current?.methods.swapRows;
    if (elSwap) {
      try { 
        console.log(`[DRAG] Calling engine swapRows(${dnd.fromIndex}, ${toIndex})`);
        elSwap(dnd.fromIndex, toIndex); 
        console.log(`[DRAG] Engine swapRows completed successfully`);
      } catch (err) { 
        console.warn('[DRAG] swapRows failed', err); 
      }
    } else {
      console.warn('[DRAG] No swapRows method available');
    }
    setDnd({ type: null, fromIndex: -1 });
    setIsDragging(false);
  };

  // Helpers for drill-down and safe access
  const getVal = (obj: Record<string, unknown>, key: string): unknown => obj[key as keyof typeof obj];
  const toNum = (v: unknown): number => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  // Drill-down builder
  const openDrillDown = (
    rowField: string,
    rowValue: string,
    colField: string,
    colValue: string,
    measureName: string,
    measureCaption: string,
    measureAgg: string,
    cellAgg: number
  ) => {
    const st = pivotState as unknown as MinimalState | null;
    const raw = ((st?.rawData || st?.data || []) as Array<Record<string, unknown>>);
    const subset = raw.filter(r => String(getVal(r, rowField) ?? '') === String(rowValue) && String(getVal(r, colField) ?? '') === String(colValue));
    let computed = 0;
    if (subset.length && measureName) {
      const nums = subset.map(r => toNum(getVal(r, measureName)));
      if (measureAgg === 'avg') computed = nums.reduce((a, b) => a + b, 0) / nums.length;
      else if (measureAgg === 'max') computed = nums.length ? Math.max(...nums) : 0;
      else if (measureAgg === 'min') computed = nums.length ? Math.min(...nums) : 0;
      else if (measureAgg === 'count') computed = subset.length;
      else computed = nums.reduce((a, b) => a + b, 0);
    }
    const aggDisplay = (Number.isFinite(cellAgg) && cellAgg !== 0 ? cellAgg : computed).toLocaleString();
    setModal({
      open: true,
      title: `${rowField}: ${rowValue}${colField ? `, ${colField}: ${colValue}` : ''}`,
      summary: `Records: ${subset.length}. ${measureCaption} (${measureAgg}) = ${aggDisplay}`,
      rows: subset,
    });
  };

  // Renderers
  const renderProcessedTable = () => {
    // Use formatVersion to force re-render when formatting changes
    const _ = formatVersion; // eslint-disable-line @typescript-eslint/no-unused-vars
    
    const st = (pivotState as unknown as MinimalState | null);
    if (!st) return null;
    const rowField = st.rows?.[0];
    const colField = st.columns?.[0];
    const measures = st.measures || [];
    if (!rowField || !colField || measures.length === 0) return null;

    // Groups from element for fast lookup of intersections
    const groups = (ref.current?.methods.getGroupedData?.() || []) as Array<{ key?: string; aggregates?: Record<string, number> }>;

    // Unique columns from groups
    const uniqueCols = Array.from(new Set(groups.map(g => {
      const key = g?.key ?? '';
      const parts = String(key).split('|');
      return (parts[1] || parts[0] || '') as string;
    }))).filter(Boolean) as string[];

    const colOrder = (currentStore.colOrder.length ? currentStore.colOrder : uniqueCols).filter(c => uniqueCols.includes(c));

    // Derive all row labels across groups and apply our local row order (if any)
    const allRowSet = new Set<string>();
    groups.forEach(g => {
      const parts = String(g?.key ?? '').split('|');
      if (parts[0]) allRowSet.add(parts[0]);
    });
    let uniqueRows: string[] = Array.from(allRowSet);
    if (processedStore.rowOrder.length) {
      uniqueRows = processedStore.rowOrder.filter(v => uniqueRows.includes(v));
    }

    const p = pagination; // already synced
    const start = (p.currentPage - 1) * p.pageSize;
    const end = start + p.pageSize;
    const pageRows = uniqueRows.slice(start, end);

    const rowSortClass = currentStore.sort.field === rowField.uniqueName ? ` sorted-${currentStore.sort.dir}` : '';

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: 8, background: '#f4f7fa', borderBottom: '1px solid #e2e7ed', textAlign: 'left' }}>{rowField.caption} / {colField.caption}</th>
            {colOrder.map((c, i) => (
              <th
                key={c}
                colSpan={measures.length}
                draggable
                onDragStart={(e) => handleColDragStart(e, i)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleColDrop(i)}
                style={{ padding: 8, background: '#f4f7fa', borderBottom: '1px solid #e2e7ed', textAlign: 'center', cursor: 'move' }}
              >
                {c}
              </th>
            ))}
          </tr>
          <tr>
            <th onClick={() => toggleSort(rowField.uniqueName)} style={{ padding: 8, background: '#f8f9fa', borderBottom: '1px solid #dee2e6', cursor: 'pointer', textAlign: 'left' }}>{rowField.caption}{rowSortClass ? (currentStore.sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
            {colOrder.map(c => (
              measures.map((m) => {
                const active = currentStore.sort.field === m.uniqueName;
                return (
                  <th key={`${c}-${m.uniqueName}`} onClick={() => toggleSort(m.uniqueName, c, true)} style={{ padding: 8, background: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{m.caption}</span>
                      {active && <span style={{ marginLeft: 5 }}>{currentStore.sort.dir === 'asc' ? '▲' : '▼'}</span>}
                    </div>
                  </th>
                );
              })
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((rowVal, rIdx) => (
            <tr key={rowVal} draggable onDragStart={() => handleRowDragStart(rIdx)} onDragOver={e => e.preventDefault()} onDrop={() => handleRowDropProcessed(rIdx, pageRows)} style={{ cursor: 'move' }}>
              <td style={{ fontWeight: 'bold', padding: 8, borderBottom: '1px solid #dee2e6' }}>{rowVal}</td>
              {colOrder.map(colVal => (
                measures.map((m) => {
                  const grp = groups.find((g) => {
                    const key = g?.key ?? '';
                    const parts = String(key).split('|');
                    return parts[0] === rowVal && (parts[1] || parts[0]) === colVal;
                  });
                  const aggKey = `${m.aggregation}_${m.uniqueName}`;
                  const val = toNum((grp?.aggregates || {})[aggKey]);
                  const hasData = Number(val) > 0;
                  
                  // Use the web component's formatValue method if available, otherwise fall back to toLocaleString
                  let display = '0';
                  if (Number.isFinite(val)) {
                    const formatted = ref.current?.methods.formatValue?.(val, m.uniqueName);
                    display = formatted || val.toLocaleString();
                  } else {
                    display = String((val as unknown) ?? '0');
                  }
                  
                  // Get text alignment from web component
                  const textAlign = (ref.current?.methods.getFieldAlignment?.(m.uniqueName) || 'right') as 'left' | 'right' | 'center';
                  
                  return (
                    <td key={`${rowVal}-${colVal}-${m.uniqueName}`} onClick={() => openDrillDown(rowField.uniqueName, String(rowVal), colField.uniqueName, String(colVal), m.uniqueName, m.caption, m.aggregation, val)} title={hasData ? 'Click to view underlying records' : ''} style={{ padding: 8, borderBottom: '1px solid #eee', borderRight: '1px solid #f0f0f0', cursor: hasData ? 'pointer' : 'default', textAlign }}>
                      {display}
                    </td>
                  );
                })
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderRawTable = () => {
    const st = pivotState as PivotTableState<PivotDataRecord> | null;
    if (!st) return null;
    const rows = (ref.current?.methods.getData?.() || (st.rawData as PivotDataRecord[]) || (st.data as PivotDataRecord[]) || []) as Array<Record<string, unknown>>;
    if (!rows.length) return null;
    const keys = Object.keys(rows[0]);

    const colOrder = (currentStore.colOrder.length ? currentStore.colOrder : keys).filter(k => keys.includes(k));

    // In raw mode, apply local sorting and row ordering only when not dragging
    let viewRows = [...rows];
    if (!isDragging) {
      // Sort view
      const sort = currentStore.sort;
      if (sort.field) {
        viewRows.sort((a, b) => {
          const av = a[sort.field as keyof typeof a];
          const bv = b[sort.field as keyof typeof b];
          if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : (bv as number) - (av as number);
          const as = String(av ?? '');
          const bs = String(bv ?? '');
          return sort.dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
        });
      }

      // Row order (but don't apply during drag to avoid conflicts)
      if (currentStore.rowOrder.length) {
        const firstKey = colOrder[0];
        const orderSet = new Set(currentStore.rowOrder.map(String));
        viewRows = viewRows
          .sort((a, b) => currentStore.rowOrder.indexOf(String(a[firstKey as keyof typeof a])) - currentStore.rowOrder.indexOf(String(b[firstKey as keyof typeof b])))
          .concat(viewRows.filter(r => !orderSet.has(String(r[firstKey as keyof typeof r]))));
      }
    }

    const p = pagination;
    const start = (p.currentPage - 1) * p.pageSize;
    const end = start + p.pageSize;
    const pageRows = viewRows.slice(start, end);

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {colOrder.map((k, i) => {
              const active = currentStore.sort.field === k;
              return (
                <th key={k} draggable onDragStart={(e) => handleColDragStart(e, i)} onDragOver={e => e.preventDefault()} onDrop={() => handleColDrop(i)} onClick={() => toggleSort(k)} style={{ padding: 8, background: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', cursor: 'pointer' }}>
                  {k} {active ? (currentStore.sort.dir === 'asc' ? '▲' : '▼') : ''}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, rIdx) => {
            const globalIndex = start + rIdx;
            return (
              <tr key={globalIndex} draggable onDragStart={() => handleRowDragStart(globalIndex)} onDragOver={e => e.preventDefault()} onDrop={() => handleRowDropRaw(globalIndex)} style={{ cursor: 'move' }}>
                {colOrder.map(k => {
                  const cellValue = row[k as keyof typeof row] ?? '';
                  // Use the web component's formatValue method if available
                  const formatted = ref.current?.methods.formatValue?.(cellValue, k);
                  const display = formatted || String(cellValue);
                  
                  // Get text alignment from the web component
                  const textAlign = (ref.current?.methods.getFieldAlignment?.(k) || 'left') as 'left' | 'right' | 'center';
                  
                  return (
                    <td key={String(k)} style={{ padding: 8, borderBottom: '1px solid #eee', borderRight: '1px solid #f0f0f0', textAlign }}>{display}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Mount: set initial view and bootstrap first state
  useEffect(() => {
    // Set processed by default
    ref.current?.methods.setViewMode('processed');
    // Bootstrap snapshot if available
    const st = ref.current?.methods.getState?.();
    if (st) {
      setPivotState(st as PivotTableState<PivotDataRecord>);
      syncPagination();
    }
  }, []);

  return (
    <div>
      {/* Fully headless UI (no slots). Toolbar + Table rendered by user here */}
      <div className="grid-header">
        <div className="toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Field</label>
          <select value={filterField} onChange={e => setFilterField(e.target.value)}>
            {filterOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
          <select value={filterOperator} onChange={e => setFilterOperator(e.target.value as typeof filterOperator)}>
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
          <input type="text" value={filterValue} onChange={e => setFilterValue(e.target.value)} placeholder="Value" />
          <button onClick={applyFilter}>Apply</button>
          <button onClick={resetFilter}>Reset</button>

          <button onClick={() => ref.current?.methods.setViewMode(viewMode === 'processed' ? 'raw' : 'processed')}>
            {viewMode === 'processed' ? 'Switch to Raw' : 'Switch to Processed'}
          </button>

          {/* Format and Export actions */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button title="Format cells" onClick={handleFormat}>Format</button>
            <button title="Export current view as HTML" onClick={() => ref.current?.methods.exportToHTML?.('pivot-export.html')}>Export HTML</button>
            <button title="Export current view as Excel" onClick={() => ref.current?.methods.exportToExcel?.('pivot-export.xlsx')}>Export Excel</button>
            <button title="Export current view as PDF" onClick={() => ref.current?.methods.exportToPDF?.('pivot-export.pdf')}>Export PDF</button>
            <button title="Print current view" onClick={() => ref.current?.methods.openPrintDialog?.()}>Print</button>
          </div>

          <span style={{ marginLeft: 'auto' }} />
          <label>Page Size</label>
          <select value={String(pagination.pageSize)} onChange={e => changePageSize(Number(e.target.value))}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <button onClick={() => ref.current?.methods.previousPage()}>Prev</button>
          <label>Page</label>
          <input type="number" min={1} max={pagination.totalPages} value={pageInput} onChange={e => setPageInput(e.target.value)} style={{ width: 64 }} />
          <button onClick={goToPageInput}>Go</button>
          <span>of {pagination.totalPages}</span>
          <button onClick={() => ref.current?.methods.nextPage()}>Next</button>
        </div>
      </div>

      <div className="grid-body">
        {viewMode === 'processed' ? renderProcessedTable() : renderRawTable()}
      </div>

      <Modal open={modal.open} title={modal.title} summary={modal.summary} rows={modal.rows} onClose={() => setModal(m => ({ ...m, open: false }))} />

      {/* Engine in none mode: no slots, just the headless engine */}
      <PivotHeadComponent
        ref={ref}
        mode="none"
        data={data}
        options={options}
        filters={filters}
        onStateChange={handleStateChange}
        onViewModeChange={handleViewMode}
        onPaginationChange={(e) => setPagination(e.detail)}
      />
    </div>
  );
}
