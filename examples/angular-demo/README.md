# PivotHead Angular Demo

This is a comprehensive demonstration application showcasing all features of the PivotHead Angular wrapper using Angular 18.

## Features Demonstrated

### 1. **Basic Demo** (`/basic`)

- Basic pivot table setup
- State management
- Refresh and reset functionality
- Sorting capabilities
- View mode switching (raw/processed)

### 2. **File Import Demo** (`/file-import`)

- File upload via input
- ConnectService methods:
  - `connectToLocalCSV()` - Import CSV files
  - `connectToLocalJSON()` - Import JSON files
  - `connectToLocalFile()` - Import any supported file
  - `loadFromFile()` - Load from File object
  - `loadFromUrl()` - Load from URL
- WebAssembly performance optimization
- Event handling (dataLoaded, error)

### 3. **Field Introspection Demo** (`/field-introspection`)

- Dynamic field discovery with `getAvailableFields()`
- Supported aggregations with `getSupportedAggregations()`
- Custom layout builder
- Measure aggregation control
- Dynamic row/column/value assignment

### 4. **Drag & Drop Demo** (`/drag-drop`)

- Enable/disable drag & drop programmatically
- Swap rows programmatically
- Swap columns programmatically
- Interactive drag & drop in the UI

### 5. **Export Demo** (`/export`)

- Export to PDF
- Export to Excel
- Export to HTML
- Print dialog
- Custom file naming

### 6. **Events Demo** (`/events`)

- Monitor all component events:
  - `stateChange`
  - `viewModeChange`
  - `paginationChange`
  - `dataLoaded`
  - `error`
- Real-time event logging
- Event data visualization

### 7. **Rendering Modes Demo** (`/modes`)

- **Default Mode**: Full UI with controls
- **Minimal Mode**: Custom slots for header and body
- **Headless Mode**: Complete programmatic control

## Installation

```bash
# Install dependencies from the project root
pnpm install

# Navigate to the demo
cd examples/angular-demo

# Start the development server
npm start
```

The application will be available at `http://localhost:4200`

## Project Structure

```
angular-demo/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── basic-demo.component.ts
│   │   │   ├── file-import-demo.component.ts
│   │   │   ├── field-introspection-demo.component.ts
│   │   │   ├── drag-drop-demo.component.ts
│   │   │   ├── export-demo.component.ts
│   │   │   ├── events-demo.component.ts
│   │   │   └── modes-demo.component.ts
│   │   ├── data/
│   │   │   └── sample-data.ts
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Technologies Used

- **Angular 18**: Latest Angular framework with standalone components
- **TypeScript 5.4**: Type-safe development
- **PivotHead Angular Wrapper**: @mindfiredigital/pivothead-angular
- **WebAssembly**: For high-performance file processing

## Key Features Demonstrated

### Advanced API Usage

```typescript
// Field Introspection
const fields = this.pivotTable.getAvailableFields();
const aggregations = this.pivotTable.getSupportedAggregations();

// File Import
await this.pivotTable.connectToLocalCSV(options);
await this.pivotTable.loadFromFile(file);

// Drag & Drop Control
this.pivotTable.setDragAndDropEnabled(true);
this.pivotTable.swapRows(0, 1);

// Export
this.pivotTable.exportToPDF('report');
this.pivotTable.exportToExcel('data');
```

### Event Handling

```typescript
<pivot-head-wrapper
  (stateChange)="onStateChange($event)"
  (viewModeChange)="onViewModeChange($event)"
  (paginationChange)="onPaginationChange($event)"
  (dataLoaded)="onDataLoaded($event)"
  (error)="onError($event)"
/>
```

### Different Rendering Modes

```typescript
// Default Mode (Full UI)
<pivot-head-wrapper [mode]="'default'" />

// Minimal Mode (Custom Slots)
<pivot-head-wrapper [mode]="'minimal'">
  <div slot="header">Custom Header</div>
  <div slot="body">Custom Body</div>
</pivot-head-wrapper>

// Headless Mode (No UI)
<pivot-head-wrapper [mode]="'none'" />
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The demo includes sample data with 40+ records. For optimal performance with large datasets:

- Files < 8MB: In-memory WASM processing
- Files 8MB-100MB: WASM with chunking
- Files 100MB-1GB: Streaming + WASM hybrid mode

## License

MIT

## Support

For issues or questions:

- GitHub Issues: https://github.com/mindfiredigital/PivotHead/issues
- Documentation: See package README.md
