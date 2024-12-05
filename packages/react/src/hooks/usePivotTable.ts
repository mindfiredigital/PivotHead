import { useState, useCallback } from 'react'
import { PivotEngine } from '@pivothead/core'
import type { 
  PivotTableConfig, 
  PivotTableState,
} from '@pivothead/core'

export function usePivotTable<T extends Record<string, any>>(config: PivotTableConfig<T>) {
  const [engine] = useState(() => new PivotEngine<T>(config))
  const [state, setState] = useState<PivotTableState<T>>(() => engine.getState())

  const sort = useCallback((field: string, direction: 'asc' | 'desc') => {
    engine.sort(field, direction)
    setState(engine.getState())
  }, [engine])

  const reset = useCallback(() => {
    engine.reset()
    setState(engine.getState())
  }, [engine])

  return {
    state,
    actions: {
      sort,
      reset
    }
  }
}


