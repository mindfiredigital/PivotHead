<template>
  <div>
    <div v-if="!pivotState">
      <p>Loading pivot state...</p>
    </div>
    <div v-else-if="!rowField || !colField || measures.length === 0">
      <p>Waiting for pivot configuration...</p>
      <div style="font-size: 12px; color: #666; margin-top: 8px;">
        Debug: rowField={{ !!rowField }}, colField={{ !!colField }}, measures={{ measures.length }}
      </div>
    </div>
    <div v-else-if="pageRows.length === 0">
      <p>No data found matching the current filters.</p>
      <div style="font-size: 12px; color: #666; margin-top: 8px;">
        Groups: {{ groups.length }}, UniqueRows: {{ uniqueRows.length }}, CurrentPage: {{ pagination.currentPage }}
      </div>
    </div>
    <table v-else style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="padding: 8px; background: #f4f7fa; border-bottom: 1px solid #e2e7ed; text-align: left;">
            {{ rowField?.caption }} / {{ colField?.caption }}
          </th>
          <th
            v-for="(col, i) in colOrder"
            :key="col"
            :colspan="measures.length"
            draggable="true"
            @dragstart="(e) => handleColDragStart(e, i)"
            @dragover.prevent
            @dragenter.prevent
            @drop="(e) => handleColDrop(e, i)"
            style="padding: 8px; background: #f4f7fa; border-bottom: 1px solid #e2e7ed; text-align: center; cursor: move;"
          >
            {{ col }}
          </th>
        </tr>
        <tr>
          <th 
            @click="() => $emit('toggleSort', rowField?.uniqueName)"
            style="padding: 8px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; cursor: pointer; text-align: left;"
          >
            {{ rowField?.caption }}{{ rowSortClass }}
          </th>
          <template v-for="col in colOrder" :key="col">
            <th
              v-for="measure in measures"
              :key="`${col}-${measure.uniqueName}`"
              @click="() => $emit('toggleSort', measure.uniqueName, col, true)"
              style="padding: 8px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; border-right: 1px solid #dee2e6; text-align: left; cursor: pointer;"
            >
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>{{ measure.caption }}</span>
                <span v-if="currentStore.sort.field === measure.uniqueName" style="margin-left: 5px;">
                  {{ currentStore.sort.dir === 'asc' ? '▲' : '▼' }}
                </span>
              </div>
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(rowVal, rIdx) in pageRows"
          :key="rowVal"
          draggable="true"
          @dragstart="(e) => handleRowDragStart(e, rIdx)"
          @dragover.prevent
          @dragenter.prevent
          @drop="(e) => handleRowDrop(e, rIdx, pageRows)"
          style="cursor: move;"
        >
          <td style="font-weight: bold; padding: 8px; border-bottom: 1px solid #dee2e6;">
            {{ rowVal }}
          </td>
          <template v-for="colVal in colOrder" :key="colVal">
            <td
              v-for="measure in measures"
              :key="`${rowVal}-${colVal}-${measure.uniqueName}`"
              @click="() => handleCellClick(rowVal, colVal, measure)"
              :title="getCellValue(rowVal, colVal, measure) > 0 ? 'Click to view underlying records' : ''"
              :style="{
                padding: '8px',
                borderBottom: '1px solid #eee',
                borderRight: '1px solid #f0f0f0',
                cursor: getCellValue(rowVal, colVal, measure) > 0 ? 'pointer' : 'default',
                textAlign: getTextAlignment(measure.uniqueName)
              }"
            >
              {{ formatCellValue(rowVal, colVal, measure) }}
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineOptions } from 'vue'

defineOptions({
  name: 'ProcessedTable'
})

// Types
interface AxisField { uniqueName: string; caption: string }
interface MeasureField { uniqueName: string; caption: string; aggregation: string }
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
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggleSort: [field: string, columnValue?: string, isMeasureHeader?: boolean]
  colDragStart: [index: number]
  colDrop: [index: number]
  rowDragStart: [index: number]
  rowDrop: [toIndex: number, visibleLabels: string[]]
  openDrillDown: [
    rowField: string,
    rowValue: string,
    colField: string,
    colValue: string,
    measureName: string,
    measureCaption: string,
    measureAgg: string,
    cellAgg: number
  ]
  updateStore: [updater: (store: UiStore) => UiStore]
}>()

