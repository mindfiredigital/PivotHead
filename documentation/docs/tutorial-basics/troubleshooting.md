---
sidebar_position: 4
title: Troubleshooting
description: Troubleshooting and Best Practices of PivotHead
---

# Troubleshooting and Best Practices

## Best Practices

### Data Structure

For optimal performance, ensure your data:

- Has consistent types for each field
- Is pre-processed where possible
- Uses proper date objects for date fields
- Has unique identifiers for each record

### Performance Optimization

- Apply filters before setting pagination
- Use pagination for large datasets
- Limit the number of dimensions in complex pivot tables
- Consider server-side processing for very large datasets

### UI Integration Tips

- Provide clear UI controls for sorting, filtering, and pagination
- Consider adding export options (CSV, Excel)
- Implement responsive design for mobile users
- Add tooltips for cell values with additional context
- Consider color-coding or other visual cues to highlight important data

## Common Issues

### Performance Problems with Large Datasets

**Symptoms:**

- Slow rendering time
- Browser freezing or becoming unresponsive
- High memory usage

**Solutions:**

- Use pagination to limit the amount of data displayed at once:
  ```javascript
  engine.setPagination({
    currentPage: 1,
    pageSize: 50, // Adjust based on your needs
  });
  ```
- Limit the number of visible columns and rows
- Apply filters to reduce the dataset size:
  ```javascript
  engine.applyFilters([
    {
      field: 'date',
      operator: 'greaterThan',
      value: new Date('2024-01-01'),
    },
  ]);
  ```
- Consider server-side data processing for very large datasets
- Pre-aggregate data when possible
