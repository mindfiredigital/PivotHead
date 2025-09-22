<template>
  <div>
    <!-- PivotHead with slots for minimal mode -->
    <PivotHead
      ref="pivotRef"
      mode="minimal"
      :data="data"
      :options="options"
      :filters="safeFilters"
      @state-change="handleStateChange"
      @view-mode-change="handleViewModeChange"
      @pagination-change="handlePaginationChange"
    >
      <!-- Header slot with controls -->
      <template #header>
        <div class="toolbar" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 10px; background: #f8f9fa;">
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
          <span style="margin-left: auto;" />
          <span>Page {{ pagination.currentPage }} of {{ pagination.totalPages }}</span>
        </div>
      </template>

      <!-- Body slot with custom table -->
      <template #body>
        <div style="padding: 16px;">
          <!-- Render table based on state -->
          <div v-if="!pivotState">
            <p>Loading pivot state...</p>
          </div>
          <div v-else-if="viewMode === 'processed' && canRenderProcessed">
            <SimpleProcessedTable 
              :pivot-state="pivotState"
              :pivot-ref="pivotRef"
              :pagination="pagination"
            />
          </div>
          <div v-else-if="viewMode === 'raw'">
            <SimpleRawTable 
              :data="rawData"
              :pagination="pagination"
            />
          </div>
          <div v-else>
            <p>Waiting for data configuration...</p>
          </div>
        </div>
      </template>
    </PivotHead>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, nextTick } from 'vue'
import PivotHead from '@mindfiredigital/pivothead-vue'

// Simple processed table component
const SimpleProcessedTable = defineComponent({
  name: 'SimpleProcessedTable',
  props: {
    pivotState: Object,
    pivotRef: Object,
    pagination: Object
  },
  setup(props) {
    const rowField = computed(() => props.pivotState?.rows?.[0])
    const colField = computed(() => props.pivotState?.columns?.[0])
    const measures = computed(() => props.pivotState?.measures || [])
    
    // Use the same approach as React: getGroupedData for columns, processedData for rows
    const groups = computed(() => {
      return (props.pivotRef?.getGroupedData?.() || []) as Array<{ key?: string; aggregates?: Record<string, unknown> }>
    })
    
    const uniqueCols = computed(() => {
      // Use groups like React implementation
      return Array.from(new Set(groups.value.map(g => (g.key ? (g.key.includes('|') ? g.key.split('|')[1] : g.key.split('|')[0]) : '')))).filter(Boolean) as string[]
    })
    
    const uniqueRows = computed(() => {
      // Use processedData like React implementation
      const processedRows = (props.pivotState?.processedData?.rows as unknown[]) || []
      const rowFieldName = rowField.value?.uniqueName
      if (!rowFieldName || processedRows.length === 0) return []
      
      const uniqueRows: string[] = []
      const seen = new Set<string>()
      processedRows.forEach(r => {
        const v = (Array.isArray(r) ? (r as unknown[])[0] : (r as Record<string, unknown>)[rowFieldName]) as unknown
        const sv = String(v ?? '')
        if (!seen.has(sv)) { 
          seen.add(sv)
          uniqueRows.push(sv)
        }
      })
      return uniqueRows
    })
    
    const getCellValue = (rowVal: string, colVal: string, measure: any): number => {
      // Use groups approach like React implementation
      const group = groups.value.find(g => {
        const keys = g.key ? g.key.split('|') : []
        return keys[0] === rowVal && (keys[1] || keys[0]) === colVal
      })
      
      const key = `${measure.aggregation}_${measure.uniqueName}`
      const agg = group?.aggregates?.[key]
      const numAgg = typeof agg === 'number' ? agg : Number(agg) || 0
      return Number.isFinite(numAgg) ? numAgg : 0
    }
    
    return {
      rowField,
      colField,
      measures,
      groups,
      uniqueCols,
      uniqueRows,
      getCellValue
    }
  },
  template: `
    <div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">
              {{ rowField?.caption }} / {{ colField?.caption }}
            </th>
            <th
              v-for="col in uniqueCols"
              :key="col"
              :colspan="measures.length"
              style="padding: 8px; border: 1px solid #ddd; text-align: center;"
            >
              {{ col }}
            </th>
          </tr>
          <tr style="background: #f9f9f9;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">
              {{ rowField?.caption }}
            </th>
            <template v-for="col in uniqueCols" :key="col">
              <th
                v-for="measure in measures"
                :key="col + '-' + measure.uniqueName"
                style="padding: 8px; border: 1px solid #ddd; text-align: left;"
              >
                {{ measure.caption }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rowVal in uniqueRows" :key="rowVal">
            <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">
              {{ rowVal }}
            </td>
            <template v-for="colVal in uniqueCols" :key="colVal">
              <td
                v-for="measure in measures"
                :key="rowVal + '-' + colVal + '-' + measure.uniqueName"
                style="padding: 8px; border: 1px solid #ddd; text-align: right;"
              >
                {{ getCellValue(rowVal, colVal, measure).toLocaleString() }}
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  `
})

