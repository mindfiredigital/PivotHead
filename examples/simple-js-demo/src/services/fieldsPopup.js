'use strict';
import './fieldsPopup.css';
import { logger } from '../../logger.js';
import { appState } from '../../state.js';
import { FieldService } from '@mindfiredigital/pivothead';

// Track dropped fields per section
const droppedFields = {
  rows: new Set(),
  columns: new Set(),
  // Map<string, AggregationType>
  values: new Map(),
  filters: new Set(),
};

export function createFieldsPopup() {
  let fieldSettingsPopups = document.getElementById('fieldSettingsPopup');
  if (!fieldSettingsPopups) {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="myTableContainer">
          <table id="myTable" class="pivot-table"></table>
      </div>

      <div id="fieldSettingsPopup" class="popup">
          <div class="popup-content">
              <div class="popup-header">
                  <button id="applyBtn" class="apply-btn">Apply</button>
                  <button id="cancelBtn" class="cancel-btn">Cancel</button>
              </div>
              <h2>Field Settings</h2>
              <div class="popup-body">
                  <div id="allFields" class="section">
                      <h3>All Fields</h3>
                      <ul id="fieldsList" class="section-list"></ul>
                  </div>
                  <div id="rightSection" class="right-section">
                      <div id="columns" class="section">
                          <h3>Columns</h3>
                          <ul id="columnsList" class="section-list"></ul>
                      </div>
                      <div id="rows" class="section">
                          <h3>Rows</h3>
                          <ul id="rowsList" class="section-list"></ul>
                      </div>
                      <div id="values" class="section">
                          <h3>Values</h3>
                          <ul id="valuesList" class="section-list"></ul>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `;
    document.body.appendChild(container);

    const fieldSettingsPopup = document.getElementById('fieldSettingsPopup');
    const closeBtn = document.getElementById('cancelBtn');
    const applyBtn = document.getElementById('applyBtn');
    const fieldsList = document.getElementById('fieldsList');
    const allSections = document.querySelectorAll('.section-list');

    const rowsList = document.getElementById('rowsList');
    const columnsList = document.getElementById('columnsList');
    const valuesList = document.getElementById('valuesList');

    const getFieldsFromEngine = () => {
      if (!appState.pivotEngine) return [];
      try {
        return FieldService.getAvailableFields(appState.pivotEngine);
      } catch (e) {
        logger.error('Failed to get fields from engine', e);
        return [];
      }
    };

    const fields = getFieldsFromEngine();

    const populateFields = () => {
      fieldsList.innerHTML = '';

      fields.forEach(field => {
        const li = document.createElement('li');
        li.classList.add('draggable');

        const fieldInfo = document.createElement('div');
        fieldInfo.classList.add('field-info');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = field.name;
        checkbox.disabled = true;

        const label = document.createElement('label');
        label.htmlFor = field.name;
        label.textContent = field.name;

        const dragIcon = document.createElement('span');
        dragIcon.classList.add('drag-icon');
        dragIcon.innerHTML = '⤷'; // Drag icon symbol

        fieldInfo.appendChild(checkbox);
        fieldInfo.appendChild(label);

        li.appendChild(fieldInfo);
        li.appendChild(dragIcon);

        li.setAttribute('draggable', 'true');
        li.setAttribute('data-field-name', field.name);
        li.setAttribute('data-field-type', field.type);
        fieldsList.appendChild(li);
      });
    };

    const populateInitialSelections = () => {
      if (!appState.pivotEngine) return;
      const state = appState.pivotEngine.getState();

      // Initialize droppedFields from engine state
      droppedFields.rows = new Set((state.rows || []).map(r => r.uniqueName));
      droppedFields.columns = new Set(
        (state.columns || []).map(c => c.uniqueName)
      );
      droppedFields.values = new Map(
        (state.measures || []).map(m => [m.uniqueName, m.aggregation])
      );

      // Render items into respective lists
      rowsList.innerHTML = '';
      columnsList.innerHTML = '';
      valuesList.innerHTML = '';

      droppedFields.rows.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        createMoveBackIcon(name, li, droppedFields.rows, rowsList);
      });

      droppedFields.columns.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        createMoveBackIcon(name, li, droppedFields.columns, columnsList);
      });

      droppedFields.values.forEach((agg, name) => {
        const li = document.createElement('li');
        li.textContent = name;
        addAggregationControls(li, name, agg);
        li.classList.add('sigma-li');
        createMoveBackIcon(name, li, droppedFields.values, valuesList);
      });
    };

    const showPopup = () => {
      fieldSettingsPopup.classList.remove('hidden');
      fieldSettingsPopup.classList.add('visible');

      populateFields();
      populateInitialSelections();

      attachEventListeners();
    };

    const attachEventListeners = () => {
      // Reset listeners
      closeBtn.replaceWith(closeBtn.cloneNode(true));
      applyBtn.replaceWith(applyBtn.cloneNode(true));

      const newCloseBtn = document.getElementById('cancelBtn');
      const newApplyBtn = document.getElementById('applyBtn');

      newCloseBtn.addEventListener('click', () => {
        // Just hide, no apply
        fieldSettingsPopup.classList.add('hidden');
        fieldSettingsPopup.classList.remove('visible');
      });

      newApplyBtn.addEventListener('click', () => {
        // Apply current selection to engine and hide
        appState.onSectionItemDrop(droppedFields);
        fieldSettingsPopup.classList.add('hidden');
        fieldSettingsPopup.classList.remove('visible');
      });

      fieldsList.addEventListener('dragstart', dragStart);
      fieldsList.addEventListener('dragend', dragEnd);

      allSections.forEach(section => {
        section.addEventListener('dragover', dragOver);
        section.addEventListener('drop', drop);
      });
    };

    function dragStart(event) {
      const draggedElement = event.target;
      if (draggedElement && draggedElement.classList.contains('draggable')) {
        draggedElement.classList.add('dragging');
        event.dataTransfer.setData(
          'text',
          draggedElement.getAttribute('data-field-name')
        );
        event.dataTransfer.setData(
          'type',
          draggedElement.getAttribute('data-field-type')
        );
      }
    }

    function dragEnd(event) {
      const draggedElement = event.target;
      draggedElement.classList.remove('dragging');
    }

    function dragOver(event) {
      event.preventDefault();
    }

    function addAggregationControls(li, fieldName, currentAgg) {
      const sigmaButton = document.createElement('button');
      sigmaButton.textContent = '∑';
      sigmaButton.classList.add('aggregation-button');

      const dropdown = document.createElement('ul');
      dropdown.classList.add('aggregation-dropdown');
      dropdown.style.display = 'none';
      const aggregationOptions = FieldService.getSupportedAggregations();

      aggregationOptions.forEach(option => {
        const optionItem = document.createElement('li');
        optionItem.textContent = option;
        optionItem.addEventListener('click', () => {
          dropdown.style.display = 'none';
          droppedFields.values.set(fieldName, option);
          // Defer applying changes until Apply is clicked
          sigmaButton.title = `Aggregation: ${option}`;
        });
        dropdown.appendChild(optionItem);
      });

      sigmaButton.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === 'none' ? 'block' : 'none';
      });

      // Reflect current selection
      if (currentAgg) {
        sigmaButton.title = `Aggregation: ${currentAgg}`;
      }

      li.appendChild(sigmaButton);
      li.appendChild(dropdown);
    }

    function drop(event) {
      event.preventDefault();
      const target = event.target.closest('.section-list');
      const fieldName = event.dataTransfer.getData('text');
      const fieldType = event.dataTransfer.getData('type');

      if (target && fieldName) {
        const sectionId = target.id;
        let sectionType;

        if (sectionId === 'reportFiltersList') sectionType = 'filters';
        else if (sectionId === 'columnsList') sectionType = 'columns';
        else if (sectionId === 'rowsList') sectionType = 'rows';
        else if (sectionId === 'valuesList') sectionType = 'values';
        else return;

        // Don't add duplicates
        if (sectionType === 'values') {
          if (droppedFields.values.has(fieldName)) return;
          // Only allow numeric fields for values by default
          if (fieldType !== 'number') {
            alert('Only numeric fields can be added to Values.');
            return;
          }
        } else if (droppedFields[sectionType].has(fieldName)) {
          return;
        }

        const li = document.createElement('li');
        li.textContent = fieldName;

        if (sectionType === 'values') {
          li.classList.add('sigma-li');
          // default to sum
          droppedFields.values.set(fieldName, 'sum');
          addAggregationControls(li, fieldName, 'sum');
          createMoveBackIcon(fieldName, li, droppedFields.values, target);
        } else {
          droppedFields[sectionType].add(fieldName);
          createMoveBackIcon(fieldName, li, droppedFields[sectionType], target);
        }

        // Defer live update; apply on Apply button
      }
    }

    showPopup();
  } else {
    fieldSettingsPopups.classList.remove('hidden');
    fieldSettingsPopups.classList.add('visible');
  }

  function createMoveBackIcon(fieldName, li, section, target) {
    const moveBackIcon = document.createElement('span');
    moveBackIcon.classList.add('move-back-icon');
    moveBackIcon.textContent = '←'; // Move Back Icon
    li.appendChild(moveBackIcon);
    target.appendChild(li);

    moveBackIcon.addEventListener('click', () => {
      // Move it back to All Fields
      target.removeChild(li);
      if (section instanceof Map) {
        section.delete(fieldName);
      } else if (section instanceof Set) {
        section.delete(fieldName);
      }

      const allFieldsItem = document.querySelector(
        `#fieldsList li[data-field-name="${fieldName}"]`
      );
      if (allFieldsItem) {
        const inputEl = allFieldsItem.querySelector('input');
        if (inputEl) inputEl.checked = false;
      }

      // Defer live update; apply on Apply button
    });
  }
}
