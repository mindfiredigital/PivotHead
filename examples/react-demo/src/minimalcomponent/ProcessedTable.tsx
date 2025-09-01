import { PivotHeadEl } from '../components/PivotHead';

export interface SortState { field: string | null; dir: 'asc' | 'desc'; }
export interface UiModeStore { colOrder: string[]; rowOrder: string[]; sort: SortState }
export interface PivotState {
  rows?: Array<{ uniqueName: string; caption: string }>;
  columns?: Array<{ uniqueName: string; caption: string }>;
  measures?: Array<{ uniqueName: string; caption: string; aggregation: string }>;
  processedData?: { rows?: unknown[] } | null;
  rawData?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
}

export interface PaginationState { currentPage: number; totalPages: number; pageSize: number }

export interface ProcessedTableProps {
  pivot: PivotHeadEl | null;
  pivotState: PivotState | null;
  store: UiModeStore;
  setStore: (updater: (prev: UiModeStore) => UiModeStore) => void;
  pagination: PaginationState;
  toggleSort: (field: string) => void;
  onColDragStart: (index: number) => void;
  onColDrop: (toIndex: number) => void;
  onRowDragStart: (index: number) => void;
  onRowDropProcessed: (toIndex: number, currentRows: string[]) => void;
  showDrillDownModal: (args: { title: string; summary: string; rows: Array<Record<string, unknown>> }) => void;
}

