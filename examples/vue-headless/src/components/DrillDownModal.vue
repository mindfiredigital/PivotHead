<template>
  <div
    v-if="open"
    style="position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 9999;"
    @click="$emit('close')"
  >
    <div
      style="background: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.2); padding: 16px; width: 90%; max-width: 840px; max-height: 80vh; overflow: auto;"
      @click.stop
    >
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <div style="font-weight: 700;">Details: {{ title }}</div>
        <button
          @click="$emit('close')"
          style="font-size: 18px; border: none; background: #ef4444; color: #fff; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;"
        >
          ×
        </button>
      </div>
      
      <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; margin: 8px 0;">
        {{ summary }}
      </div>
      
      <div v-if="rows && rows.length">
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th
                v-for="header in headers"
                :key="header"
                style="border: 1px solid #e5e7eb; padding: 6px 8px; background: #f9fafb; text-align: left;"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="i">
              <td
                v-for="header in headers"
                :key="header"
                style="border: 1px solid #e5e7eb; padding: 6px 8px;"
              >
                {{ formatValue(row[header]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else>
        No matching records.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineOptions } from 'vue'

defineOptions({
  name: 'DrillDownModal'
})

interface Props {
  open: boolean
  title: string
  summary: string
  rows: Array<Record<string, unknown>>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const headers = computed(() => 
  props.rows && props.rows.length ? Object.keys(props.rows[0]) : []
)

const formatValue = (value: unknown): string => {
  return value != null ? String(value) : ''
}
</script>