// Simple raw table component
const SimpleRawTable = defineComponent({
  name: 'SimpleRawTable',
  props: {
    data: Array,
    pagination: Object
  },
  setup(props) {
    const headers = computed(() => 
      props.data && props.data.length > 0 ? Object.keys(props.data[0]) : []
    )
    
    return {
      headers
    }
  },
  template: `
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th
            v-for="header in headers"
            :key="header"
            style="padding: 8px; border: 1px solid #ddd; text-align: left;"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td
            v-for="header in headers"
            :key="header"
            style="padding: 8px; border: 1px solid #ddd;"
          >
            {{ row[header] }}
          </td>
        </tr>
      </tbody>
    </table>
  `
})

export default defineComponent({
  name: 'FixedMinimalMode',
  components: {
    PivotHead,
    SimpleProcessedTable,
    SimpleRawTable
  },
  props: {
    data: {
      type: Array as () => Array<Record<string, unknown>>,
      required: true
    },
    options: {
      type: Object as () => Record<string, unknown>,
      default: undefined
    }
  },
  setup(props) {
    // Refs
    const pivotRef = ref<any>(null)
    const pivotState = ref<any>(null)
    const viewMode = ref<'processed' | 'raw'>('processed')
    const filters = ref<Array<Record<string, unknown>>>([])
    
    // Computed for safe filter passing (non-reactive)
    const safeFilters = computed(() => {
      const filterArray = filters.value
      return filterArray.length > 0 ? JSON.parse(JSON.stringify(filterArray)) : undefined
    })
    const pagination = ref({ currentPage: 1, totalPages: 1, pageSize: 10 })
    
    // Filter controls
    const filterField = ref('')
    const filterOperator = ref<'equals' | 'contains' | 'greaterThan' | 'lessThan'>('equals')
    const filterValue = ref('')
    const filterOptions = ref<Array<{ value: string; label: string }>>([])
    
    // Computed
    const canRenderProcessed = computed(() => {
      return pivotState.value?.rows?.length > 0 && 
             pivotState.value?.columns?.length > 0 && 
             pivotState.value?.measures?.length > 0
    })
    
    const rawData = computed(() => {
      return pivotRef.value?.getData?.() || 
             pivotState.value?.rawData || 
             pivotState.value?.data || 
             props.data
    })
    
    // Event handlers
    const handleStateChange = (state: any) => {
      console.log('FixedMinimalMode - state change:', state)
      pivotState.value = state
    }
    
    const handleViewModeChange = (data: { mode: 'raw' | 'processed' }) => {
      console.log('FixedMinimalMode - view mode change:', data)
      viewMode.value = data.mode
    }
    
    const handlePaginationChange = (paginationData: any) => {
      console.log('FixedMinimalMode - pagination change:', paginationData)
      Object.assign(pagination.value, paginationData)
    }
    
    // Actions
    const applyFilter = () => {
      if (!filterField.value || !filterOperator.value) return
      
      const newFilter = {
        field: filterField.value, 
        operator: filterOperator.value, 
        value: filterValue.value
      }
      
      filters.value = [newFilter]
      console.log('Applied filter:', newFilter)
    }
    
    const resetFilter = () => {
      filters.value = []
      filterValue.value = ''
      console.log('Reset filters')
    }
    
    const toggleViewMode = () => {
      const newMode = viewMode.value === 'processed' ? 'raw' : 'processed'
      pivotRef.value?.setViewMode(newMode)
    }
    
    // Update filter options when state changes
    watch([pivotState, viewMode], () => {
      const st = pivotState.value
      if (!st) return
      
      const opts: Array<{ value: string; label: string }> = []
      
      if (viewMode.value === 'processed') {
        st.rows?.forEach((r: any) => opts.push({ value: r.uniqueName, label: r.caption }))
        st.columns?.forEach((c: any) => opts.push({ value: c.uniqueName, label: c.caption }))
        st.measures?.forEach((m: any) => opts.push({ 
          value: `${m.aggregation}_${m.uniqueName}`, 
          label: m.caption 
        }))
      } else {
        const rows = (st.rawData || st.data || props.data) as Array<Record<string, unknown>>
        const keys = rows.length ? Object.keys(rows[0]) : []
        keys.forEach(k => opts.push({ value: k, label: k }))
      }
      
      filterOptions.value = opts
      if (opts.length && !opts.find(o => o.value === filterField.value)) {
        filterField.value = opts[0].value
      }
    })
    
    // Mount: initialize
    onMounted(async () => {
      console.log('FixedMinimalMode mounted with data:', props.data.length, 'records')
      console.log('FixedMinimalMode options:', props.options)
      
      await nextTick()
      
      if (pivotRef.value) {
        // Set initial mode
        pivotRef.value?.setViewMode('processed')
        
        // Wait for initialization
        setTimeout(() => {
          const st = pivotRef.value?.getState?.()
          if (st) {
            console.log('Initial state loaded:', st)
            pivotState.value = st
          }
        }, 100)
      }
    })
    
    return {
      pivotRef,
      pivotState,
      viewMode,
      filters,
      safeFilters,
      pagination,
      filterField,
      filterOperator,
      filterValue,
      filterOptions,
      canRenderProcessed,
      rawData,
      handleStateChange,
      handleViewModeChange,
      handlePaginationChange,
      applyFilter,
      resetFilter,
      toggleViewMode
    }
  }
})
</script>

<style scoped>
.toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
</style>
