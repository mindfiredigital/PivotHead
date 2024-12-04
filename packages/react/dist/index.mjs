// src/components/PivotTable.tsx
import { useMemo as useMemo2, useState as useState2 } from "react";

// src/hooks/usePivotTable.ts
import { useCallback, useState, useMemo } from "react";
import { PivotEngine } from "@pivothead/core";
function usePivotTable(config) {
  const engine = useMemo(() => new PivotEngine(config), [config]);
  const [state, setState] = useState(() => engine.getState());
  const updateState = useCallback(() => {
    setState(engine.getState());
  }, [engine]);
  const toggleExpand = useCallback((rowId) => {
    updateState();
  }, [engine, updateState]);
  const sort = useCallback((field, direction) => {
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
import { jsx, jsxs } from "react/jsx-runtime";
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
  const [sortConfig, setSortConfig] = useState2(null);
  const sortedRows = useMemo2(() => {
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
  const renderedRows = useMemo2(() => {
    return sortedRows.map((row) => /* @__PURE__ */ jsxs(
      "tr",
      {
        onClick: () => onRowClick == null ? void 0 : onRowClick(row),
        className: "hover:bg-muted/50",
        children: [
          dimensions.map((dim) => /* @__PURE__ */ jsx(
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
            return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsx("div", { className: `overflow-auto ${className != null ? className : ""}`, children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse border", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      dimensions.map((dim) => /* @__PURE__ */ jsx(
        "th",
        {
          className: "p-2 border bg-muted text-left cursor-pointer",
          onClick: () => handleSort(dim.field),
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            dim.field,
            (sortConfig == null ? void 0 : sortConfig.field) === dim.field && (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")
          ] })
        },
        dim.field
      )),
      measures.map((measure) => /* @__PURE__ */ jsx(
        "th",
        {
          className: "p-2 border bg-muted text-right cursor-pointer",
          onClick: () => handleSort(measure.field),
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end", children: [
            measure.field,
            (sortConfig == null ? void 0 : sortConfig.field) === measure.field && (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")
          ] })
        },
        measure.field
      ))
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: renderedRows })
  ] }) });
}
export {
  PivotTable,
  usePivotTable
};
