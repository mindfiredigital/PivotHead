import { useState } from 'react'
import { PivotTable } from '@pivothead/react'
import type { DimensionConfig, MeasureConfig } from '@pivothead/core'

interface SalesData {
  date: string
  product: string
  region: string
  sales: number
  quantity: number
}

const data: SalesData[] = [
  { date: '2024-01-01', product: 'Widget A', region: 'North', sales: 1000, quantity: 50 },
  { date: '2024-01-01', product: 'Widget B', region: 'South', sales: 1500, quantity: 75 },
  { date: '2024-01-02', product: 'Widget A', region: 'East', sales: 1200, quantity: 60 },
  { date: '2024-01-02', product: 'Widget C', region: 'West', sales: 800, quantity: 40 },
  { date: '2024-01-03', product: 'Widget B', region: 'North', sales: 1800, quantity: 90 },
  { date: '2024-01-03', product: 'Widget C', region: 'South', sales: 1100, quantity: 55 },
  { date: '2024-01-04', product: 'Widget A', region: 'West', sales: 1300, quantity: 65 },
  { date: '2024-01-04', product: 'Widget B', region: 'East', sales: 1600, quantity: 80 },
]

const dimensions: DimensionConfig[] = [
  { field: 'date', type: 'date' },
  { field: 'product', type: 'string' },
  { field: 'region', type: 'string' }
]

const measures: MeasureConfig[] = [
  {
    field: 'sales',
    aggregationType: 'sum',
    formatter: (value) => `$${value.toLocaleString()}`
  },
  {
    field: 'quantity',
    aggregationType: 'sum'
  }
]

function App() {
  const [selectedDimensions, setSelectedDimensions] = useState(dimensions)
  const [selectedMeasures, setSelectedMeasures] = useState(measures)

  const handleDimensionToggle = (dimension: DimensionConfig) => {
    setSelectedDimensions(prev => 
      prev.some(d => d.field === dimension.field)
        ? prev.filter(d => d.field !== dimension.field)
        : [...prev, dimension]
    )
  }

  const handleMeasureToggle = (measure: MeasureConfig) => {
    setSelectedMeasures(prev => 
      prev.some(m => m.field === measure.field)
        ? prev.filter(m => m.field !== measure.field)
        : [...prev, measure]
    )
  }

  return (
    <div>
      <h1>Pivot Table React Wrapper Test</h1>
      
      <div>
        <h3>Dimensions</h3>
        <div>
          {dimensions.map(dimension => (
            <button
              key={dimension.field}
              onClick={() => handleDimensionToggle(dimension)}
              style={{
                backgroundColor: selectedDimensions.some(d => d.field === dimension.field)
                  ? '#4CAF50'
                  : '#ccc'
              }}
            >
              {dimension.field}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3>Measures</h3>
        <div>
          {measures.map(measure => (
            <button
              key={measure.field}
              onClick={() => handleMeasureToggle(measure)}
              style={{
                backgroundColor: selectedMeasures.some(m => m.field === measure.field)
                  ? '#4CAF50'
                  : '#ccc'
              }}
            >
              {measure.field}
            </button>
          ))}
        </div>
      </div>

      <PivotTable
        data={data}
        dimensions={selectedDimensions}
        measures={selectedMeasures}
        onRowClick={(row) => console.log('Row clicked:', row)}
        onCellClick={(row, field) => console.log('Cell clicked:', field, row)}
      />
    </div>
  )
}

export default App

