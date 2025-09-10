<template>
  <div class="headless-pivot">
    <!-- Hidden PivotHead component in none mode for headless functionality -->
    <PivotHead
      ref="pivotRef"
      mode="none"
      :data="data"
      :options="options"
      :filters="filters"
      @state-change="handleStateChange"
      @view-mode-change="handleViewMode"
      @pagination-change="handlePaginationChange"
      style="display: none;"
    />

    <!-- Custom header with all minimal mode controls -->
    <div class="grid-header">
      <div class="toolbar" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <label>Field</label>
        <select v-model="filterField">
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <select v-model="filterOperator">
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
          <option value="greaterThan">Greater Than</option>
          <option value="lessThan">Less Than</option>
        </select>
        <input 
          type="text" 
          v-model="filterValue" 
          placeholder="Value" 
        />
        <button @click="applyFilter">Apply</button>
        <button @click="resetFilter">Reset</button>

        <button @click="toggleViewMode">
          {{ viewMode === 'processed' ? 'Switch to Raw' : 'Switch to Processed' }}
        </button>

        <!-- Format and Export actions -->
        <div style="display: flex; gap: 6px; align-items: center;">
          <button title="Format cells" @click="handleFormat">Format</button>
          <button title="Export current view as HTML" @click="exportToHTML">Export HTML</button>
          <button title="Export current view as Excel" @click="exportToExcel">Export Excel</button>
          <button title="Export current view as PDF" @click="exportToPDF">Export PDF</button>
          <button title="Print current view" @click="openPrintDialog">Print</button>
        </div>

        <span style="margin-left: auto;" />
        <label>Page Size</label>
        <select :value="String(pagination.pageSize)" @change="changePageSize">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <button @click="previousPage">Prev</button>
        <label>Page</label>
        <input 
          type="number" 
          :min="1" 
          :max="pagination.totalPages" 
          v-model="pageInput" 
          style="width: 64px;" 
        />
        <button @click="goToPageInput">Go</button>
        <span>of {{ pagination.totalPages }}</span>
        <button @click="nextPage">Next</button>
      </div>
    </div>

    <!-- Custom body with processed and raw tables -->
    <div class="grid-body">
      <ProcessedTable 
        v-if="viewMode === 'processed'"
        :pivot-state="pivotState"
        :current-store="processedStore"
        :pagination="pagination"
        :pivot-ref="pivotRef"
        @toggle-sort="toggleSort"
        @col-drag-start="handleColDragStart"
        @col-drop="handleColDrop"
        @row-drag-start="handleRowDragStart"
        @row-drop="handleRowDropProcessed"
        @open-drill-down="openDrillDown"
        @update-store="setProcessedStore"
      />
      <RawTable 
        v-else
        :pivot-state="pivotState"
        :current-store="rawStore"
        :pagination="pagination"
        :pivot-ref="pivotRef"
        :is-dragging="isDragging"
        @toggle-sort="toggleSort"
        @col-drag-start="handleColDragStart"
        @col-drop="handleColDrop"
        @row-drag-start="handleRowDragStart"
        @row-drop="handleRowDropRaw"
        @update-store="setRawStore"
      />
      
      <!-- Drill-down modal -->
      <DrillDownModal 
        :open="modal.open"
        :title="modal.title"
        :summary="modal.summary"
        :rows="modal.rows"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick, defineOptions } from 'vue'
import PivotHead from '@mindfiredigital/pivothead-vue'
// @ts-ignore
import ProcessedTable from './ProcessedTable.vue'
// @ts-ignore
import RawTable from './RawTable.vue'
// @ts-ignore
import DrillDownModal from './DrillDownModal.vue'

defineOptions({
  name: 'HeadlessPivot'
})

// Props
interface Props {
  data: Array<Record<string, unknown>>
  options?: Record<string, unknown>
}

const props = defineProps<Props>()

// Types
type SortDir = 'asc' | 'desc'
interface SortState { 
  field: string | null
  dir: SortDir 
}
interface UiStore { 
  colOrder: string[]
  rowOrder: string[]
  sort: SortState 
}
interface DndState { 
  type: 'row' | 'col' | null
  fromIndex: number 
}

