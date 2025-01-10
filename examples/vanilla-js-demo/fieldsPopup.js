export function createFieldsPopup() {
  const style = document.createElement('style');
  style.innerHTML = `
          * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
          }
  
          body {
              font-family: 'Arial', sans-serif;
              background-color: #f0f0f0;
              padding: 20px;
          }
  
  
          /* Popup Styles */
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
              flex-direction: column;
              justify-content: flex-start;
              gap: 10px;
          }
  
          /* Title Styles */
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
              max-height: 100px;
              min-height: 100px;
          }
  
          #fieldsList {
              max-height: 90%; /* Optional: Set a max height if you need */
              min-height: 90%;  /* You can define a minimum height as well */
          }
  
          li {
              padding: 10px;
              background-color: #f1f1f1;
              margin-bottom: 8px;
              border-radius: 6px;
              cursor: pointer;
              transition: background-color 0.3s;
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
              display: flex; /* Shows the popup when visible */
          }
  
          .popup.hidden {
              display: none; /* Hides the popup when hidden */
          }
  
          
  
          .popup-header {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              gap: 10px; /* Ensures space between buttons */
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
  
          /* Modify this for the allFields section */
          #allFields {
              display: flex;
              flex-direction: column;
              height: 100%;  /* Ensures it takes the full height of the parent */
          }
  
          #fieldsList {
              flex-grow: 1;  /* Makes the list grow to fill available height */
              overflow-y: auto;  /* Makes it scrollable when content overflows */
          }
      `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.innerHTML = `
  
          <div id="pivotTableContainer">
              <h2>Pivot Table</h2>
              <table id="pivotTable" class="pivot-table"></table>
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
                          <div id="reportFilters" class="section">
                              <h3>Report Filters</h3>
                              <ul id="reportFiltersList" class="section-list"></ul>
                          </div>
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

  const fields = [
    { name: 'Country', type: 'string' },
    { name: 'Category', type: 'string' },
    { name: 'Region', type: 'string' },
    { name: 'Sales', type: 'number' },
  ];

  const droppedFields = {
    rows: [],
    columns: new Set(),
    values: new Set(),
    filters: new Set(),
  };

  const populateFields = () => {
    fields.forEach((field) => {
      const li = document.createElement('li');
      li.classList.add('draggable');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = field.name;
      checkbox.disabled = true;
      const label = document.createElement('label');
      label.htmlFor = field.name;
      label.textContent = field.name;

      li.appendChild(checkbox);
      li.appendChild(label);
      li.setAttribute('draggable', 'true');
      li.setAttribute('data-field-name', field.name);
      fieldsList.appendChild(li);
    });
  };

  const showPopup = () => {
    fieldSettingsPopup.classList.remove('hidden');
    fieldSettingsPopup.classList.add('visible');
  };

  showPopup();

  const hidePopup = () => {
    fieldSettingsPopup.classList.add('hidden');
    fieldSettingsPopup.classList.remove('visible');
  };

  closeBtn.addEventListener('click', hidePopup);

  const dragStart = (event) => {
    const draggedElement = event.target;
    if (draggedElement && draggedElement.classList.contains('draggable')) {
      draggedElement.classList.add('dragging');
      event.dataTransfer.setData(
        'text',
        draggedElement.getAttribute('data-field-name'),
      );
    }
  };

  const dragEnd = (event) => {
    const draggedElement = event.target;
    draggedElement.classList.remove('dragging');
  };

  const dragOver = (event) => {
    event.preventDefault();
  };

  const drop = (event) => {
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

      if (Array.isArray(section)) {
        if (!section.includes(fieldName)) {
          section.push(fieldName);
        } else return;
      } else if (section instanceof Set) {
        if (!section.has(fieldName)) section.add(fieldName);
        else return;
      }

      const li = document.createElement('li');
      li.textContent = fieldName;
      target.appendChild(li);

      const checkbox = Array.from(fieldsList.querySelectorAll('li'))
        .find((li) => li.getAttribute('data-field-name') === fieldName)
        .querySelector('input');
      checkbox.checked = true;
    }
  };

  fieldsList.addEventListener('dragstart', dragStart);
  fieldsList.addEventListener('dragend', dragEnd);

  allSections.forEach((section) => {
    section.addEventListener('dragover', dragOver);
    section.addEventListener('drop', drop);
  });

  populateFields();

  applyBtn.addEventListener('click', () => {
    hidePopup();
  });
}
