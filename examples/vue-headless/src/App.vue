<template>
  <div class="app">
    <h1>Vue Headless Example</h1>
    <p>This example demonstrates PivotHead in headless mode (none mode) with the exact same functionality as minimal mode.</p>
    
    <!-- Headless PivotHead Component -->
    <HeadlessPivot :data="salesData" :options="pivotOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
// @ts-ignore
import HeadlessPivot from './components/HeadlessPivot.vue'

// Pivot configuration matching minimal mode
const pivotOptions = reactive({
  rows: [{ uniqueName: 'Region', caption: 'Region' }],
  columns: [{ uniqueName: 'Product', caption: 'Product' }],
  measures: [
    { 
      uniqueName: 'Sales', 
      caption: 'Total Sales', 
      aggregation: 'sum' 
    }
  ]
})

// Extended sample sales data matching vue-example structure
const salesData = ref([
  { Region: 'North', Product: 'Laptop', Sales: 1200, Quarter: 'Q1', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Phone', Sales: 800, Quarter: 'Q1', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Tablet', Sales: 600, Quarter: 'Q1', Manager: 'John Smith', Store: 'Store B' },
  { Region: 'South', Product: 'Laptop', Sales: 900, Quarter: 'Q1', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Phone', Sales: 1100, Quarter: 'Q1', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Tablet', Sales: 750, Quarter: 'Q1', Manager: 'Sarah Johnson', Store: 'Store D' },
  { Region: 'East', Product: 'Laptop', Sales: 1500, Quarter: 'Q1', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Phone', Sales: 700, Quarter: 'Q1', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Tablet', Sales: 850, Quarter: 'Q1', Manager: 'Mike Chen', Store: 'Store F' },
  { Region: 'West', Product: 'Laptop', Sales: 1000, Quarter: 'Q1', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Phone', Sales: 950, Quarter: 'Q1', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Tablet', Sales: 650, Quarter: 'Q1', Manager: 'Lisa Wong', Store: 'Store H' },
  
  { Region: 'North', Product: 'Laptop', Sales: 1400, Quarter: 'Q2', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Phone', Sales: 850, Quarter: 'Q2', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Tablet', Sales: 700, Quarter: 'Q2', Manager: 'John Smith', Store: 'Store B' },
  { Region: 'South', Product: 'Laptop', Sales: 950, Quarter: 'Q2', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Phone', Sales: 1200, Quarter: 'Q2', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Tablet', Sales: 800, Quarter: 'Q2', Manager: 'Sarah Johnson', Store: 'Store D' },
  { Region: 'East', Product: 'Laptop', Sales: 1600, Quarter: 'Q2', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Phone', Sales: 750, Quarter: 'Q2', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Tablet', Sales: 900, Quarter: 'Q2', Manager: 'Mike Chen', Store: 'Store F' },
  { Region: 'West', Product: 'Laptop', Sales: 1100, Quarter: 'Q2', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Phone', Sales: 1000, Quarter: 'Q2', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Tablet', Sales: 700, Quarter: 'Q2', Manager: 'Lisa Wong', Store: 'Store H' },
  
  { Region: 'North', Product: 'Laptop', Sales: 1300, Quarter: 'Q3', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Phone', Sales: 900, Quarter: 'Q3', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Tablet', Sales: 750, Quarter: 'Q3', Manager: 'John Smith', Store: 'Store B' },
  { Region: 'South', Product: 'Laptop', Sales: 1000, Quarter: 'Q3', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Phone', Sales: 1300, Quarter: 'Q3', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Tablet', Sales: 850, Quarter: 'Q3', Manager: 'Sarah Johnson', Store: 'Store D' },
  { Region: 'East', Product: 'Laptop', Sales: 1700, Quarter: 'Q3', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Phone', Sales: 800, Quarter: 'Q3', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Tablet', Sales: 950, Quarter: 'Q3', Manager: 'Mike Chen', Store: 'Store F' },
  { Region: 'West', Product: 'Laptop', Sales: 1200, Quarter: 'Q3', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Phone', Sales: 1050, Quarter: 'Q3', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Tablet', Sales: 750, Quarter: 'Q3', Manager: 'Lisa Wong', Store: 'Store H' },
  
  { Region: 'North', Product: 'Laptop', Sales: 1350, Quarter: 'Q4', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Phone', Sales: 950, Quarter: 'Q4', Manager: 'John Smith', Store: 'Store A' },
  { Region: 'North', Product: 'Tablet', Sales: 800, Quarter: 'Q4', Manager: 'John Smith', Store: 'Store B' },
  { Region: 'South', Product: 'Laptop', Sales: 1050, Quarter: 'Q4', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Phone', Sales: 1350, Quarter: 'Q4', Manager: 'Sarah Johnson', Store: 'Store C' },
  { Region: 'South', Product: 'Tablet', Sales: 900, Quarter: 'Q4', Manager: 'Sarah Johnson', Store: 'Store D' },
  { Region: 'East', Product: 'Laptop', Sales: 1750, Quarter: 'Q4', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Phone', Sales: 850, Quarter: 'Q4', Manager: 'Mike Chen', Store: 'Store E' },
  { Region: 'East', Product: 'Tablet', Sales: 1000, Quarter: 'Q4', Manager: 'Mike Chen', Store: 'Store F' },
  { Region: 'West', Product: 'Laptop', Sales: 1250, Quarter: 'Q4', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Phone', Sales: 1100, Quarter: 'Q4', Manager: 'Lisa Wong', Store: 'Store G' },
  { Region: 'West', Product: 'Tablet', Sales: 800, Quarter: 'Q4', Manager: 'Lisa Wong', Store: 'Store H' }
])
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

p {
  color: #7f8c8d;
  margin-bottom: 30px;
}
</style>
