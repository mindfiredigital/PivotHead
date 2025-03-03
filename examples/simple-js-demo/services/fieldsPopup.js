import { onSectionItemDrop } from '../index.js';

const droppedFields = {
  rows: new Set(),
  columns: new Set(),
  values: new Set(),
  filters: new Set(),
};

export function createFieldsPopup() {
  let fieldSettingsPopups = document.getElementById('fieldSettingsPopup');
  if (!fieldSettingsPopups) {
    const style = document.createElement('style');
    style.innerHTML = `
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.aggregation-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 5px;
          cursor: pointer;
          font-size: 16px;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
      }

      .aggregation-button:hover {
          background-color: #0056b3;
      }

      .aggregation-dropdown {
          list-style: none;
          margin-top: 15%;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          padding: 5px 0;
          position: absolute;
          z-index: 10;
          display: none; /* Initially hidden */
          top: -100%; /* Positions the dropdown above the list item */
          right: 10px;
          width: max-content;
          max-height: 80px;
          overflow-y:auto;
          max-width: 300px; /* Prevents dropdown from exceeding container width */
          overflow-x: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .aggregation-dropdown li {
          padding: 5px;
          cursor: pointer;
      }

      .aggregation-dropdown li:hover {
          background-color: #e0e0e0;
      }

body {
    font-family: 'Arial', sans-serif;
    background-color: #f0f0f0;
    padding: 20px;
}

.sigma-li {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: #f1f1f1;
          margin-bottom: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
      }

.popup {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    width: 80%;
    max-width: 900px;
    height: 80%;
    overflow-y: auto;
    border-radius: 8px;
    background: #f8f8f8;
    display: flex;
    flex-direction: column;
}

.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 20px;
    cursor: pointer;
    color: #888;
    transition: color 0.3s;
}

.close-btn:hover {
    color: #333;
}

.popup-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
}

.popup-body {
    display: flex;
    gap: 20px;
    height: 100%;
    width: 100%;
    flex: 1;
    overflow: hidden;
}

.section {
    background-color: #fff;
    border-radius: 8px;
    padding: 10px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    flex: 1;
    display: flex;
    width:100%;
    height:100%;
    flex-direction: column;
    justify-content: flex-start;
    gap: 10px;
}

h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
}

.right-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    width: 70%;
    height: 100%;
    max-height: 100%;
}

ul.section-list {
    list-style-type: none;
    padding: 10px;
    margin: 0;
    background-color: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    flex: 1;
    overflow-y: auto;
    width:100%;
    height:100%;
}

#fieldsList {
    max-height: 90%;
    min-height: 90%;
}

li {
    padding: 10px;
    background-color: #f1f1f1;
    margin-bottom: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

li:hover {
    background-color: #e0e0e0;
}

li.draggable {
    cursor: move;
}

li.dragging {
    opacity: 0.5;
}

.apply-btn {
    margin-right: 20px;
    padding: 10px 15px;
    background-color: #28a745;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    border-radius: 4px;
}

.apply-btn:hover {
    background-color: #218838;
}

.cancel-btn {
    padding: 10px 15px;
    background-color: #dc3545;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    border-radius: 4px;
}

.cancel-btn:hover {
    background-color: #c82333;
}

.popup.visible {
    display: flex;
}

.popup.hidden {
    display: none;
}

.popup-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
}

.pivot-table {
    width: 100%;
    border-collapse: collapse;
}

.pivot-table th,
.pivot-table td {
    border: 1px solid #ccc;
    padding: 8px 12px;
    text-align: center;
}

#allFields {
    display: flex;
    flex-direction: column;
    height: 100%;
}

#fieldsList {
    flex-grow: 1;
    overflow-y: auto;
}

.move-back-btn {
    cursor: pointer;
    font-size: 16px;
    color: #007bff;
    transition: color 0.3s;
}

.move-back-btn:hover {
    color: #0056b3;
}

.move-back-icon {
    font-size: 18px;
    cursor: pointer;
}

li .field-info {
    display: flex;
    align-items: center;
    gap: 2px; /* Small space between checkbox and text */
}

li .field-info input {
    margin-right: 8px; /* Tiny space between checkbox and label */
}
    `;
    document.head.appendChild(style);

    // TODO: will add the following in next iteration once functioanlity is ready
    //     <div id="reportFilters" class="section">
    //                           <h3>Report Filters</h3>
    //                           <ul id="reportFiltersList" class="section-list"></ul>
    //                       </div>

    //  <div id="values" class="section">
    //                           <h3>Values</h3>
    //                           <ul id="valuesList" class="section-list"></ul>
    //                       </div>

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

    const fields = [
      { name: 'Product', type: 'string' },
      { name: 'Date', type: 'string' },
      { name: 'Region', type: 'string' },
      { name: 'Sales', type: 'number' },
      { name: 'Quantity', type: 'number' },
    ];

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
        fieldsList.appendChild(li);
      });
    };

    const showPopup = () => {
      fieldSettingsPopup.classList.remove('hidden');
      fieldSettingsPopup.classList.add('visible');

      populateFields();

      attachEventListeners();
    };

    const attachEventListeners = () => {
      closeBtn.removeEventListener('click', hidePopup); // Clean up previous listener
      applyBtn.removeEventListener('click', hidePopup); // Clean up previous listener

      closeBtn.addEventListener('click', hidePopup);
      applyBtn.addEventListener('click', hidePopup);

      fieldsList.addEventListener('dragstart', dragStart);
      fieldsList.addEventListener('dragend', dragEnd);

      allSections.forEach(section => {
        section.addEventListener('dragover', dragOver);
        section.addEventListener('drop', drop);
      });
    };

    function hidePopup() {
      fieldSettingsPopup.classList.add('hidden');
      fieldSettingsPopup.classList.remove('visible');
      onSectionItemDrop(droppedFields);
    }

    function dragStart(event) {
      const draggedElement = event.target;
      if (draggedElement && draggedElement.classList.contains('draggable')) {
        draggedElement.classList.add('dragging');
        event.dataTransfer.setData(
          'text',
          draggedElement.getAttribute('data-field-name')
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

    function drop(event) {
      event.preventDefault();
      const target = event.target.closest('.section-list');
      const fieldName = event.dataTransfer.getData('text');

      if (target && fieldName) {
        const sectionId = target.id;
        let sectionType;

        if (sectionId === 'reportFiltersList') sectionType = 'filters';
        else if (sectionId === 'columnsList') sectionType = 'columns';
        else if (sectionId === 'rowsList') sectionType = 'rows';
        else if (sectionId === 'valuesList') sectionType = 'values';
        else return;

        const section = droppedFields[sectionType];

        // Check if the field is already present in the section
        if (section.has(fieldName)) {
          return; // Don't add if the field is already in the section
        }
        if (sectionType === 'values') {
          const field = fields.find(f => f.name === fieldName);
          if (field && field.type !== 'number') {
            alert('Only numerical fields can be added to Values.');
            return;
          }
        }

        section.add(fieldName);

        // Create list item for dropped field
        const li = document.createElement('li');
        li.textContent = fieldName;

        // Add Sigma button (for aggregation options)
        if (sectionType === 'values') {
          const sigmaButton = document.createElement('button');
          sigmaButton.textContent = '∑';
          sigmaButton.classList.add('aggregation-button');

          const dropdown = document.createElement('ul');
          dropdown.classList.add('aggregation-dropdown');
          dropdown.style.display = 'none';
          const aggregationOptions = ['Sum', 'Average', 'Count'];

          aggregationOptions.forEach(option => {
            const optionItem = document.createElement('li');
            optionItem.textContent = option;
            optionItem.addEventListener('click', () => {
              dropdown.style.display = 'none';
            });
            dropdown.appendChild(optionItem);
          });

          sigmaButton.addEventListener('click', () => {
            dropdown.style.display =
              dropdown.style.display === 'none' ? 'block' : 'none';
          });

          li.classList.add('sigma-li');
          li.appendChild(sigmaButton);
          li.appendChild(dropdown);
          createMoveBackIcon(fieldName, li, section, target);
        }

        createMoveBackIcon(fieldName, li, section, target);
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
      section.delete(fieldName);

      const allFieldsItem = document.querySelector(
        `#fieldsList li[data-field-name="${fieldName}"]`
      );
      if (allFieldsItem) {
        allFieldsItem.querySelector('input').checked = false;
      }
    });
  }
}
