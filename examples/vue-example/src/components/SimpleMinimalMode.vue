<template>
  <div class="simple-minimal-mode">
    <h3>Simple Minimal Mode Test</h3>
    
    <!-- Raw PivotHead component for testing -->
    <PivotHead
      ref="pivotRef"
      mode="minimal"
      :data="data"
      :options="options"
      @state-change="handleStateChange"
      class="pivot-container"
    >
      <template #header>
        <div style="padding: 10px; background: #f0f0f0;">
          <h4>Custom Header</h4>
          <p>Data length: {{ data.length }}</p>
          <p>Pivot state exists: {{ !!pivotState }}</p>
        </div>
      </template>
      
      <template #body>
        <div style="padding: 10px; border: 2px solid #007bff;">
          <h4>Custom Body</h4>
          <div v-if="!pivotState">
            <p>Waiting for pivot state...</p>
          </div>
          <div v-else>
            <p>Pivot state loaded!</p>
            <p>Rows: {{ pivotState?.rows?.length || 0 }}</p>
            <p>Columns: {{ pivotState?.columns?.length || 0 }}</p>
            <p>Measures: {{ pivotState?.measures?.length || 0 }}</p>
            
            <div v-if="pivotState?.rows?.length && pivotState?.columns?.length && pivotState?.measures?.length">
              <h5>Simple Table Rendering</h5>
              <table border="1" style="border-collapse: collapse;">
                <tr>
                  <th>Row Field</th>
                  <th>Column Field</th>
                  <th>Measure Field</th>
                </tr>
                <tr>
                  <td>{{ pivotState.rows[0]?.caption }}</td>
                  <td>{{ pivotState.columns[0]?.caption }}</td>
                  <td>{{ pivotState.measures[0]?.caption }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </template>
    </PivotHead>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue'
import PivotHead from '@mindfiredigital/pivothead-vue'

interface Props {
  data: Array<Record<string, unknown>>
  options?: Record<string, unknown>
}

export default defineComponent({
  name: 'SimpleMinimalMode',
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
  setup(props: Props) {
    // Refs
    const pivotRef = ref<any>(null)
    const pivotState = ref<any>(null)

    // Event handlers
    const handleStateChange = (e: CustomEvent) => {
      console.log('Simple minimal mode - state change:', e.detail)
      pivotState.value = e.detail
    }

    onMounted(() => {
      console.log('Simple minimal mode mounted')
      console.log('Data:', props.data)
      console.log('Options:', props.options)
    })

    return {
      pivotRef,
      pivotState,
      handleStateChange
    }
  },
  components: {
    PivotHead
  }
})
</script>

<style scoped>
.simple-minimal-mode {
  margin: 20px 0;
}

.pivot-container {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}
</style>
