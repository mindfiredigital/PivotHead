<template>
  <div v-if="!pivotState || !rawData || rawData.length === 0">
    <p>{{ !pivotState ? 'Loading pivot state...' : 'No raw data available.' }}</p>
    <div v-if="pivotState" style="font-size: 12px; color: #666; margin-top: 8px;">
      Debug: rawData={{ rawData?.length || 0 }} rows
    </div>
  </div>
  <table v-else style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th
          v-for="(key, i) in colOrder"
          :key="key"
          draggable="true"
          @dragstart="(e) => handleColDragStart(e, i)"
          @dragover.prevent
          @dragenter.prevent
          @drop="(e) => handleColDrop(e, i)"
          @click="() => $emit('toggleSort', key)"
          style="padding: 8px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; border-right: 1px solid #dee2e6; cursor: pointer;"
        >
          {{ key }} {{ getSortIcon(key) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, rIdx) in pageRows"
        :key="globalIndex(rIdx)"
        draggable="true"
        @dragstart="(e) => handleRowDragStart(e, globalIndex(rIdx))"
        @dragover.prevent
        @dragenter.prevent
        @drop="(e) => handleRowDrop(e, globalIndex(rIdx))"
        style="cursor: move;"
      >
        <td
          v-for="key in colOrder"
          :key="String(key)"
          :style="{
            padding: '8px',
            borderBottom: '1px solid #eee',
            borderRight: '1px solid #f0f0f0',
            textAlign: getTextAlignment(key)
          }"
        >
          {{ formatCellValue(row[key], key) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed, defineOptions } from 'vue'

defineOptions({
  name: 'RawTable'
})

// Types
interface UiStore { 
  colOrder: string[]
  rowOrder: string[]
  sort: { field: string | null; dir: 'asc' | 'desc' } 
}

interface Props {
  pivotState: any
  currentStore: UiStore
  pagination: { currentPage: number; pageSize: number }
  pivotRef: any
  isDragging: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggleSort: [field: string]
  colDragStart: [index: number]
  colDrop: [index: number]
  rowDragStart: [index: number]
  rowDrop: [index: number]
  updateStore: [updater: (store: UiStore) => UiStore]
}>()

// Computed properties
const rawData = computed(() => {
  // Use Vue wrapper's exposed methods to get filtered data
  const rows = (props.pivotState?.rawData || 
               props.pivotState?.data || 
               props.pivotRef?.getFilteredData?.() || []) as Array<Record<string, unknown>>
  return rows
})

const keys = computed(() => 
  rawData.value.length ? Object.keys(rawData.value[0]) : []
)

const colOrder = computed(() => 
  (props.currentStore.colOrder.length ? props.currentStore.colOrder : keys.value)
    .filter(k => keys.value.includes(k))
)

const viewRows = computed(() => {
  if (!rawData.value.length) return []
  
  let rows = [...rawData.value]
  
  // Apply sorting only when not dragging to avoid conflicts
  if (!props.isDragging) {
    // Sort view
    const sort = props.currentStore.sort
    if (sort.field) {
      rows.sort((a, b) => {
        const av = a[sort.field as keyof typeof a]
        const bv = b[sort.field as keyof typeof b]
        
        if (typeof av === 'number' && typeof bv === 'number') {
          return sort.dir === 'asc' ? av - bv : (bv as number) - (av as number)
        }
        
        const as = String(av ?? '')
        const bs = String(bv ?? '')
        return sort.dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
      })
    }
  }

  // Apply custom row ordering only when no sorting is active
  if (props.currentStore.rowOrder.length && !props.currentStore.sort.field) {
    // Create a map of original indices to rows
    const indexedRows = rows.map((row, index) => ({ row, originalIndex: index }))
    
    // Sort by the row order (which contains indices)
    const orderedRows = []
    const usedIndices = new Set()
    
    // First, add rows in the specified order
    for (const orderIndex of props.currentStore.rowOrder) {
      const targetIndex = parseInt(orderIndex, 10)
      if (!isNaN(targetIndex) && targetIndex < indexedRows.length) {
        orderedRows.push(indexedRows[targetIndex].row)
        usedIndices.add(targetIndex)
      }
    }
    
    // Then add any remaining rows that weren't in the order
    for (let i = 0; i < indexedRows.length; i++) {
      if (!usedIndices.has(i)) {
        orderedRows.push(indexedRows[i].row)
      }
    }
    
    rows = orderedRows
  }
  
  return rows
})

const pageRows = computed(() => {
  const start = (props.pagination.currentPage - 1) * props.pagination.pageSize
  const end = start + props.pagination.pageSize
  return viewRows.value.slice(start, end)
})

// Methods
const getSortIcon = (key: string): string => {
  const active = props.currentStore.sort.field === key
  return active ? (props.currentStore.sort.dir === 'asc' ? ' ▲' : ' ▼') : ''
}

const globalIndex = (rIdx: number): number => {
  const start = (props.pagination.currentPage - 1) * props.pagination.pageSize
  return start + rIdx
}

const formatCellValue = (cellValue: unknown, key: string): string => {
  const value = cellValue ?? ''
  
  // Use the Vue wrapper's formatValue method if available
  const formatted = props.pivotRef?.formatValue?.(value, key)
  return formatted || String(value)
}

const getTextAlignment = (key: string): 'left' | 'right' | 'center' => {
  // Get text alignment from the Vue wrapper
  return (props.pivotRef?.getFieldAlignment?.(key) || 'left') as 'left' | 'right' | 'center'
}

// Drag and drop handlers
const handleColDragStart = (e: DragEvent, index: number) => {
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', String(index))
  emit('colDragStart', index)
}

const handleColDrop = (e: DragEvent, index: number) => {
  e.preventDefault()
  emit('colDrop', index)
}

const handleRowDragStart = (e: DragEvent, index: number) => {
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', String(index))
  emit('rowDragStart', index)
}

const handleRowDrop = (e: DragEvent, index: number) => {
  e.preventDefault()
  emit('rowDrop', index)
}
</script>
