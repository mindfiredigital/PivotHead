"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var src_exports = {};
__export(src_exports, {
  PivotTable: () => PivotTable,
  usePivotTable: () => usePivotTable
});
module.exports = __toCommonJS(src_exports);

// src/components/PivotTable.tsx
var import_react2 = require("react");

// src/hooks/usePivotTable.ts
var import_react = require("react");
var import_core = require("@pivothead/core");
function usePivotTable(config) {
  const engine = (0, import_react.useMemo)(() => new import_core.PivotEngine(config), [config]);
  const [state, setState] = (0, import_react.useState)(() => engine.getState());
  const updateState = (0, import_react.useCallback)(() => {
    setState(engine.getState());
  }, [engine]);
  const toggleExpand = (0, import_react.useCallback)((rowId) => {
    updateState();
  }, [engine, updateState]);
  const sort = (0, import_react.useCallback)((field, direction) => {
    engine.sort(field, direction);
    updateState();
  }, [engine, updateState]);
  return {
    state,
    actions: {
      toggleExpand,
      sort
    }
  };
}

// src/components/PivotTable.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function PivotTable({
  data,
  dimensions,
  measures,
  plugins,
  className,
  onRowClick,
  onCellClick
}) {
  const { state, actions } = usePivotTable({
    data,
    dimensions,
    measures,
    plugins
  });
  const [sortConfig, setSortConfig] = (0, import_react2.useState)(null);
  const sortedRows = (0, import_react2.useMemo)(() => {
    if (!sortConfig)
      return state.rows;
    return [...state.rows].sort((a, b) => {
      const aValue = a.dimensions[sortConfig.field] || a.measures[sortConfig.field];
      const bValue = b.dimensions[sortConfig.field] || b.measures[sortConfig.field];
      if (aValue < bValue)
        return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue)
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [state.rows, sortConfig]);
  const handleSort = (field) => {
    setSortConfig((prevConfig) => {
      if ((prevConfig == null ? void 0 : prevConfig.field) === field) {
        return { field, direction: prevConfig.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  };
  const renderedRows = (0, import_react2.useMemo)(() => {
    return sortedRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "tr",
      {
        onClick: () => onRowClick == null ? void 0 : onRowClick(row),
        className: "hover:bg-muted/50",
        children: [
          dimensions.map((dim) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "td",
            {
              className: "p-2 border",
              style: { paddingLeft: `${row.level * 1.5}rem` },
              children: row.dimensions[dim.field]
            },
            dim.field
          )),
          measures.map((measure) => {
            var _a, _b;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "td",
              {
                className: "p-2 border text-right",
                onClick: (e) => {
                  e.stopPropagation();
                  onCellClick == null ? void 0 : onCellClick(row, measure.field);
                },
                children: (_b = (_a = measure.formatter) == null ? void 0 : _a.call(measure, row.measures[measure.field])) != null ? _b : row.measures[measure.field]
              },
              measure.field
            );
          })
        ]
      },
      row.id
    ));
  }, [sortedRows, dimensions, measures, onRowClick, onCellClick]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `overflow-auto ${className != null ? className : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "w-full border-collapse border", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
      dimensions.map((dim) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "th",
        {
          className: "p-2 border bg-muted text-left cursor-pointer",
          onClick: () => handleSort(dim.field),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
            dim.field,
            (sortConfig == null ? void 0 : sortConfig.field) === dim.field && (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")
          ] })
        },
        dim.field
      )),
      measures.map((measure) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "th",
        {
          className: "p-2 border bg-muted text-right cursor-pointer",
          onClick: () => handleSort(measure.field),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-end", children: [
            measure.field,
            (sortConfig == null ? void 0 : sortConfig.field) === measure.field && (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")
          ] })
        },
        measure.field
      ))
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: renderedRows })
  ] }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PivotTable,
  usePivotTable
});