interface AxisField { uniqueName: string; caption: string }
interface MeasureField { uniqueName: string; caption: string; aggregation: string }
interface MinimalProcessedData { rows: unknown[][] }
interface MinimalState {
  rows?: AxisField[]
  columns?: AxisField[]
  measures?: MeasureField[]
  processedData?: MinimalProcessedData
  rawData?: Array<Record<string, unknown>>
  data?: Array<Record<string, unknown>>
}

// Refs
const pivotRef = ref<any>(null)

// Reactive state
const viewMode = ref<'processed' | 'raw'>('processed')
const filters = ref<Array<Record<string, unknown>>>([])
const pivotState = ref<any>(null)
const pagination = reactive({ currentPage: 1, totalPages: 1, pageSize: 10 })
const pageInput = ref('1')

// UI stores for each mode
const processedStore = reactive<UiStore>({ 
  colOrder: [], 
  rowOrder: [], 
  sort: { field: null, dir: 'asc' } 
})
const rawStore = reactive<UiStore>({ 
  colOrder: [], 
  rowOrder: [], 
  sort: { field: null, dir: 'asc' } 
})

// DnD state
const dnd = reactive<DndState>({ type: null, fromIndex: -1 })
const isDragging = ref(false)

// Filter controls
const filterField = ref('')
const filterOperator = ref<'equals' | 'contains' | 'greaterThan' | 'lessThan'>('equals')
const filterValue = ref('')
const filterOptions = ref<Array<{ value: string; label: string }>>([])

// Modal state
const modal = reactive({
  open: false,
  title: '',
  summary: '',
  rows: [] as Array<Record<string, unknown>>
})

// Force re-render when formatting changes
const formatVersion = ref(0)