// Computed properties
const rowField = computed(() => {
  let result = props.pivotState?.rows?.[0]
  
  // Fallback: if state doesn't have rows config, try to get it from the pivot ref
  if (!result && props.pivotRef) {
    const fullState = props.pivotRef?.getState?.()
    result = fullState?.rows?.[0]
  }
  
  console.log('ProcessedTable rowField:', result, 'from state:', !!props.pivotState)
  return result
})
const colField = computed(() => {
  let result = props.pivotState?.columns?.[0]
  
  // Fallback: if state doesn't have columns config, try to get it from the pivot ref
  if (!result && props.pivotRef) {
    const fullState = props.pivotRef?.getState?.()
    result = fullState?.columns?.[0]
  }
  
  console.log('ProcessedTable colField:', result)
  return result
})
const measures = computed(() => {
  let result = props.pivotState?.measures || []
  
  // Fallback: if state doesn't have measures config, try to get it from the pivot ref
  if ((!result || result.length === 0) && props.pivotRef) {
    const fullState = props.pivotRef?.getState?.()
    result = fullState?.measures || []
  }
  
  console.log('ProcessedTable measures:', result.length, result)
  return result
})

const groups = computed(() => {
  // First try to use the groups from the state (which should be filtered)
  let result = props.pivotState?.groups || []
  
  // If no groups in state, fallback to getGroupedData from pivot ref
  if (!result || result.length === 0) {
    result = (props.pivotRef?.getGroupedData?.() || []) as Array<{ 
      key?: string; 
      aggregates?: Record<string, number> 
    }>
  }
  
  console.log('ProcessedTable groups:', result.length, result)
  console.log('ProcessedTable using groups from:', props.pivotState?.groups ? 'state' : 'pivotRef')
  return result
})

const uniqueCols = computed(() => {
  const unique = Array.from(new Set(groups.value.map(g => {
    const key = g?.key ?? ''
    const parts = String(key).split('|')
    return (parts[1] || parts[0] || '') as string
  }))).filter(Boolean) as string[]
  return unique
})

const colOrder = computed(() => 
  (props.currentStore.colOrder.length ? props.currentStore.colOrder : uniqueCols.value)
    .filter(c => uniqueCols.value.includes(c))
)

const pageRows = computed(() => {
  const start = (props.pagination.currentPage - 1) * props.pagination.pageSize
  const end = start + props.pagination.pageSize
  const result = uniqueRows.value.slice(start, end)
  console.log('ProcessedTable pageRows:', result.length, 'from uniqueRows:', uniqueRows.value.length)
  return result
})

const uniqueRows = computed(() => {
  const allRowSet = new Set<string>()
  groups.value.forEach(g => {
    const parts = String(g?.key ?? '').split('|')
    if (parts[0]) allRowSet.add(parts[0])
  })
  
  let rows: string[] = Array.from(allRowSet)
  if (props.currentStore.rowOrder.length) {
    rows = props.currentStore.rowOrder.filter(v => rows.includes(v))
  }
  return rows
})

const rowSortClass = computed(() => 
  props.currentStore.sort.field === rowField.value?.uniqueName 
    ? ` sorted-${props.currentStore.sort.dir}` 
    : ''
)

// Methods
const toNum = (v: unknown): number => {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

const getCellValue = (rowVal: string, colVal: string, measure: MeasureField): number => {
  const grp = groups.value.find((g) => {
    const key = g?.key ?? ''
    const parts = String(key).split('|')
    return parts[0] === rowVal && (parts[1] || parts[0]) === colVal
  })
  
  const aggKey = `${measure.aggregation}_${measure.uniqueName}`
  return toNum((grp?.aggregates || {})[aggKey])
}

const formatCellValue = (rowVal: string, colVal: string, measure: MeasureField): string => {
  const val = getCellValue(rowVal, colVal, measure)
  
  if (!Number.isFinite(val)) {
    return String(val ?? '0')
  }
  
  // Use the web component's formatValue method if available
  const formatted = props.pivotRef?.formatValue?.(val, measure.uniqueName)
  return formatted || val.toLocaleString()
}

const getTextAlignment = (fieldName: string): 'left' | 'right' | 'center' => {
  // Get text alignment from the web component
  return (props.pivotRef?.getFieldAlignment?.(fieldName) || 'right') as 'left' | 'right' | 'center'
}

const handleCellClick = (rowVal: string, colVal: string, measure: MeasureField) => {
  const val = getCellValue(rowVal, colVal, measure)
  const hasData = Number(val) > 0
  
  if (hasData && rowField.value && colField.value) {
    emit('openDrillDown',
      rowField.value.uniqueName,
      String(rowVal),
      colField.value.uniqueName,
      String(colVal),
      measure.uniqueName,
      measure.caption,
      measure.aggregation,
      val
    )
  }
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

const handleRowDrop = (e: DragEvent, index: number, visibleLabels: string[]) => {
  e.preventDefault()
  emit('rowDrop', index, visibleLabels)
}
</script>
