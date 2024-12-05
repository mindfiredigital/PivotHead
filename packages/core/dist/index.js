"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  PivotEngine: () => PivotEngine
});
module.exports = __toCommonJS(src_exports);

// src/engine/sorter.ts
function applySort(data, sortConfig) {
  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    if (aValue < bValue)
      return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue)
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
}

// src/engine/dataProcessor.ts
function processData(config, sortConfig = null) {
  let processedData = [...config.data];
  if (sortConfig) {
    processedData = applySort(processedData, sortConfig);
  }
  return processedData;
}

// src/engine/pivotEngine.ts
var PivotEngine = class {
  constructor(config) {
    this.config = config;
    this.state = {
      data: processData(config),
      sortConfig: null
    };
  }
  sort(field, direction) {
    this.state.sortConfig = { field, direction };
    this.applySort();
  }
  applySort() {
    this.state.data = processData(this.config, this.state.sortConfig);
  }
  getState() {
    return __spreadValues({}, this.state);
  }
  reset() {
    this.state.sortConfig = null;
    this.state.data = processData(this.config);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PivotEngine
});
