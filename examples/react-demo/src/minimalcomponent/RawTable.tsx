import { PivotHeadEl } from '../components/PivotHead';
import type { UiModeStore, PivotState, PaginationState } from './ProcessedTable';

export interface RawTableProps {
  pivot: PivotHeadEl | null;
  pivotState: PivotState | null;
  store: UiModeStore;
  setStore: (updater: (prev: UiModeStore) => UiModeStore) => void;
  pagination: PaginationState;
  toggleSort: (field: string) => void;
  onColDragStart: (index: number) => void;
  onColDrop: (toIndex: number) => void;
  onRowDragStart: (index: number) => void;
  onRowDropRaw: (globalToIndex: number) => void;
}

export default function RawTable({ pivot, pivotState: st, store, pagination: pg, toggleSort, onColDragStart, onColDrop, onRowDragStart, onRowDropRaw }: RawTableProps) {
  const rows = (pivot?.getData?.() || (st?.rawData || st?.data) || []) as Array<Record<string, unknown>>;

  if (rows.length === 0) return (
    <table id="pivot-table"><thead /><tbody /></table>
  );

  // Determine column order
  const keys = Object.keys(rows[0]);
  const colOrder = (store.colOrder.length ? store.colOrder : keys).filter(k => keys.includes(k));

  // Sorting
  const sort = store.sort;
  let viewRows = [...rows];
  if (sort.field) {
    const field = sort.field as string;
    viewRows.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
      const as = String(av ?? '');
      const bs = String(bv ?? '');
      return sort.dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }

  // Row order
  if (store.rowOrder.length) {
    const firstKey = colOrder[0];
    const orderSet = new Set(store.rowOrder.map(String));
    viewRows = viewRows
      .sort((a, b) => store.rowOrder.indexOf(String(a[firstKey])) - store.rowOrder.indexOf(String(b[firstKey])))
      .concat(viewRows.filter(r => !orderSet.has(String(r[firstKey]))));
  }

  // Pagination slice using PivotHead state
  const start = (pg.currentPage - 1) * pg.pageSize;
  const end = start + pg.pageSize;
  const pageRows = viewRows.slice(start, end);

  return (
    <table id="pivot-table" aria-label="Raw data table">
      <thead>
        <tr className="measures">
          {colOrder.map((k, i) => (
            <th
              key={`h-${k}-${i}`}
              className={`draggable ph-sortable${store.sort.field === k ? ` ph-sorted-${store.sort.dir}` : ''}`}
              draggable
              onDragStart={() => onColDragStart(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onColDrop(i)}
              data-type="col"
              data-index={i}
              data-sort-field={k}
              onClick={() => toggleSort(k)}
              aria-sort={store.sort.field === k ? (store.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
              scope="col"
            >
              {k}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pageRows.map((row, rIdx) => (
          <tr
            key={`r-${start + rIdx}`}
            className="draggable"
            draggable
            onDragStart={() => onRowDragStart(start + rIdx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onRowDropRaw(start + rIdx)}
            data-type="row"
            data-index={rIdx}
            data-global-index={start + rIdx}
          >
            {colOrder.map(k => (
              <td key={`c-${start + rIdx}-${k}`}>{row[k] != null ? String(row[k]) : ''}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
