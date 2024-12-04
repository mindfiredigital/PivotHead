var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/engine/dataProcessor.ts
function processData(data, dimensions, measures) {
  const processedRows = [];
  const dimensionFields = dimensions.map((d) => d.field);
  const groupedData = groupData(data, dimensionFields);
  processGroup(groupedData, dimensionFields, measures, processedRows);
  return processedRows;
}
function groupData(data, fields) {
  const groupedData = /* @__PURE__ */ new Map();
  for (const item of data) {
    const key = fields.map((field) => item[field]).join("|");
    if (!groupedData.has(key)) {
      groupedData.set(key, []);
    }
    groupedData.get(key).push(item);
  }
  return groupedData;
}
function processGroup(group, dimensions, measures, result, level = 0, parentId = "") {
  for (const [key, items] of group.entries()) {
    const dimensionValues = key.split("|");
    const id = parentId ? `${parentId}-${key}` : key;
    if (level < dimensions.length - 1) {
      const nextGroup = groupData(items, dimensions.slice(level + 1));
      processGroup(nextGroup, dimensions, measures, result, level + 1, id);
    }
  }
}

// src/engine/sorter.ts
function applySort(rows, sortConfig) {
  return [...rows].sort((a, b) => {
    const aValue = getValue(a, sortConfig.field);
    const bValue = getValue(b, sortConfig.field);
    if (aValue < bValue)
      return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue)
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
}
function getValue(row, field) {
  var _a;
  return (_a = row.dimensions[field]) != null ? _a : row.measures[field];
}

// src/engine/pivotEngine.ts
var PivotEngine = class {
  constructor(config) {
    this.config = config;
    this.state = {
      rows: [],
      columns: [],
      expandedNodes: /* @__PURE__ */ new Set(),
      sortConfig: null,
      filterConfig: null
    };
    this.processData();
  }
  processData() {
    this.state.rows = processData(this.config.data, this.config.dimensions, this.config.measures);
    this.applyStateChanges();
  }
  applyStateChanges() {
    if (this.state.sortConfig) {
      this.state.rows = applySort(this.state.rows, this.state.sortConfig);
    }
  }
  sort(field, direction) {
    this.state.sortConfig = { field, direction };
    this.applyStateChanges();
  }
  getState() {
    return __spreadValues({}, this.state);
  }
  reset() {
    this.state.sortConfig = null;
    this.processData();
  }
};
export {
  PivotEngine
};