export default function ProcessedTable({ pivot, pivotState: st, store, pagination: pg, toggleSort, onColDragStart, onColDrop, onRowDragStart, onRowDropProcessed, showDrillDownModal }: ProcessedTableProps) {
  if (!st || !pivot) return (<table id="pivot-table"><thead /><tbody /></table>);

  const rowField = st.rows?.[0];
  const colField = st.columns?.[0];
  const measures = st.measures || [];
  if (!rowField || !colField || measures.length === 0) return (<table id="pivot-table"><thead /><tbody /></table>);

  const groups = (pivot.getGroupedData?.() || []) as Array<{ key?: string; aggregates?: Record<string, unknown> }>;
  const uniqueCols = Array.from(new Set(groups.map(g => (g.key ? (g.key.includes('|') ? g.key.split('|')[1] : g.key.split('|')[0]) : '')))).filter(Boolean) as string[];
  const colOrder = (store.colOrder.length ? store.colOrder : uniqueCols).filter(c => uniqueCols.includes(c));

  const processedRows = (st.processedData?.rows as unknown[]) || [];
  let uniqueRows: string[] = [];
  const seen = new Set<string>();
  processedRows.forEach(r => {
    const v = (Array.isArray(r) ? (r as unknown[])[0] : (r as Record<string, unknown>)[rowField.uniqueName]) as unknown;
    const sv = String(v ?? '');
    if (!seen.has(sv)) { seen.add(sv); uniqueRows.push(sv); }
  });
  if (store.rowOrder.length) uniqueRows = store.rowOrder.filter(v => uniqueRows.includes(v));

  const start = (pg.currentPage - 1) * pg.pageSize;
  const end = start + pg.pageSize;
  const pageRows = uniqueRows.slice(start, end);

  return (
    <table id="pivot-table" aria-label="Processed pivot table">
      <thead>
        <tr className="groups">
          <th className="draggable" data-drag="row-header">{rowField.caption} / {colField.caption}</th>
          {colOrder.map((c, i) => (
            <th
              key={`g-${c}-${i}`}
              className="draggable"
              draggable
              onDragStart={() => onColDragStart(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onColDrop(i)}
              data-type="col"
              data-index={i}
              colSpan={measures.length}
            >
              {c}
            </th>
          ))}
        </tr>
        <tr className="measures">
          <th
            className={`ph-sortable${store.sort.field === rowField.uniqueName ? ` ph-sorted-${store.sort.dir}` : ''}`}
            data-sort-field={rowField.uniqueName}
            onClick={() => toggleSort(rowField.uniqueName)}
            aria-sort={store.sort.field === rowField.uniqueName ? (store.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
            scope="col"
          >
            {rowField.caption}
          </th>
          {colOrder.flatMap((colVal) => (
            measures.map((m, mi) => (
              <th
                key={`m-${String(colVal)}-${m.uniqueName}-${m.aggregation}-${mi}`}
                className={`ph-sortable${store.sort.field === m.uniqueName ? ` ph-sorted-${store.sort.dir}` : ''}`}
                data-sort-field={m.uniqueName}
                onClick={() => toggleSort(m.uniqueName)}
                aria-sort={store.sort.field === m.uniqueName ? (store.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                scope="col"
              >
                {m.caption}
              </th>
            ))
          ))}
        </tr>
      </thead>
      <tbody>
        {pageRows.map((rowVal, rIdx) => (
          <tr
            key={`r-${rowVal}-${rIdx}`}
            className="draggable"
            draggable
            onDragStart={() => onRowDragStart(rIdx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onRowDropProcessed(rIdx, pageRows)}
            data-type="row"
            data-index={rIdx}
            data-value={rowVal}
          >
            <td><strong>{rowVal}</strong></td>
            {colOrder.flatMap(colVal => (
              measures.map(m => {
                const group = groups.find(g => {
                  const keys = g.key ? g.key.split('|') : [];
                  return keys[0] === rowVal && (keys[1] || keys[0]) === colVal;
                });
                const key = `${m.aggregation}_${m.uniqueName}`;
                const agg = group?.aggregates?.[key];
                const numAgg = typeof agg === 'number' ? agg : Number(agg) || 0;
                const display = typeof agg === 'number' ? agg.toLocaleString() : (agg ?? '0');
                const hasData = Number(numAgg) > 0;
                const openDetails = () => {
                  if (!hasData) return;
                  const stSnap = (st || {}) as { rawData?: Array<Record<string, unknown>>; data?: Array<Record<string, unknown>> };
                  const raw = stSnap.rawData || stSnap.data || [];
                  const subset = raw.filter(r => String(r[rowField.uniqueName] ?? '') === String(rowVal) && String(r[colField.uniqueName] ?? '') === String(colVal));
                  let computed = 0;
                  const nums = subset.map(r => Number((r as Record<string, unknown>)[m.uniqueName] ?? 0));
                  if (m.aggregation === 'avg') computed = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
                  else if (m.aggregation === 'max') computed = nums.length ? Math.max(...nums) : 0;
                  else if (m.aggregation === 'min') computed = nums.length ? Math.min(...nums) : 0;
                  else if (m.aggregation === 'count') computed = subset.length;
                  else computed = nums.reduce((a, b) => a + b, 0);
                  const aggDisplay = (Number.isFinite(numAgg) && numAgg !== 0 ? numAgg : computed).toLocaleString();
                  showDrillDownModal({
                    title: `${rowField.uniqueName}: ${rowVal}${colField.uniqueName ? `, ${colField.uniqueName}: ${colVal}` : ''}`,
                    summary: `Records: ${subset.length}. ${m.caption} (${m.aggregation}) = ${aggDisplay}`,
                    rows: subset,
                  });
                };
                return (
                  <td
                    key={`c-${rowVal}-${colVal}-${m.uniqueName}-${m.aggregation}`}
                    className={hasData ? 'drill-down-cell' : ''}
                    title={hasData ? 'Click to view underlying records' : ''}
                    onClick={openDetails}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(); } }}
                    role={hasData ? 'button' : undefined}
                    tabIndex={hasData ? 0 : undefined}
                    data-row-value={String(rowVal)}
                    data-column-value={String(colVal)}
                    data-measure-name={m.uniqueName}
                    data-measure-caption={m.caption}
                    data-measure-agg={m.aggregation}
                    data-row-field={rowField.uniqueName}
                    data-column-field={colField.uniqueName}
                    data-aggregate-value={numAgg}
                  >
                    {String(display)}
                  </td>
                );
              })
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
