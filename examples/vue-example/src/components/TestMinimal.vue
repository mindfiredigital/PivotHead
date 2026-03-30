<template>
  <div>
    <h3>Test Minimal Mode</h3>
    <PivotHead
      ref="pivotRef"
      mode="minimal"
      :data="data"
      :options="options"
      @state-change="handleStateChange"
      @view-mode-change="handleViewModeChange"
      @pagination-change="handlePaginationChange"
    >
      <template #header>
        <div style="padding: 10px; background: #f0f0f0;">
          <h4>Custom Header</h4>
          <p>Data records: {{ data.length }}</p>
          <p>Has state: {{ !!pivotState }}</p>
          <p>State detail: {{ pivotState ? 'YES' : 'NO' }}</p>
        </div>
      </template>
      
      <template #body>
        <div style="padding: 10px;">
          <h4>Custom Body</h4>
          <div v-if="!pivotState">
            <p>Waiting for pivot state...</p>
          </div>
          <div v-else>
            <p>✅ State received!</p>
            <p>Rows: {{ pivotState.rows?.length || 0 }}</p>
            <p>Columns: {{ pivotState.columns?.length || 0 }}</p>
            <p>Measures: {{ pivotState.measures?.length || 0 }}</p>
            <p>Data length: {{ pivotState.data?.length || 0 }}</p>
          </div>
        </div>
      </template>
    </PivotHead>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue'
import { PivotHead } from '@mindfiredigital/pivothead-vue'
import { logger } from '../logger'

export default defineComponent({
  name: 'TestMinimal',
  components: {
    PivotHead
  },
  props: {
    data: {
      type: Array as () => Array<Record<string, unknown>>,
      required: true
    },
    options: {
      type: Object as () => Record<string, unknown>,
      required: true
    }
  },
  setup(props) {
    const pivotRef = ref()
    const pivotState = ref(null)

    const handleStateChange = (e: any) => {
      logger.info('TestMinimal - State change event:', e)
      logger.info('TestMinimal - Event detail:', e.detail)
      pivotState.value = e.detail || e
    }

    const handleViewModeChange = (e: any) => {
      logger.info('TestMinimal - View mode change:', e)
    }

    const handlePaginationChange = (e: any) => {
      logger.info('TestMinimal - Pagination change:', e)
    }

    onMounted(async () => {
      logger.info('TestMinimal mounted')
      logger.info('Props data:', props.data)
      logger.info('Props options:', props.options)
      
      await nextTick()
      
      // Try to get initial state
      setTimeout(() => {
        if (pivotRef.value) {
          logger.info('PivotRef available:', pivotRef.value)
          const state = pivotRef.value.getState?.()
          logger.info('Initial state:', state)
          if (state) {
            pivotState.value = state
          }
        }
      }, 500)
    })

    return {
      pivotRef,
      pivotState,
      handleStateChange,
      handleViewModeChange,
      handlePaginationChange
    }
  }
})
</script>
</template>

<parameter name="content">
