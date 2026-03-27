'use strict';

// FIXED: Enhanced draggable styles with better sort indicators
export function addDraggableStyles() {
  if (document.querySelector('#pivot-table-styles')) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'pivot-table-styles';
  styleEl.innerHTML = `
        .dragging { opacity: 0.5; background-color: #f0f0f0; }
        .drag-over { border: 2px dashed #666 !important; background-color: #e9ecef !important; }
        th[draggable="true"], tr[draggable="true"] { cursor: move; }
        .column-header[draggable="true"] { cursor: move; transition: background-color 0.2s; }
        .column-header[draggable="true"]:hover { background-color: #e3f2fd !important; border: 1px solid #2196f3 !important; }
        .column-header.dragging { opacity: 0.6; background-color: #ffecb3 !important; }
        .column-header.drag-over { border: 3px dashed #4caf50 !important; background-color: #e8f5e8 !important; }
        .controls-container { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
        .filter-container, .pagination-container { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        #myTable { overflow-x: auto; width: 100%; }
        button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        select, input { padding: 5px; border-radius: 4px; border: 1px solid #ddd; }
        .drill-down-cell { cursor: pointer; transition: background-color 0.2s; }
        .drill-down-cell:hover { background-color: #e3f2fd !important; border: 2px solid #2196f3 !important; }
        .drill-down-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .drill-down-content { background: white; border-radius: 8px; padding: 20px; width: 90%; max-width: 800px; max-height: 80%; overflow: auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
        .drill-down-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
        .drill-down-title { font-size: 18px; font-weight: bold; color: #333; }
        .drill-down-close { background: #f44336; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .drill-down-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .drill-down-table th { background: #f8f9fa; padding: 8px; border: 1px solid #dee2e6; font-weight: bold; text-align: left; }
        .drill-down-table td { padding: 6px 8px; border: 1px solid #dee2e6; }

        /* Enhanced sort icon styles */
        th span[title*="sort"], th span[title*="Sort"] {
            transition: all 0.2s ease;
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
        }

        th span[title*="sort"]:hover, th span[title*="Sort"]:hover {
            background-color: rgba(0, 123, 255, 0.1);
            transform: scale(1.1);
        }

        th[style*="cursor: pointer"]:hover {
            background-color: #e9ecef !important;
        }

        /* Visual feedback for sortable headers */
        th[style*="cursor: pointer"] {
            position: relative;
            transition: background-color 0.2s ease;
        }

        th[style*="cursor: pointer"]::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background-color: #007bff;
            transition: width 0.3s ease;
            transform: translateX(-50%);
        }

        th[style*="cursor: pointer"]:hover::after {
            width: 80%;
        }
    `;
  document.head.appendChild(styleEl);
}

export function addEnhancedDragStyles() {
  const existingStyle = document.querySelector('#enhanced-drag-styles');
  if (existingStyle) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'enhanced-drag-styles';
  styleEl.innerHTML = `
    .column-header[draggable="true"] {
      transition: all 0.2s ease;
    }

    .column-header[draggable="true"]:hover {
      background-color: #e3f2fd !important;
      border: 2px solid #2196f3 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .column-header.dragging {
      opacity: 0.6;
      background-color: #ffecb3 !important;
      border: 2px solid #ff9800 !important;
      transform: rotate(3deg);
    }

    .column-header.drag-over {
      border: 3px dashed #4caf50 !important;
      background-color: #e8f5e8 !important;
      animation: pulse 0.5s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    /* Drag cursor feedback */
    .column-header[draggable="true"]:active {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(styleEl);
}
