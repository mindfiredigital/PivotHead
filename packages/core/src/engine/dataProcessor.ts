import { DimensionConfig, MeasureConfig, ProcessedRow } from '../types/interfaces'


export function processData<T>(
  data: T[],
  dimensions: DimensionConfig[],
  measures: MeasureConfig[]
): ProcessedRow<T>[] {
  const processedRows: ProcessedRow<T>[] = []
  const dimensionFields = dimensions.map(d => d.field)

  const groupedData = groupData(data, dimensionFields)
  processGroup(groupedData, dimensionFields, measures, processedRows)

  return processedRows
}

function groupData<T>(data: T[], fields: string[]): Map<string, T[]> {
  const groupedData = new Map<string, T[]>()

  for (const item of data) {
    const key = fields.map(field => (item as any)[field]).join('|')
    if (!groupedData.has(key)) {
      groupedData.set(key, [])
    }
    groupedData.get(key)!.push(item)
  }

  return groupedData
}

function processGroup<T>(
  group: Map<string, T[]>,
  dimensions: string[],
  measures: MeasureConfig[],
  result: ProcessedRow<T>[],
  level: number = 0,
  parentId: string = ''
): void {
  for (const [key, items] of group.entries()) {
    const dimensionValues = key.split('|')
    const id = parentId ? `${parentId}-${key}` : key

    if (level < dimensions.length - 1) {
      const nextGroup = groupData(items, dimensions.slice(level + 1))
      processGroup(nextGroup, dimensions, measures, result, level + 1, id)
    }
  }
}

