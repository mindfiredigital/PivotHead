# Vue Headless Example

This example demonstrates PivotHead in **headless mode** (none mode) with the exact same functionality as the minimal mode. The key difference is that instead of using slots, this example uses a completely hidden PivotHead component and renders a fully custom UI.

## Features

This headless implementation provides all the same features as the minimal mode:

### Core Functionality

- ✅ **Processed and Raw view modes** with seamless switching
- ✅ **Advanced filtering** with multiple operators (equals, contains, greater than, less than)
- ✅ **Dynamic filter field selection** based on current view mode
- ✅ **Sorting capabilities** for both processed and raw data
- ✅ **Drag and drop** for column and row reordering
- ✅ **Drill-down functionality** with detailed modal views
- ✅ **Pagination** with customizable page sizes and navigation

### Export & Formatting

- ✅ **Multiple export formats**: HTML, Excel, PDF, CSV
- ✅ **Print functionality**
- ✅ **Cell formatting** with format popup
- ✅ **Number formatting** with locale support

### User Experience

- ✅ **Responsive design** with proper mobile support
- ✅ **Loading states** and error handling
- ✅ **Smooth animations** and transitions
- ✅ **Keyboard navigation** support
- ✅ **Accessibility** features

## Architecture

### Headless Approach

The headless mode uses a completely hidden PivotHead component (`mode="none"` with `style="display: none;"`) to handle all the data processing and state management, while providing a 100% custom UI layer.

```vue
<!-- Hidden PivotHead for data processing -->
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

<!-- Custom UI components -->
<ProcessedTable v-if="viewMode === 'processed'" ... />
<RawTable v-else ... />
```

### Component Structure

- **HeadlessPivot.vue**: Main component with hidden PivotHead and custom UI
- **ProcessedTable.vue**: Custom table for processed/pivot view
- **RawTable.vue**: Custom table for raw data view
- **DrillDownModal.vue**: Modal for drill-down functionality

## Usage

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Configuration

The pivot configuration is passed via props:

```vue
<HeadlessPivot :data="salesData" :options="pivotOptions" />
```

```javascript
const pivotOptions = {
  rows: [{ uniqueName: 'Region', caption: 'Region' }],
  columns: [{ uniqueName: 'Product', caption: 'Product' }],
  measures: [
    {
      uniqueName: 'Sales',
      caption: 'Total Sales',
      aggregation: 'sum',
    },
  ],
};
```

## Comparison with Minimal Mode

| Feature           | Minimal Mode                       | Headless Mode                     |
| ----------------- | ---------------------------------- | --------------------------------- |
| **Approach**      | Uses slots in `mode="minimal"`     | Hidden component in `mode="none"` |
| **UI Control**    | Partial - header/body slots        | Complete - 100% custom UI         |
| **Functionality** | ✅ Full feature set                | ✅ Identical feature set          |
| **Complexity**    | Medium                             | High                              |
| **Flexibility**   | High                               | Maximum                           |
| **Use Case**      | Customizable with some constraints | Complete UI control               |

## Data Structure

The example uses sales data with the following structure:

```javascript
{
  Region: 'North',     // Row dimension
  Product: 'Laptop',   // Column dimension
  Sales: 1200,         // Measure
  Quarter: 'Q1',       // Additional field
  Manager: 'John Smith', // Additional field
  Store: 'Store A'     // Additional field
}
```

## Key Benefits

1. **Complete UI Control**: Every aspect of the UI is customizable
2. **Framework Agnostic**: The hidden component approach can work with any framework
3. **Performance**: Efficient rendering with custom optimizations
4. **Maintainability**: Clean separation between data logic and UI
5. **Scalability**: Easy to extend with additional features

## Development Notes

- The headless component maintains all state management from the minimal mode
- All event handlers and methods are identical to ensure feature parity
- The custom tables handle drag & drop, sorting, and pagination
- Error handling and loading states are properly managed
- TypeScript types are fully maintained for type safety

# Build for production

pnpm build

```

The example will be available at `http://localhost:3001/`

## Customization

This example demonstrates how you can:
- Build completely custom UI while leveraging PivotHead's data processing
- Implement your own styling and layout
- Add custom controls and interactions
- Export data in custom formats
- Handle complex pivot operations without being constrained by default UI

## Comparison with Other Modes

- **Default Mode**: Full PivotHead UI with predefined styling
- **Minimal Mode**: PivotHead with slots for custom header/body content
- **Headless Mode**: No PivotHead UI, complete custom interface freedom

This headless approach is ideal when you need maximum control over the user interface while still benefiting from PivotHead's powerful data processing capabilities.
```
