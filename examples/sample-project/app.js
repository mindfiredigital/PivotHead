import '/packages/web-component/dist/pivot-head.mjs';
import { config } from './config/config.js ';

const sampleData = [
  { id: 1, region: 'North', product: 'A', sales: 100, quantity: 10 },
  { id: 2, region: 'South', product: 'B', sales: 150, quantity: 15 },
  { id: 3, region: 'North', product: 'A', sales: 200, quantity: 20 },
  { id: 4, region: 'South', product: 'C', sales: 250, quantity: 25 },
  { id: 5, region: 'East', product: 'B', sales: 300, quantity: 30 },
  { id: 6, region: 'East', product: 'A', sales: 350, quantity: 35 },
  { id: 7, region: 'West', product: 'C', sales: 400, quantity: 40 },
  { id: 8, region: 'North', product: 'B', sales: 450, quantity: 45 },
  { id: 9, region: 'South', product: 'A', sales: 500, quantity: 50 },
  { id: 10, region: 'West', product: 'B', sales: 550, quantity: 55 },
];

const rawViewOptions = {
  rows: [
    { uniqueName: 'region', caption: 'Region' },
    { uniqueName: 'product', caption: 'Product' },
  ],
  measures: [
    { uniqueName: 'id', caption: 'Records', aggregation: 'count' },
    {
      uniqueName: 'sales',
      caption: 'Individual Sales',
      aggregation: items => items.map(i => i.sales).join(', '),
    },
  ],
  dimensions: [],
  defaultAggregation: 'sum',
};

const processedViewOptions = {
  rows: [
    { uniqueName: 'region', caption: 'Region' },
    { uniqueName: 'product', caption: 'Product' },
  ],
  measures: [
    { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
    { uniqueName: 'sales', caption: 'Avg Sales', aggregation: 'avg' },
    { uniqueName: 'quantity', caption: 'Total Qty', aggregation: 'sum' },
  ],
  dimensions: [],
  defaultAggregation: 'sum',
};

let switchCount = 0;

function updateView(isRaw) {
  const rawBtn = document.getElementById('raw-data-btn');
  const processedBtn = document.getElementById('processed-data-btn');
  const currentViewMode = document.getElementById('current-view-mode');
  const pivotTableTitle = document.getElementById('pivot-table-title');
  const switchCountEl = document.getElementById('switch-count');
  const pivotHeadElement = document.getElementById('pivot-table-container');

  if (isRaw) {
    rawBtn.classList.add('active');
    processedBtn.classList.remove('active');
    currentViewMode.textContent = 'Raw Data';
    pivotTableTitle.textContent = 'Raw Data Pivot';
    pivotHeadElement.data = sampleData;
    pivotHeadElement.options = rawViewOptions;
  } else {
    rawBtn.classList.remove('active');
    processedBtn.classList.add('active');
    currentViewMode.textContent = 'Processed Data';
    pivotTableTitle.textContent = 'Processed Data Pivot';
    pivotHeadElement.data = sampleData;
    pivotHeadElement.options = processedViewOptions;
  }

  switchCount++;
  switchCountEl.textContent = switchCount;
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('raw-data-btn')
    .addEventListener('click', () => updateView(true));
  document
    .getElementById('processed-data-btn')
    .addEventListener('click', () => updateView(false));

  // Initial render
  updateView(true);
});
