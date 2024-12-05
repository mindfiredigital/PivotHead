import { PivotTable } from '@pivothead/react'
import type { Column } from '@pivothead/core'

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

const columns: Column[] = [
  { field: 'date', label: 'Date' },
  { field: 'product', label: 'Product' },
  { field: 'region', label: 'Region' },
  { field: 'sales', label: 'Sales' },
  { field: 'quantity', label: 'Quantity' }
]

function App() {
  const handleRowClick = (row: SalesData) => {
    console.log('Row clicked:', row)
  }

  const handleCellClick = (row: SalesData, field: string) => {
    console.log('Cell clicked:', field, row)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pivot Table React Wrapper Test</h1>
      
      <PivotTable
        data={data}
        columns={columns}
        className="w-full border border-gray-300 rounded-lg overflow-hidden"
        onRowClick={handleRowClick}
        onCellClick={handleCellClick}
      />
    </div>
  )
}

export default App


