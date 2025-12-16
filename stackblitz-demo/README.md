# PivotHead Demo - StackBlitz

This is a simple demonstration of the `@mindfiredigital/pivothead` package using vanilla JavaScript.

## Features Demonstrated

- Creating a PivotEngine instance with sales data
- Configuring rows, columns, and measures
- Data formatting (currency and numbers)
- Conditional formatting (highlighting values based on conditions)
- Sorting functionality
- State management
- Grouped data aggregation

## IMPORTANT: Correct File Structure

Make sure your files are structured EXACTLY like this in StackBlitz:

```
project-root/
├── index.html          ← At root level
├── main.js             ← At root level (NOT in src/)
├── style.css           ← At root level
├── package.json        ← At root level
├── vite.config.js      ← At root level
└── .stackblitzrc       ← At root level (optional)
```

## Step-by-Step Setup in StackBlitz

### Method 1: Create New Project (Recommended)

1. Go to https://stackblitz.com/
2. Click **"New Project"** → Select **"Vite"** → Choose **"Vanilla"**
3. **DELETE** the default `counter.js` and `javascript.svg` files
4. **REPLACE** the following files with the content from this folder:
   - `index.html` (replace the default)
   - `main.js` (replace the default)
   - `style.css` (replace the default)
   - `package.json` (replace the default)
5. **ADD** new file `vite.config.js` (if not exists)
6. Click **"Install Dependencies"** button or it will auto-install
7. The dev server should start automatically

### Method 2: Direct Link (Easiest)

If you host these files on GitHub, you can use:

```
https://stackblitz.com/github/YOUR_USERNAME/YOUR_REPO
```

## Features

The demo includes:

### Core Features

- ✅ **Interactive Pivot Table** - Sales data by product and region with proper aggregation
- ✅ **Correct Value Calculation** - Fixed: All values now display correctly (no more zeros!)
- ✅ **Sorting** - Sort by sales (ascending/descending)
- ✅ **Reset** - Return to initial state

### NEW Features

- ✨ **Drag & Drop** - Drag rows and columns to reorder (cursor changes to move icon)
- 📄 **Pagination** - Navigate through large datasets with configurable page size (2, 3, 4, 5, or 10 rows per page)
- 📤 **CSV Import** - Upload your own CSV files to visualize custom data
- 📊 **Conditional Formatting** - Automatic highlighting:
  - Green for high values (> $2,000)
  - Orange for low values (< $500)

### Additional Features

- Live state display showing current configuration
- Responsive design for mobile/tablet
- Beautiful gradient UI with smooth animations
- Console logging for debugging

## How to Use Features

### Pagination

1. Use the **dropdown** to select rows per page (2, 3, 4, 5, or 10)
2. Click **← Prev** or **Next →** to navigate pages
3. Current page info is displayed in the middle

### Drag & Drop

- **Rows**: Click and drag any product row to reorder
- **Columns**: Click and drag region column headers to reorder
- Visual feedback: Element becomes semi-transparent while dragging

### File Upload (WASM-Powered for Large Files)

1. Click the **📁 Upload File** button
2. File picker opens immediately
3. Select a JSON or CSV file (up to 800MB+ supported!)
4. Confirmation dialog shows file name and size
5. Click **OK** to confirm
6. Loading indicator appears for large files
7. **WASM-based parsing** handles large CSV files efficiently
8. Success message: "✅ Successfully loaded X rows from [filename]!"

**Performance:**

- ⚡ **Small files** (< 5MB): Instant loading
- ⚡ **Medium files** (5-100MB): Fast WASM parsing
- ⚡ **Large files** (100MB-800MB+): WASM-accelerated parsing with progress indicator

**Supported Formats:**

- **JSON**: Array of objects (recommended)
  ```json
  [
    {"date": "2024-01-01", "product": "Laptop", "region": "North", "sales": 1500, "quantity": 3},
    ...
  ]
  ```
- **CSV**: Comma-separated values
  ```csv
  date,product,region,sales,quantity
  2024-01-01,Laptop,North,1500,3
  ```

**Sample Files Included:**

- `sample-data.json` - 18 rows in JSON format
- `sample-data.csv` - 18 rows in CSV format

**WASM Technology:**
The upload feature uses WebAssembly (WASM) for high-performance CSV parsing, enabling it to handle files up to 800MB or more. This is the same technology used in the simple-js-demo and is built into the @mindfiredigital/pivothead package.

### Sorting

- **Sort Sales ↑** - Sort by sales amount (lowest to highest)
- **Sort Sales ↓** - Sort by sales amount (highest to lowest)
- **Reset** - Return to original data order

## Sample CSV File

Use the included `sample-data.csv` to test the CSV upload feature. It contains 18 rows of sales data.

## Fixed Issues

### ✅ Fixed: Table Values Showing Zero

**Problem**: All table values were showing $0.00
**Solution**: Implemented direct calculation from raw data using `calculateAggregates()` function instead of relying on grouped data

The fix calculates aggregates by:

1. Filtering raw data for specific product-region combinations
2. Reducing values to sum/count/average as needed
3. Formatting values with proper locale and currency settings

## Learn More

- [PivotHead GitHub Repository](https://github.com/mindfiredigital/PivotHead)
- [npm Package](https://www.npmjs.com/package/@mindfiredigital/pivothead)
