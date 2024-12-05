// src/hooks/usePivotTable.ts
import { useState, useCallback } from "react";
import { PivotEngine } from "@pivothead/core";
function usePivotTable(config) {
  const [engine] = useState(() => new PivotEngine(config));
  const [state, setState] = useState(() => engine.getState());
  const sort = useCallback((field, direction) => {
    engine.sort(field, direction);
    setState(engine.getState());
  }, [engine]);
  const reset = useCallback(() => {
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
import { jsx, jsxs } from "react/jsx-runtime";
function PivotTable({
  data,
  columns,
  className,
  onRowClick,
  onCellClick
}) {
  const { state, actions } = usePivotTable({ data, columns });
  return /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsxs("table", { children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((column) => {
      var _a;
      return /* @__PURE__ */ jsxs(
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
    /* @__PURE__ */ jsx("tbody", { children: state.data.map((row, index) => /* @__PURE__ */ jsx("tr", { onClick: () => onRowClick == null ? void 0 : onRowClick(row), children: columns.map((column) => /* @__PURE__ */ jsx(
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
export {
  PivotTable,
  usePivotTable
};
