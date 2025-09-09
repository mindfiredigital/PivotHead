import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { PivotOptions } from '../options';
import type { DataRecord } from '../data';
import { PivotHeadModule } from '@mindfiredigital/pivothead-angular';
import type {
  PivotHeadEl,
  FilterConfig,
  PaginationConfig,
} from '@mindfiredigital/pivothead-angular';

// Narrowed shapes used locally
interface AxisField {
  uniqueName: string;
  caption: string;
}
interface MeasureField {
  uniqueName: string;
  caption: string;
  aggregation: string;
}
interface MinimalState {
  rows?: AxisField[];
  columns?: AxisField[];
  measures?: MeasureField[];
  rawData?: DataRecord[];
  data?: DataRecord[];
}

@Component({
  selector: 'app-minimal-mode',
  standalone: true,
  imports: [CommonModule, PivotHeadModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './minimal-mode.component.html',
  styleUrl: './minimal-mode.component.css',
})
export class MinimalModeComponent {
  @Input() data: DataRecord[] = [];
  @Input() options?: PivotOptions;

  // Local UI state properties
  viewMode: 'processed' | 'raw' = 'processed';
  filters: FilterConfig[] = [];
  pagination = { currentPage: 1, totalPages: 1, pageSize: 10 };

  // Derived fields for filter dropdown
  state: MinimalState | null = null;
  fieldOptions: string[] = [];
  filterField = '';
  filterOperator = 'equals';
  filterValue = '';

  @ViewChild('ph', { read: ElementRef }) phEl?: ElementRef<HTMLElement>;

  private get el(): PivotHeadEl | null {
    const host = this.phEl?.nativeElement as HTMLElement | undefined;
    if (!host) return null;
    if (host.tagName === 'PIVOT-HEAD') return host as unknown as PivotHeadEl;
    const child = host.querySelector?.('pivot-head');
    return (child as unknown as PivotHeadEl) || null;
  }

  onStateChange(e: any) {
    const detail = e?.detail ?? e;
    this.state = detail as MinimalState;
    this.syncPagination();
    this.syncFilterFields();
  }
  onViewMode(e: any) {
    const detail = e?.detail ?? e;
    this.viewMode = detail.mode;
    const st = this.el?.getState?.();
    if (st) this.state = st as MinimalState;
    this.syncPagination();
    this.syncFilterFields();
  }
  onPagination(e: any) {
    const detail = e?.detail ?? e;
    this.pagination = {
      currentPage: detail.currentPage,
      totalPages: detail.totalPages,
      pageSize: detail.pageSize,
    };
  }

  applyFilter() {
    const field = this.filterField;
    const operator = this.filterOperator;
    const value = this.filterValue;
    if (!field) return;
    const next: FilterConfig[] = [{ field, operator, value } as FilterConfig];
    const el = this.el;
    if (!el) return;
    try {
      el.setAttribute('filters', JSON.stringify(next));
    } catch (_err) {
      /* noop */ void 0;
    }
    try {
      (el as PivotHeadEl).filters = next as FilterConfig[];
    } catch (_err) {
      /* noop */ void 0;
    }
    try {
      el.goToPage?.(1);
    } catch (_err) {
      /* noop */ void 0;
    }
  }
  resetFilter() {
    this.filterValue = '';
    const el = this.el;
    if (!el) return;
    try {
      el.setAttribute('filters', JSON.stringify([]));
    } catch (_err) {
      /* noop */ void 0;
    }
    try {
      (el as PivotHeadEl).filters = [] as FilterConfig[];
    } catch (_err) {
      /* noop */ void 0;
    }
    try {
      el.goToPage?.(1);
    } catch (_err) {
      /* noop */ void 0;
    }
  }
  changePageSize(size: number) {
    const el = this.el;
    if (!el) return;
    try {
      el.setPageSize?.(size);
    } catch (_err) {
      /* noop */ void 0;
    }
  }
  goToPage(n: number) {
    const el = this.el;
    if (!el) return;
    try {
      el.goToPage?.(n);
    } catch (_err) {
      /* noop */ void 0;
    }
  }
  showFormat() {
    this.el?.showFormatPopup?.();
  }

  private syncPagination() {
    const p = this.el?.getPagination?.();
    if (p)
      this.pagination = {
        currentPage: p.currentPage,
        totalPages: p.totalPages,
        pageSize: p.pageSize,
      };
  }

  private syncFilterFields() {
    const st = this.state;
    if (!st) return;
    const opts: string[] = [];
    if (this.viewMode === 'processed') {
      st.rows?.forEach(r => opts.push(r.uniqueName));
      st.columns?.forEach(c => opts.push(c.uniqueName));
      st.measures?.forEach(m => opts.push(`${m.aggregation}_${m.uniqueName}`));
    } else {
      const rows = (st.rawData || st.data || []) as Array<
        Record<string, unknown>
      >;
      const keys = rows.length ? Object.keys(rows[0]) : [];
      opts.push(...keys);
    }
    this.fieldOptions = opts;
    if (!opts.length) return;
    if (!opts.includes(this.filterField)) this.filterField = opts[0];
  }

  getCellValue(rowKey: string, measureKey: string): string {
    const st = this.state;
    if (!st || !st.data) return '';
    const record = st.data.find((r: any) => r[rowKey] !== undefined);
    return record ? String(record[measureKey]) : '';
  }

  // Getters for template binding
  get viewModeValue() {
    return this.viewMode;
  }
  get filtersValue() {
    return this.filters;
  }
  get paginationValue() {
    return this.pagination;
  }
  get fieldOptionsValue() {
    return this.fieldOptions;
  }
  get filterFieldValue() {
    return this.filterField;
  }
  get filterOperatorValue() {
    return this.filterOperator;
  }
  get filterValueValue() {
    return this.filterValue;
  }

  onFilterFieldChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterField = value;
  }
  onFilterOperatorChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as
      | 'equals'
      | 'contains'
      | 'greaterThan'
      | 'lessThan';
    this.filterOperator = value;
  }
  onFilterValueInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
  }
  onPageSizeChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.changePageSize(value);
  }
  onPageInputChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.goToPage(value);
  }
  prevPage() {
    this.goToPage(Math.max(1, this.pagination.currentPage - 1));
  }
  nextPage() {
    this.goToPage(
      Math.min(this.pagination.totalPages, this.pagination.currentPage + 1)
    );
  }
  toggleViewMode() {
    this.viewMode = this.viewMode === 'processed' ? 'raw' : 'processed';
    const el = this.el;
    if (el) {
      try {
        el.setAttribute('mode', 'minimal');
      } catch (_err) {
        /* noop */ void 0;
      }
      const st = el.getState?.();
      if (st) this.state = st as MinimalState;
      this.syncPagination();
      this.syncFilterFields();
    }
  }
}
