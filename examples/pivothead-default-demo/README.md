# PivotHead Default Demo

A comprehensive demonstration of the PivotHead web component showcasing all available features including data processing, filtering, pagination, export capabilities, and interactive functionalities.

## 🚀 Quick Start

To run this demo locally:

```bash
npx vite
```

This will start the development server and automatically open the demo in your browser at `http://localhost:5173/index.html`.

## 📋 Overview

This demo showcases the full-featured `<pivot-head>` web component, demonstrating how to create interactive pivot tables with advanced data manipulation capabilities. The component processes raw data and presents it in an intuitive, user-friendly interface.

## ✨ Features Demonstrated

### 📊 **Data Processing & Display**

- **Processed Table View**: Default view showing aggregated and structured data
- **Raw Table View**: Switch to view the original, unprocessed dataset
- **Dynamic Data Rendering**: Real-time updates as you interact with the data

### 🔄 **Interactive Data Manipulation**

- **Sorting**: Click on column headers to sort data ascending/descending
- **Draggable Rows**: Drag and drop rows to reorder them
- **Draggable Columns**: Drag and drop columns to reorganize the table layout
- **Row/Column Swapping**: Advanced reordering with visual feedback

### 🔍 **Data Exploration**

- **Cell Drill-Down**: Double-click on any processed data cell to view:
  - Raw data records contributing to that cell
  - Detailed breakdown in a modal popup
  - Styled modal with comprehensive data insights

### 🎛️ **Data Filtering & Pagination**

- **Advanced Filtering**: Filter data based on multiple criteria
- **Pagination Controls**: Navigate through large datasets efficiently
- **Page Size Configuration**: Customize number of records per page
- **Filter State Management**: Persistent filter settings

### 📤 **Export & Print Capabilities**

- **HTML Export**: Export table data as formatted HTML
- **PDF Export**: Generate PDF documents of your pivot table
- **Excel Export**: Export to Excel format for further analysis
- **Print Functionality**: Direct printing with optimized layouts

### ⚙️ **Configuration Options**

- **Responsive Design**: Adapts to different screen sizes
- **Theme Support**: Customizable styling and appearance
- **Data Source Flexibility**: Support for various data formats
- **Real-time Updates**: Live data synchronization

## 🏗️ Component Usage

The demo uses the PivotHead web component with the following basic structure:

```html
<pivot-head id="pivot-table" data-source="path/to/data.json" responsive="true">
</pivot-head>
```

### Key Attributes:

- `data-source`: Path to your JSON data file
- `responsive`: Enables responsive design (default: true)
- `id`: Unique identifier for the component instance

## 📁 Project Structure

```
pivothead-default-demo/
├── index.html          # Main demo page
├── vite.config.js      # Vite configuration
├── README.md          # This file
└── data/              # Sample data files (Optional)
    └── sample-data.json
```

## 🎯 Interactive Features Guide

### 1. **Table Switching**

- Use the toggle controls to switch between "Processed" and "Raw" data views
- Observe how data aggregation changes between views

### 2. **Sorting**

- Click any column header to sort data
- Click again to reverse sort order
- Notice the visual indicators showing current sort state

### 3. **Drag & Drop**

- **Rows**: Click and drag any row to reorder
- **Columns**: Drag column headers to reorganize table structure
- Visual feedback shows valid drop zones

### 4. **Cell Drill-Down**

- Double-click any data cell in processed view
- Modal popup displays:
  - Contributing raw data records
  - Aggregation breakdown
  - Detailed field information

### 5. **Filtering**

- Use filter controls to narrow down data
- Apply multiple filters simultaneously
- Clear filters to reset view

### 6. **Pagination**

- Navigate through pages using pagination controls
- Change page size from the dropdown
- View total record counts

### 7. **Export Options**

- **HTML**: Download formatted HTML table
- **PDF**: Generate PDF with current table state
- **Excel**: Export to .xlsx format
- **Print**: Open browser print dialog with optimized layout

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Local Development

1. Navigate to the demo directory:

   ```bash
   cd examples/pivothead-default-demo
   ```

2. Start the development server:

   ```bash
   npx vite
   ```

3. Open your browser to `http://localhost:5173`

### Customization

- Modify `index.html` to change demo content
- Update data files in the `data/` directory
- Customize styling through CSS variables
- Configure component behavior via JavaScript

## 📊 Sample Data

The demo includes sample datasets demonstrating:

- **Sales Data**: Product, region, and sales figures
- **Mixed Data Types**: Strings, numbers, dates, booleans
- **Hierarchical Data**: Categories and subcategories
- **Large Datasets**: Performance testing with 1000+ records

## 🎨 Styling & Themes

The component supports extensive customization:

- CSS custom properties for colors and spacing
- Responsive breakpoints
- Dark/light theme support
- Custom modal styling
- Print-optimized layouts

## 🔧 Configuration Options

### Data Source Configuration

```javascript
// Programmatic data loading
const pivotTable = document.getElementById('pivot-table');
pivotTable.setData(yourDataArray);
```

### Advanced Configuration

```javascript
// Configure pivot settings
pivotTable.configure({
  aggregation: 'sum', // sum, avg, count, min, max
  responsive: true,
  pageSize: 25,
  enableFilters: true,
  enableExport: true,
});
```

## 🚨 Performance Notes

- Optimized for datasets up to 10,000 records
- Virtual scrolling for large datasets
- Efficient DOM updates with subscription system
- Lazy loading for export operations

## 🤝 Support & Documentation

For detailed API documentation and advanced usage examples, visit the main PivotHead documentation.

## 🏷️ Version Information

This demo is compatible with:

- PivotHead Web Component v1.1.0+
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Node.js v16+

---

**Happy Pivoting!** 🎉

> This demo showcases the complete capabilities of the PivotHead web component. Experiment with all features to see how they can enhance your data visualization and analysis workflows.
