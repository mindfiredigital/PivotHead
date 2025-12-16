# Automatic WASM Setup Guide

## Overview

PivotHead now features **automatic WebAssembly bundling** - users can install and use the package without any manual configuration or file copying!

## What Changed

### Before (Manual Setup Required ❌)

Users had to:

1. Install the package
2. Manually copy WASM files to their public folder
3. Configure bundler to serve WASM files
4. Install additional dependencies manually

### After (Fully Automatic ✅)

Users only need to:

```bash
npm install @mindfiredigital/pivothead
```

Everything works automatically!

## How It Works

### 1. Bundler-Friendly WASM Loading

We use modern bundler features to automatically resolve and bundle WASM files:

**File: `src/wasm/wasmAssets.ts`**

```typescript
export function getWasmUrl(): string {
  const wasmUrl = new URL('../wasm/csvParser.wasm', import.meta.url).href;
  return wasmUrl;
}
```

- `new URL()` with `import.meta.url` is understood by Vite, Webpack 5+, and Rollup
- Bundlers automatically copy the WASM file to the output directory
- The URL is correctly resolved at build time

### 2. Package Structure

The npm package includes:

```
@mindfiredigital/pivothead/
├── dist/
│   ├── pivothead-core.mjs (ES module)
│   ├── pivothead-core.umd.js (UMD module)
│   ├── index.d.ts (TypeScript definitions)
│   └── wasm/
│       └── csvParser.wasm (WebAssembly module)
```

### 3. Automatic Dependency Management

**package.json**

```json
{
  "dependencies": {
    "@assemblyscript/loader": "^0.27.33",
    "jsdom": "^26.0.0",
    "jspdf": "^3.0.2",
    "jspdf-autotable": "^5.0.2",
    "xlsx": "^0.18.5"
  }
}
```

All dependencies are automatically installed via npm/yarn/pnpm.

## For Users

### Installation

```bash
npm install @mindfiredigital/pivothead
```

### Usage

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const engine = new PivotEngine({
  data: yourData,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
    },
  ],
  // ... other config
});

// CSV upload with automatic WASM processing
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async e => {
  const file = e.target.files[0];
  // WASM automatically loads and processes CSV
  const result = await engine.processCSVFile(file);
});
```

**No additional setup required!** The WASM module loads automatically.

## Supported Bundlers

This automatic setup works with:

- ✅ **Vite** (recommended)
- ✅ **Webpack 5+**
- ✅ **Rollup**
- ✅ **Parcel 2+**
- ✅ **esbuild** (with plugins)

### Framework Compatibility

- ✅ Vanilla JavaScript
- ✅ React
- ✅ Vue
- ✅ Angular
- ✅ Svelte
- ✅ Any modern JavaScript framework

## Technical Details

### WASM Loading Process

1. User imports PivotHead: `import { PivotEngine } from '@mindfiredigital/pivothead'`
2. When CSV processing is triggered, `WasmLoader` initializes
3. `getWasmUrl()` returns the bundler-resolved URL to csvParser.wasm
4. WASM binary is fetched and instantiated
5. CSV parsing uses WASM for high performance

### Bundler Resolution

When the user's app builds:

```javascript
// In your code:
import { PivotEngine } from '@mindfiredigital/pivothead';

// Bundler follows imports and finds:
// node_modules/@mindfiredigital/pivothead/dist/pivothead-core.mjs
//   → imports wasmAssets.ts
//     → references ../wasm/csvParser.wasm
//       → Bundler copies WASM to output and resolves URL
```

## Development Notes

### Building the Package

```bash
cd packages/core
npm run build
```

This:

1. Builds AssemblyScript WASM module
2. Builds TypeScript source to ES and UMD
3. Copies WASM files to dist/wasm/
4. Generates TypeScript declarations

### Testing Locally

```bash
cd examples/simple-js-demo
npm run dev
```

The example app will automatically load WASM from the built package.

## Troubleshooting

### WASM Not Loading

If users report WASM loading issues:

1. **Check bundler version**: Ensure they're using a modern bundler (Vite 2+, Webpack 5+)
2. **Check browser support**: WebAssembly requires modern browsers
3. **Check network**: WASM file must be accessible from the built app

### Build Warnings

The warning during package build:

```
new URL("../wasm/csvParser.wasm", import.meta.url) doesn't exist at build time
```

This is **expected and normal**. The URL is resolved by the _consumer's_ bundler, not during package build.

## Benefits

### For Users

- ✅ Zero configuration
- ✅ Works out of the box
- ✅ No manual file copying
- ✅ Framework agnostic
- ✅ TypeScript support included

### For Maintainers

- ✅ Follows bundler best practices
- ✅ No custom build scripts for users
- ✅ Standard npm package structure
- ✅ Compatible with all major bundlers

## Migration from Manual Setup

If you previously used manual WASM setup:

### Remove These Steps

```bash
# ❌ No longer needed
cp node_modules/@mindfiredigital/pivothead/dist/wasm/csvParser.wasm public/wasm/
```

```javascript
// ❌ No longer needed
// vite.config.js
{
  publicDir: 'public',
  // ... special WASM configuration
}
```

### Just Install

```bash
# ✅ This is all you need
npm install @mindfiredigital/pivothead
```

## Future Enhancements

- [ ] Support for streaming WASM (for very large files)
- [ ] Multiple WASM modules (for different data formats)
- [ ] CDN fallback option
- [ ] Service Worker caching for WASM

## Questions?

If users have issues with the automatic setup, please file an issue with:

- Bundler name and version
- Framework name and version
- Browser name and version
- Error messages or console logs
