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

// src/hooks/usePivotTable.ts
var import_react = require("react");
var import_core = require("@pivothead/core");
function usePivotTable(config) {
  const [engine] = (0, import_react.useState)(() => new import_core.PivotEngine(config));
  const [state, setState] = (0, import_react.useState)(() => engine.getState());
  const sort = (0, import_react.useCallback)((field, direction) => {
    engine.sort(field, direction);
    setState(engine.getState());
  }, [engine]);
  const reset = (0, import_react.useCallback)(() => {
    engine.reset();
    setState(engine.getState());
  }, [engine]);
  return {
    state,
    actions: {
      sort,
      reset
    }
  };
}

// src/components/PivotTable.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function PivotTable({
  data,
  columns,
  className,
  onRowClick,
  onCellClick
}) {
  const { state, actions } = usePivotTable({ data, columns });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((column) => {
      var _a;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "th",
        {
          onClick: () => {
            var _a2;
            return actions.sort(
              column.field,
              ((_a2 = state.sortConfig) == null ? void 0 : _a2.direction) === "asc" ? "desc" : "asc"
            );
          },
          children: [
            column.label,
            ((_a = state.sortConfig) == null ? void 0 : _a.field) === column.field && (state.sortConfig.direction === "asc" ? " \u25B2" : " \u25BC")
          ]
        },
        column.field
      );
    }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: state.data.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { onClick: () => onRowClick == null ? void 0 : onRowClick(row), children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "td",
      {
        onClick: (e) => {
          e.stopPropagation();
          onCellClick == null ? void 0 : onCellClick(row, column.field);
        },
        children: row[column.field]
      },
      column.field
    )) }, index)) })
  ] }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PivotTable,
  usePivotTable
});
