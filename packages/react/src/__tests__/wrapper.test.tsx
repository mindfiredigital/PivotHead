import React, { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import { PivotHead, type PivotHeadRef, type PivotHeadProps } from '../index';

// Stub the web component module so it doesn't require real browser APIs
vi.mock('@mindfiredigital/pivothead-web-component', () => {
  class PivotHeadElement extends HTMLElement {
    static observedAttributes = ['data','options','filters','pagination','mode'];
    _data: unknown[] = [];
    _options: Record<string, unknown> = {};
    _filters: unknown[] = [];
    _pagination = { currentPage: 1, pageSize: 10, totalPages: 1 };
    _viewMode: 'raw'|'processed' = 'processed';

    set data(v: unknown[]) { this._data = v; }
    get data() { return this._data; }
    set options(v: Record<string, unknown>) { this._options = v; }
    get options() { return this._options; }
    set filters(v: unknown[]) { this._filters = v; }
    get filters() { return this._filters; }
    set pagination(v: Partial<typeof this._pagination>) { this._pagination = { ...this._pagination, ...v }; }
    get pagination() { return this._pagination; }

    // Bridge attribute -> property for JSON-encoded attributes used by the React wrapper
    attributeChangedCallback(name: string, _oldV: string | null, newV: string | null) {
      if (newV == null) return;
      try {
        if (name === 'mode') {
          // keep attribute as-is for mode
          this.setAttribute('mode', newV);
          return;
        }
        const parsed = JSON.parse(newV);
        switch (name) {
          case 'data': this.data = parsed; break;
          case 'options': this.options = parsed; break;
          case 'filters': this.filters = parsed; break;
          case 'pagination': this.pagination = parsed; break;
          default: break;
        }
      } catch {
        // ignore parse errors in tests
      }
    }

    getState() { return { data: this._data, processedData: {}, rawData: this._data }; }
    refresh() {/* noop */}
    sort() {/* noop */}
    setMeasures() {/* noop */}
    setDimensions() {/* noop */}
    setGroupConfig() {/* noop */}
    getFilters() { return this._filters; }
    getPagination() { return this._pagination; }
    getData() { return this._data; }
    getProcessedData() { return {}; }
    getGroupedData() { return []; }
    previousPage() { this._pagination.currentPage = Math.max(1, this._pagination.currentPage - 1); this.emit('paginationChange', this._pagination); }
    nextPage() { this._pagination.currentPage = this._pagination.currentPage + 1; this.emit('paginationChange', this._pagination); }
    setPageSize(s: number) { this._pagination.pageSize = s; this.emit('paginationChange', this._pagination); }
    goToPage(p: number) { this._pagination.currentPage = p; this.emit('paginationChange', this._pagination); }
    setViewMode(m: 'raw'|'processed') { this._viewMode = m; this.emit('viewModeChange', { mode: m }); }
    getViewMode() { return this._viewMode; }
    exportToHTML() {/* noop */}
    exportToPDF() {/* noop */}
    exportToExcel() {/* noop */}
    openPrintDialog() {/* noop */}

    emit(name: string, detail: unknown) {
      this.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }
  if (!customElements.get('pivot-head')) {
    customElements.define('pivot-head', PivotHeadElement);
  }
  return {};
});

type TestEl = HTMLElement & { data?: unknown[]; options?: Record<string, unknown>; nextPage?: () => void };

describe('PivotHead React wrapper', () => {
  const data = [{ a: 1 }, { a: 2 }];
  const options: PivotHeadProps['options'] = { rows: [{ uniqueName: 'a', caption: 'A' }], pageSize: 10 };

  it('renders the custom element and passes properties', () => {
    const { container } = render(<PivotHead data={data} options={options} />);
    const el = container.querySelector('pivot-head') as TestEl | null;
    expect(el).not.toBeNull();
    if (!el) return;
    expect(el.data).toEqual(data);
    expect(el.options).toEqual(options);
  });

  it('forwards ref and exposes methods', () => {
    const ref = createRef<PivotHeadRef>();
    render(<PivotHead ref={ref} data={data} options={options} />);
    expect(Boolean(ref.current)).toBe(true);
    const methods = ref.current?.methods;
    expect(typeof methods?.getState).toBe('function');
    if (methods?.setViewMode) methods.setViewMode('raw');
    expect(methods?.getViewMode && methods.getViewMode()).toBe('raw');
    if (methods?.setPageSize) methods.setPageSize(25);
  });

  it('forwards events such as paginationChange', () => {
    const onPaginationChange = vi.fn();
    const ref = createRef<PivotHeadRef>();
    render(<PivotHead ref={ref} data={data} options={options} onPaginationChange={onPaginationChange} />);
    const el = ref.current?.el as TestEl | undefined;
    el?.nextPage?.();
    expect(onPaginationChange).toHaveBeenCalledTimes(2); // one on mount, one from nextPage
    const last = onPaginationChange.mock.calls.at(-1)?.[0] as CustomEvent<{ currentPage: number }>;
    expect(last.detail.currentPage).toBe(2);
  });

  it('renders slots for minimal mode', () => {
    const { container } = render(
      <PivotHead
        data={data}
        options={options}
        mode="minimal"
        headerSlot={<div id="hdr">H</div>}
        bodySlot={<div id="body">B</div>}
      />
    );
    const el = container.querySelector('pivot-head');
    const children = el ? (Array.from(el.children) as HTMLElement[]) : [];
    const header = children.find((n) => n.getAttribute('slot') === 'header');
    const body = children.find((n) => n.getAttribute('slot') === 'body');
    expect(Boolean(header)).toBe(true);
    expect(Boolean(body)).toBe(true);
  });
});