// Default options for the pivot
const options = computed(() => props.options || {
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

// Computed
const currentStore = computed(() => 
  viewMode.value === 'processed' ? processedStore : rawStore
)

// Watch page input sync
watch(() => pagination.currentPage, (newPage) => {
  pageInput.value = String(newPage)
})

// Watch for filter field options based on pivot state
watch([pivotState, viewMode], () => {
  const st = pivotState.value as MinimalState | null
  if (!st) return
  
  const opts: Array<{ value: string; label: string }> = []
  
  if (viewMode.value === 'processed') {
    st.rows?.forEach((r) => opts.push({ value: r.uniqueName, label: r.caption }))
    st.columns?.forEach((c) => opts.push({ value: c.uniqueName, label: c.caption }))
    st.measures?.forEach((m) => opts.push({ 
      value: `${m.aggregation}_${m.uniqueName}`, 
      label: m.caption 
    }))
  } else {
    const rows = (st.rawData || st.data || []) as Array<Record<string, unknown>>
    const keys = rows.length ? Object.keys(rows[0]) : []
    keys.forEach(k => opts.push({ value: k, label: k }))
  }
  
  filterOptions.value = opts
  if (opts.length && !opts.find(o => o.value === filterField.value)) {
    filterField.value = opts[0].value
  }
})

// Initialize column order when data/state changes
watch([pivotState, viewMode], async () => {
  if (!pivotRef.value) return
  
  await nextTick()
  
  const st = pivotRef.value.getState?.()
  if (!st) return
  
  if (viewMode.value === 'processed') {
    const groups = (pivotRef.value.getGroupedData?.() || []) as Array<{ key?: string }>
    const uniqueCols = Array.from(new Set(groups.map(g => {
      const key = g?.key ?? ''
      const parts = String(key).split('|')
      return parts[1] || parts[0] || ''
    }))).filter(Boolean) as string[]
    
    if (uniqueCols.length && processedStore.colOrder.length === 0) {
      processedStore.colOrder = [...uniqueCols]
    }
  } else {
    const rows = (pivotRef.value.getFilteredData?.() || st.rawData || st.data || []) as Array<Record<string, unknown>>
    const keys = rows.length ? Object.keys(rows[0]) : []
    
    if (keys.length && rawStore.colOrder.length === 0) {
      rawStore.colOrder = [...keys]
    }
  }
})

// Methods
const getPagination = () => pivotRef.value?.getPagination?.()

const syncPagination = () => {
  const p = getPagination()
  if (p) {
    pagination.currentPage = p.currentPage
    pagination.totalPages = p.totalPages
    pagination.pageSize = p.pageSize
  }
}

const setProcessedStore = (updater: (store: UiStore) => UiStore) => {
  const updated = updater(processedStore)
  Object.assign(processedStore, updated)
}

const setRawStore = (updater: (store: UiStore) => UiStore) => {
  const updated = updater(rawStore)
  Object.assign(rawStore, updated)
}

// Event handlers
const handleStateChange = (stateData: any) => {
  if (isDragging.value) {
    return
  }
  
  if (stateData) {
    // Use nextTick to ensure the state is properly updated
    nextTick(() => {
      pivotState.value = stateData
      syncPagination()
    })
  }
}

const handleViewMode = (data?: { mode: 'raw' | 'processed' }) => {
  // Prevent view mode changes during drag operations
  if (isDragging.value) {
    return
  }
  
  // Only change mode if explicitly requested and different from current
  if (data && data.mode && data.mode !== viewMode.value) {
    viewMode.value = data.mode
  }
  
  const st = pivotRef.value?.getState?.()
  if (st) {
    pivotState.value = st
    syncPagination()
  }
}

const handlePaginationChange = (paginationData: any) => {
  Object.assign(pagination, paginationData)
}

// Toolbar actions
const applyFilter = () => {
  if (!filterField.value || !filterOperator.value) return
  
  const next = [
    { field: filterField.value, operator: filterOperator.value, value: filterValue.value }
  ]
  filters.value = next
  pivotRef.value?.goToPage(1)
}

const resetFilter = () => {
  filters.value = []
  filterValue.value = ''
  
  // Clear filters directly on the web component
  if (pivotRef.value) {
    try {
      pivotRef.value.filters = []
    } catch (error) {
      // Ignore errors when setting filters
    }
  }
  
  // Reset to page 1
  pivotRef.value?.goToPage(1)
  
  // Wait for the filter changes to take effect and refresh state
  setTimeout(() => {
    const st = pivotRef.value?.getState?.()
    if (st) {
      pivotState.value = st
      syncPagination()
    }
  }, 200) // Slightly longer delay to ensure filters are processed
}

const toggleViewMode = () => {
  const newMode = viewMode.value === 'processed' ? 'raw' : 'processed'
  
  if (pivotRef.value && pivotRef.value.setViewMode) {
    pivotRef.value.setViewMode(newMode)
    viewMode.value = newMode
    
    // Manually refresh the state after mode change
    setTimeout(() => {
      const st = pivotRef.value?.getState?.()
      if (st) {
        pivotState.value = st
        syncPagination()
      }
    }, 100)
  }
}

const changePageSize = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const size = Number(target.value)
  if (!Number.isFinite(size) || size <= 0) return
  pivotRef.value?.setPageSize(size)
}

const goToPageInput = () => {
  const total = Math.max(1, Number(pagination.totalPages) || 1)
  let n = Number(pageInput.value)
  if (!Number.isFinite(n)) n = pagination.currentPage
  n = Math.max(1, Math.min(total, Math.trunc(n)))
  pivotRef.value?.goToPage(n)
}

const previousPage = () => {
  pivotRef.value?.previousPage()
}

const nextPage = () => {
  pivotRef.value?.nextPage()
}

// Format and export actions
const handleFormat = () => {
  pivotRef.value?.showFormatPopup?.()
  // Force re-render after a short delay to pick up format changes
  setTimeout(() => formatVersion.value++, 500)
}

const exportToHTML = () => {
  pivotRef.value?.exportToHTML?.('pivot-export.html')
}

const exportToExcel = () => {
  pivotRef.value?.exportToExcel?.('pivot-export.xlsx')
}

const exportToPDF = () => {
  pivotRef.value?.exportToPDF?.('pivot-export.pdf')
}

const openPrintDialog = () => {
  pivotRef.value?.openPrintDialog?.()
}

// Sorting
const toggleSort = (field: string, columnValue?: string, isMeasureHeader?: boolean) => {
  // Determine next direction from local UI state
  const prev = currentStore.value.sort
  const nextDir: SortDir = prev.field === field ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc'

  // Update local sort state and clear custom row order (sorting takes precedence over drag order)
  const setCurrentStore = viewMode.value === 'processed' ? setProcessedStore : setRawStore
  setCurrentStore(s => ({ 
    ...s, 
    sort: { field, dir: nextDir },
    rowOrder: [] // Clear custom row order when sorting is applied
  }))

  // Raw mode: just update local state
  if (viewMode.value === 'raw') {
    return
  }

  // Processed mode: compute local row order
  try {
    const st = pivotState.value as MinimalState | null
    const rowFieldName = st?.rows?.[0]?.uniqueName || ''

    if (isMeasureHeader && columnValue) {
      // Sorting by a measure under a specific column
      const measures = (st?.measures || []) as Array<{ uniqueName: string; aggregation?: string }>
      const cfg = measures.find(m => m.uniqueName === field)
      const aggregation = (cfg?.aggregation || 'sum') as string
      const aggKey = `${aggregation}_${field}`
      const groups = (pivotRef.value?.getGroupedData?.() || []) as Array<{ 
        key?: string; 
        aggregates?: Record<string, number> 
      }>

      // Build the set of all row labels across all groups
      const allRowSet = new Set<string>()
      groups.forEach(g => {
        const parts = (g?.key || '').split('|')
        if (parts[0]) allRowSet.add(parts[0])
      })
      const allRows = Array.from(allRowSet)

      // Create [row, value] pairs for the chosen column
      const pairs = allRows.map(rv => {
        const grp = groups.find(gr => {
          const parts = (gr?.key || '').split('|')
          return parts[0] === rv && parts[1] === columnValue
        })
        const val = Number((grp?.aggregates || {})[aggKey] ?? 0)
        return { row: rv, val: Number.isFinite(val) ? val : 0 }
      })

      pairs.sort((a, b) => (nextDir === 'asc' ? a.val - b.val : b.val - a.val))
      const orderedRows = pairs.map(p => p.row)
      
      if (rowFieldName && orderedRows.length > 0) {
        setProcessedStore(su => ({ ...su, rowOrder: orderedRows }))
      }
    } else if (rowFieldName && field === rowFieldName) {
      // Sorting by the row dimension header: alphabetical ordering
      const groups = (pivotRef.value?.getGroupedData?.() || []) as Array<{ key?: string }>
      const rowSet = new Set<string>()
      groups.forEach(g => {
        const parts = (g?.key || '').split('|')
        if (parts[0]) rowSet.add(parts[0])
      })
      const rows = Array.from(rowSet)
      rows.sort((a, b) => (nextDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
      
      if (rows.length > 0) {
        setProcessedStore(su => ({ ...su, rowOrder: rows }))
      }
    }
  } catch (err) {
    console.warn('Failed to compute local row order for processed sort:', err)
  }
}

// Helper to read currently visible columns
const getVisibleColumns = (): string[] => {
  const st = pivotState.value as MinimalState | null
  if (!st) return []
  
  if (viewMode.value === 'processed') {
    const groups = (pivotRef.value?.getGroupedData?.() || []) as Array<{ key?: string }>
    const unique = Array.from(new Set(groups.map(g => {
      const key = g?.key ?? ''
      const parts = String(key).split('|')
      return parts[1] || parts[0] || ''
    })))
    return unique.filter(Boolean) as string[]
  } else {
    const rows = (st.rawData || st.data || []) as Array<Record<string, unknown>>
    return rows.length ? Object.keys(rows[0]) : []
  }
}

// Column DnD
const handleColDragStart = (index: number) => {
  dnd.type = 'col'
  dnd.fromIndex = index
}

const handleColDrop = (toIndex: number) => {
  if (dnd.type !== 'col') return
  
  const from = dnd.fromIndex
  const to = toIndex
  
  // Only call engine swapColumns in processed mode, not in raw mode
  // In raw mode, the engine swapColumns interferes with minimal mode and switches to default table
  if (viewMode.value === 'processed') {
    try { 
      pivotRef.value?.swapColumns?.(from, to) 
    } catch (err) { 
      console.warn('swapColumns failed', err) 
    }
  }
  
  // Handle column reordering locally in our state
  const setCurrentStore = viewMode.value === 'processed' ? setProcessedStore : setRawStore
  setCurrentStore(s => {
    const arr = [...(s.colOrder.length ? s.colOrder : [])]
    if (arr.length === 0) arr.push(...getVisibleColumns())
    if (arr.length === 0) return s
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return s
    
    const tmp = arr[from]
    arr[from] = arr[to]
    arr[to] = tmp
    return { ...s, colOrder: arr }
  })
  
  // Reset drag state
  dnd.type = null
  dnd.fromIndex = -1
  
  // Use timeout to ensure state changes are properly handled
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// Row DnD
const handleRowDragStart = (index: number) => {
  isDragging.value = true
  dnd.type = 'row'
  dnd.fromIndex = index
}

const handleRowDropProcessed = (toIndex: number, visibleLabels: string[]) => {
  if (dnd.type !== 'row') return
  
  setProcessedStore(s => {
    const order = s.rowOrder.length ? [...s.rowOrder] : [...visibleLabels]
    const from = dnd.fromIndex
    const to = toIndex
    
    if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return s
    
    const tmp = order[from]
    order[from] = order[to]
    order[to] = tmp
    
    return { ...s, rowOrder: order }
  })
  
  dnd.type = null
  dnd.fromIndex = -1
  
  // Use timeout to ensure state changes are properly handled
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

const handleRowDropRaw = (toIndex: number) => {
  if (dnd.type !== 'row') return
  
  const swapRows = pivotRef.value?.swapRows
  
  // In raw mode, handle row reordering purely through local state
  // The engine's swapRows method interferes with minimal mode and causes mode switching
  setRawStore(s => {
    const from = dnd.fromIndex
    const to = toIndex
    
    // Get current row order or initialize from data
    let rowOrder = s.rowOrder.length ? [...s.rowOrder] : []
    
    // If no existing order, create one from current data using row indices as unique identifiers
    if (rowOrder.length === 0 && pivotState.value?.rawData?.length) {
      // Instead of using field values which can be duplicated, use row indices for uniqueness
      rowOrder = pivotState.value.rawData.map((_, index) => String(index))
    }
    
    // Validate indices are within bounds
    if (rowOrder.length > 0 && from >= 0 && to >= 0 && from < rowOrder.length && to < rowOrder.length && from !== to) {
      const tmp = rowOrder[from]
      rowOrder[from] = rowOrder[to]
      rowOrder[to] = tmp
    }
    
    return { ...s, rowOrder }
  })
  
  dnd.type = null
  dnd.fromIndex = -1
  
  // Use timeout to ensure state changes are properly handled
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// Drill-down
const openDrillDown = (
  rowField: string,
  rowValue: string,
  colField: string,
  colValue: string,
  measureName: string,
  measureCaption: string,
  measureAgg: string,
  cellAgg: number
) => {
  const st = pivotState.value as MinimalState | null
  const raw = ((st?.rawData || st?.data || []) as Array<Record<string, unknown>>)
  
  const subset = raw.filter(r => 
    String(r[rowField] ?? '') === String(rowValue) && 
    String(r[colField] ?? '') === String(colValue)
  )
  
  let computed = 0
  if (subset.length && measureName) {
    const nums = subset.map(r => {
      const n = Number(r[measureName] ?? 0)
      return Number.isFinite(n) ? n : 0
    })
    
    if (measureAgg === 'avg') computed = nums.reduce((a, b) => a + b, 0) / nums.length
    else if (measureAgg === 'max') computed = nums.length ? Math.max(...nums) : 0
    else if (measureAgg === 'min') computed = nums.length ? Math.min(...nums) : 0
    else if (measureAgg === 'count') computed = subset.length
    else computed = nums.reduce((a, b) => a + b, 0)
  }
  
  const aggDisplay = (Number.isFinite(cellAgg) && cellAgg !== 0 ? cellAgg : computed).toLocaleString()
  
  modal.open = true
  modal.title = `${rowField}: ${rowValue}${colField ? `, ${colField}: ${colValue}` : ''}`
  modal.summary = `Records: ${subset.length}. ${measureCaption} (${measureAgg}) = ${aggDisplay}`
  modal.rows = subset
}

const closeModal = () => {
  modal.open = false
}

// Mount: set initial view and bootstrap state
onMounted(async () => {
  // Wait for the component to be fully mounted
  await nextTick()
  
  if (pivotRef.value) {
    // Set processed by default
    pivotRef.value?.setViewMode('processed')
    
    // Wait for the web component to initialize with a longer timeout and retry logic
    let retries = 0
    const maxRetries = 10
    
    const checkState = () => {
      const st = pivotRef.value?.getState?.()
      if (st && st.rows && st.measures) {
        pivotState.value = st
        syncPagination()
      } else {
        retries++
        if (retries < maxRetries) {
          setTimeout(checkState, 200)
        }
      }
    }
    
    setTimeout(checkState, 200)
  }
})
</script>

<style scoped>
.grid-header {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.grid-body {
  padding: 16px;
}
</style>
