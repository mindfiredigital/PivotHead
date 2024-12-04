import { useCallback, useState, useMemo } from 'react'
import { PivotEngine } from '@pivothead/core'
import type { 
  PivotTableConfig, 
  PivotTableState
} from '@pivothead/core'

export function usePivotTable<T>(config: PivotTableConfig<T>) {
  const engine = useMemo(() => new PivotEngine<T>(config), [config])
  const [state, setState] = useState<PivotTableState<T>>(() => engine.getState())

  const updateState = useCallback(() => {
    setState(engine.getState())
  }, [engine])

  const toggleExpand = useCallback((rowId: string) => {
    updateState()
  }, [engine, updateState])

  const sort = useCallback((field: string, direction: 'asc' | 'desc') => {
    engine.sort(field, direction)
    updateState()
  }, [engine, updateState])


  return {
    state,
    actions: {
      toggleExpand,
      sort
    }
  }
}

