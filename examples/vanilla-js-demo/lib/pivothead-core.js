(function (l, c) {
  typeof exports == 'object' && typeof module < 'u'
    ? c(exports)
    : typeof define == 'function' && define.amd
    ? define(['exports'], c)
    : ((l = typeof globalThis < 'u' ? globalThis : l || self),
      c((l.PivotheadCore = {})));
})(this, function (l) {
  'use strict';
  function c(n, t, s) {
    if (!n || n.length === 0) return 0;
    const e = n.map((i) => Number(i[t]) || 0);
    switch (s) {
      case 'sum':
        return e.reduce((i, a) => i + a, 0);
      case 'avg':
        return e.reduce((i, a) => i + a, 0) / e.length;
      case 'min':
        return Math.min(...e);
      case 'max':
        return Math.max(...e);
      case 'count':
        return e.length;
      default:
        return 0;
    }
  }
  function m(n, t, s) {
    return !t || t.length === 0
      ? n
      : [...n].sort((e, i) => {
          for (const a of t) {
            const { field: r, direction: o, type: u, aggregation: D } = a;
            if (u === 'measure') {
              const g = p(e, r),
                h = p(i, r);
              if (g !== h) return o === 'asc' ? g - h : h - g;
            } else {
              const g = e[r],
                h = i[r];
              if (g !== h)
                return o === 'asc' ? (g < h ? -1 : 1) : g > h ? -1 : 1;
            }
          }
          return 0;
        });
  }
  function p(n, t, s) {
    return Number(n[t]) || 0;
  }
  function f(n, t = null, s = null) {
    let e = [...n.data];
    t && (e = m(e, [t]));
    let i = [];
    if (s) {
      const { rowFields: a, columnFields: r, grouper: o } = s,
        u = [...a, ...r];
      i = d(e, u, o);
    }
    return { data: e, groups: i };
  }
  function d(n, t, s) {
    if (!t || t.length === 0)
      return [{ key: 'All', items: n, subgroups: [], aggregates: {} }];
    const e = {};
    return (
      n.forEach((i) => {
        const a = s(i, t);
        e[a] || (e[a] = { key: a, items: [], subgroups: [], aggregates: {} }),
          e[a].items.push(i);
      }),
      t.length > 1 &&
        Object.values(e).forEach((i) => {
          i.subgroups = d(i.items, t.slice(1), s);
        }),
      Object.values(e)
    );
  }
  class w {
    constructor(t) {
      (this.config = {
        ...t,
        defaultAggregation: t.defaultAggregation || 'sum',
        isResponsive: t.isResponsive ?? !0,
      }),
        (this.state = {
          data: t.data || [],
          processedData: { headers: [], rows: [], totals: {} },
          rows: t.rows || [],
          columns: t.columns || [],
          measures: t.measures || [],
          sortConfig: [],
          rowSizes: this.initializeRowSizes(t.data || []),
          expandedRows: {},
          groupConfig: t.groupConfig || null,
          groups: [],
          selectedMeasures: t.measures || [],
          selectedDimensions: t.dimensions || [],
          selectedAggregation: this.config.defaultAggregation,
          formatting: t.formatting || {},
          columnWidths: {},
          isResponsive: this.config.isResponsive ?? !0,
          rowGroups: [],
          columnGroups: [],
        }),
        this.loadData();
    }
    async loadData() {
      if (this.config.dataSource) {
        const { type: t, url: s, file: e } = this.config.dataSource;
        t === 'remote' && s
          ? (this.state.data = await this.fetchRemoteData(s))
          : t === 'file' && e
          ? (this.state.data = await this.readFileData(e))
          : console.error('Invalid data source configuration');
      } else this.config.data && (this.state.data = this.config.data);
      (this.state.rowSizes = this.initializeRowSizes(this.state.data)),
        (this.state.processedData = this.processData(this.state.data)),
        this.state.groupConfig && this.applyGrouping();
    }
    async fetchRemoteData(t) {
      try {
        const s = await fetch(t);
        if (!s.ok) throw new Error(`Failed to fetch data from ${t}`);
        return await s.json();
      } catch (s) {
        return console.error('Error fetching remote data:', s), [];
      }
    }
    async readFileData(t) {
      return new Promise((s, e) => {
        const i = new FileReader();
        (i.onload = (a) => {
          var r;
          try {
            const o = JSON.parse((r = a.target) == null ? void 0 : r.result);
            s(o);
          } catch (o) {
            e(o);
          }
        }),
          (i.onerror = (a) => e(a)),
          i.readAsText(t);
      });
    }
    initializeRowSizes(t) {
      return t.map((s, e) => ({ index: e, height: 40 }));
    }
    processData(t) {
      return {
        headers: this.generateHeaders(),
        rows: this.generateRows(t),
        totals: this.calculateTotals(t),
      };
    }
    generateHeaders() {
      const t = this.state.rows
          ? this.state.rows.map((e) => e.caption || e.uniqueName)
          : [],
        s = this.state.columns
          ? this.state.columns.map((e) => e.caption || e.uniqueName)
          : [];
      return [...t, ...s];
    }
    generateRows(t) {
      return !t || !this.state.rows || !this.state.columns
        ? []
        : t.map((s) => [
            ...this.state.rows.map((e) => s[e.uniqueName]),
            ...this.state.columns.map((e) => s[e.uniqueName]),
            ...this.state.measures.map((e) => this.calculateMeasureValue(s, e)),
          ]);
    }
    calculateMeasureValue(t, s) {
      return s.formula && typeof s.formula == 'function'
        ? s.formula(t)
        : t[s.uniqueName] || 0;
    }
    calculateTotals(t) {
      const s = {};
      return (
        this.state.measures.forEach((e) => {
          const { uniqueName: i, aggregation: a } = e;
          let r = 0;
          a === 'sum'
            ? (r = t.reduce((o, u) => o + (u[i] || 0), 0))
            : a === 'avg'
            ? (r = t.reduce((o, u) => o + (u[i] || 0), 0) / t.length)
            : a === 'max'
            ? (r = Math.max(...t.map((o) => o[i] || 0)))
            : a === 'min'
            ? (r = Math.min(...t.map((o) => o[i] || 0)))
            : a === 'count' && (r = t.length),
            (s[i] = r);
        }),
        s
      );
    }
    setMeasures(t) {
      (this.state.selectedMeasures = t),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
    setDimensions(t) {
      (this.state.selectedDimensions = t),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
    setAggregation(t) {
      (this.state.selectedAggregation = t),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates(),
        this.updateAggregates();
    }
    formatValue(t, s) {
      const e = this.state.formatting[s];
      if (!e) return String(t);
      try {
        switch (e.type) {
          case 'currency':
            return new Intl.NumberFormat(e.locale || 'en-US', {
              style: 'currency',
              currency: e.currency || 'USD',
              minimumFractionDigits: e.decimals || 0,
              maximumFractionDigits: e.decimals || 0,
            }).format(t);
          case 'number':
            return new Intl.NumberFormat(e.locale || 'en-US', {
              minimumFractionDigits: e.decimals || 0,
              maximumFractionDigits: e.decimals || 0,
            }).format(t);
          case 'percentage':
            return new Intl.NumberFormat(e.locale || 'en-US', {
              style: 'percent',
              minimumFractionDigits: e.decimals || 0,
            }).format(t);
          case 'date':
            return new Date(t).toLocaleDateString(e.locale || 'en-US', {
              dateStyle: 'medium',
            });
          default:
            return String(t);
        }
      } catch (i) {
        return (
          console.error(`Error formatting value for field ${s}:`, i), String(t)
        );
      }
    }
    sort(t, s) {
      const e = this.state.measures.find((a) => a.uniqueName === t),
        i = {
          field: t,
          direction: s,
          type: e ? 'measure' : 'dimension',
          aggregation: e == null ? void 0 : e.aggregation,
        };
      (this.state.sortConfig = [i]), this.applySort();
    }
    applySort() {
      const t = this.sortData(this.state.data, this.state.sortConfig[0]);
      (this.state.data = t),
        this.state.groups.length > 0 &&
          (this.state.groups = this.sortGroups(
            this.state.groups,
            this.state.sortConfig[0],
          )),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
    sortData(t, s) {
      return [...t].sort((e, i) => {
        const a = this.getFieldValue(e, s),
          r = this.getFieldValue(i, s);
        return a < r
          ? s.direction === 'asc'
            ? -1
            : 1
          : a > r
          ? s.direction === 'asc'
            ? 1
            : -1
          : 0;
      });
    }
    getFieldValue(t, s) {
      if (s.type === 'measure') {
        const e = this.state.measures.find((i) => i.uniqueName === s.field);
        if (e && e.formula) return e.formula(t);
      }
      return t[s.field];
    }
    sortGroups(t, s) {
      return [...t].sort((e, i) => {
        const a = e.aggregates[`${s.aggregation}_${s.field}`] || 0,
          r = i.aggregates[`${s.aggregation}_${s.field}`] || 0;
        return a < r
          ? s.direction === 'asc'
            ? -1
            : 1
          : a > r
          ? s.direction === 'asc'
            ? 1
            : -1
          : 0;
      });
    }
    updateAggregates() {
      const t = (s) => {
        this.state.measures.forEach((e) => {
          const i = `${this.state.selectedAggregation}_${e.uniqueName}`;
          if (e.formula && typeof e.formula == 'function') {
            const a = s.items.map((r) => e.formula(r));
            s.aggregates[i] = c(
              a.map((r) => ({ value: r })),
              'value',
              e.aggregation || this.state.selectedAggregation,
            );
          } else
            s.aggregates[i] = c(
              s.items,
              e.uniqueName,
              e.aggregation || this.state.selectedAggregation,
            );
        }),
          s.subgroups && s.subgroups.forEach(t);
      };
      this.state.groups.forEach(t);
    }
    applyGrouping() {
      if (!this.state.groupConfig) return;
      const {
        rowFields: t,
        columnFields: s,
        grouper: e,
      } = this.state.groupConfig;
      if (!t || !s || !e) {
        console.error('Invalid groupConfig:', this.state.groupConfig);
        return;
      }
      const { data: i, groups: a } = f(
        this.config,
        this.state.sortConfig[0] || null,
        this.state.groupConfig,
      );
      (this.state.data = i),
        (this.state.groups = a),
        this.updateAggregates(),
        (this.state.processedData = this.processData(this.state.data));
    }
    createGroups(t, s, e) {
      if (!s || s.length === 0 || !t)
        return [{ key: 'All', items: t || [], aggregates: {} }];
      const i = {};
      return (
        t.forEach((a) => {
          if (a && e) {
            const r = e(a, s);
            i[r] ||
              (i[r] = { key: r, items: [], subgroups: [], aggregates: {} }),
              i[r].items.push(a);
          }
        }),
        s.length > 1 &&
          Object.values(i).forEach((a) => {
            a &&
              a.items &&
              (a.subgroups = this.createGroups(a.items, s.slice(1), e));
          }),
        Object.values(i).forEach((a) => {
          a &&
            a.items &&
            this.state.measures &&
            this.state.measures.forEach((r) => {
              if (r && r.uniqueName) {
                const o = `${this.state.selectedAggregation}_${r.uniqueName}`;
                a.aggregates[o] = c(
                  a.items,
                  r.uniqueName,
                  this.state.selectedAggregation,
                );
              }
            });
        }),
        Object.values(i)
      );
    }
    setGroupConfig(t) {
      (this.state.groupConfig = t),
        t
          ? this.applyGrouping()
          : ((this.state.groups = []),
            (this.state.processedData = this.processData(this.state.data)));
    }
    getGroupedData() {
      return this.state.groups;
    }
    getState() {
      return { ...this.state };
    }
    reset() {
      (this.state = {
        ...this.state,
        data: this.config.data || [],
        processedData: this.processData(this.config.data || []),
        sortConfig: [],
        rowSizes: this.initializeRowSizes(this.config.data || []),
        expandedRows: {},
        groupConfig: this.config.groupConfig || null,
        groups: [],
      }),
        this.state.groupConfig && this.applyGrouping();
    }
    resizeRow(t, s) {
      const e = this.state.rowSizes.findIndex((i) => i.index === t);
      e !== -1 && (this.state.rowSizes[e].height = Math.max(20, s));
    }
    toggleRowExpansion(t) {
      this.state.expandedRows[t] = !this.state.expandedRows[t];
    }
    isRowExpanded(t) {
      return !!this.state.expandedRows[t];
    }
    dragRow(t, s) {
      if (
        t < 0 ||
        s < 0 ||
        t >= this.state.data.length ||
        s >= this.state.data.length
      ) {
        console.warn('Invalid drag indices');
        return;
      }
      const e = [...this.state.data],
        [i] = e.splice(t, 1);
      e.splice(s, 0, i), (this.state.data = e);
      const a = [...this.state.rowSizes],
        [r] = a.splice(t, 1);
      if (
        (a.splice(s, 0, r),
        (this.state.rowSizes = a.map((o, u) => ({ ...o, index: u }))),
        this.state.groups.length > 0)
      ) {
        const o = [...this.state.groups],
          [u] = o.splice(t, 1);
        o.splice(s, 0, u), (this.state.groups = o);
      }
      (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates(),
        typeof this.config.onRowDragEnd == 'function' &&
          this.config.onRowDragEnd(t, s, this.state.data);
    }
    dragColumn(t, s) {
      if (!this.validateDragOperation(t, s, this.state.columns.length)) {
        console.error(`Invalid column drag operation: from ${t} to ${s}`);
        return;
      }
      try {
        const e = [...this.state.columns],
          [i] = e.splice(t, 1);
        if (
          (e.splice(s, 0, i),
          (this.state.columns = e),
          Object.keys(this.state.columnWidths).length > 0)
        ) {
          const a = {};
          Object.keys(this.state.columnWidths).forEach((r, o) => {
            o === t
              ? (a[e[s].uniqueName] = this.state.columnWidths[r])
              : o === s
              ? (a[e[t].uniqueName] = this.state.columnWidths[r])
              : (a[r] = this.state.columnWidths[r]);
          }),
            (this.state.columnWidths = a);
        }
        if (this.state.columnGroups.length > 0) {
          const a = [...this.state.columnGroups],
            [r] = a.splice(t, 1);
          a.splice(s, 0, r), (this.state.columnGroups = a);
        }
        if (
          ((this.state.processedData = this.processData(this.state.data)),
          this.updateAggregates(),
          typeof this.config.onColumnDragEnd == 'function')
        ) {
          const a = this.state.columns.map((r) => ({
            ...r,
            caption: r.caption || r.uniqueName,
          }));
          this.config.onColumnDragEnd(t, s, a);
        }
      } catch (e) {
        console.error('Error during column drag operation:', e);
      }
    }
    validateDragOperation(t, s, e) {
      return t >= 0 && s >= 0 && t < e && s < e && t !== s;
    }
  }
  (l.PivotEngine = w),
    Object.defineProperty(l, Symbol.toStringTag, { value: 'Module' });
});
