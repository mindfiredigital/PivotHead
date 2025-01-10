export function conditionFormattingPopUp() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';

  const popup = document.createElement('div');
  popup.style.width = '500px';
  popup.style.padding = '20px';
  popup.style.backgroundColor = '#fff';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

  const headerContainer = document.createElement('div');
  headerContainer.style.display = 'flex';
  headerContainer.style.justifyContent = 'space-between';
  headerContainer.style.alignItems = 'center';
  headerContainer.style.marginBottom = '10px';

  const header = document.createElement('h2');
  header.textContent = 'Condition Formatting';
  header.style.margin = '0';

  const buttonContainer = document.createElement('div');

  const addButton = document.createElement('button');
  addButton.textContent = '+';
  addButton.style.padding = '8px 16px';
  addButton.style.backgroundColor = '#fff';
  addButton.style.color = '#000';
  addButton.style.border = '1px solid #000';
  addButton.style.borderRadius = '4px';
  addButton.style.cursor = 'pointer';
  addButton.style.marginRight = '10px';

  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply';
  applyButton.style.padding = '8px 16px';
  applyButton.style.backgroundColor = '#fff';
  applyButton.style.color = '#000';
  applyButton.style.border = '1px solid #000';
  applyButton.style.borderRadius = '4px';
  applyButton.style.cursor = 'pointer';
  applyButton.style.marginRight = '10px';

  applyButton.addEventListener('click', () => {
    const values = [];
    Array.from(formContainer.children).forEach((row) => {
      const dropdowns = row.querySelectorAll('select');
      const dropdownValues = Array.from(dropdowns).map(
        (dropdown) => dropdown.value,
      );
      const buttonColors = {
        buttonAColor: row.querySelector('.button-a').style.color || 'default',
        buttonBBackground:
          row.querySelector('.button-b').style.backgroundColor || 'default',
      };
      values.push({ dropdownValues, buttonColors });
    });
    console.log(values);
    document.body.removeChild(overlay);
  });

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '8px 16px';
  cancelButton.style.backgroundColor = '#fff';
  cancelButton.style.color = '#000';
  cancelButton.style.border = '1px solid #000';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';

  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  buttonContainer.appendChild(addButton);
  buttonContainer.appendChild(applyButton);
  buttonContainer.appendChild(cancelButton);

  headerContainer.appendChild(header);
  headerContainer.appendChild(buttonContainer);

  const separator = document.createElement('hr');
  separator.style.border = '0';
  separator.style.height = '1px';
  separator.style.backgroundColor = '#ccc';
  separator.style.margin = '10px 0';

  const formContainer = document.createElement('div');

  function createRow(container) {
    const row = document.createElement('div');
    row.style.marginBottom = '20px';

    const labelRow = document.createElement('div');
    labelRow.style.display = 'flex';
    labelRow.style.alignItems = 'center';
    labelRow.style.gap = '10px';
    labelRow.style.marginBottom = '10px';

    const labelText = document.createElement('span');
    labelText.textContent = 'Label:';
    labelText.style.flex = '0 0 60px';

    for (let i = 1; i <= 3; i++) {
      const dropdown = document.createElement('select');
      dropdown.style.padding = '10px';
      dropdown.style.borderRadius = '4px';
      dropdown.style.border = '1px solid #ccc';
      ['Option 1', 'Option 2', 'Option 3'].forEach((text) => {
        const option = document.createElement('option');
        option.value = text;
        option.textContent = text;
        dropdown.appendChild(option);
      });
      labelRow.appendChild(dropdown);
    }

    labelRow.insertBefore(labelText, labelRow.firstChild);

    const crossButton = document.createElement('button');
    crossButton.textContent = '✖';
    crossButton.style.border = 'none';
    crossButton.style.background = 'transparent';
    crossButton.style.cursor = 'pointer';
    crossButton.style.color = '#000';
    crossButton.style.margin = '0 20px';

    crossButton.addEventListener('click', () => {
      container.removeChild(row);
    });

    labelRow.appendChild(crossButton);

    const valueRow = document.createElement('div');
    valueRow.style.display = 'flex';
    valueRow.style.alignItems = 'center';
    valueRow.style.gap = '10px';

    const valueText = document.createElement('span');
    valueText.textContent = 'Value:';
    valueText.style.flex = '0 0 60px';

    for (let i = 1; i <= 2; i++) {
      const dropdown = document.createElement('select');
      dropdown.style.padding = '10px';
      dropdown.style.borderRadius = '4px';
      dropdown.style.border = '1px solid #ccc';
      ['Option A', 'Option B', 'Option C'].forEach((text) => {
        const option = document.createElement('option');
        option.value = text;
        option.textContent = text;
        dropdown.appendChild(option);
      });
      valueRow.appendChild(dropdown);
    }

    const buttonA = document.createElement('button');
    buttonA.textContent = 'A';
    buttonA.className = 'button-a';
    buttonA.style.padding = '8px';
    buttonA.style.border = '1px solid #ccc';
    buttonA.style.borderRadius = '4px';
    buttonA.style.cursor = 'pointer';

    buttonA.addEventListener('click', (event) => {
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.style.position = 'absolute';
      colorPicker.style.zIndex = '1001';
      colorPicker.style.border = 'none';
      colorPicker.style.width = '100px';
      colorPicker.style.height = '50px';

      // Position the color picker above the button
      const buttonRect = event.target.getBoundingClientRect();
      colorPicker.style.left = `${buttonRect.left}px`;
      colorPicker.style.top = `${buttonRect.top - 40}px`;

      document.body.appendChild(colorPicker);

      colorPicker.addEventListener('input', (event) => {
        buttonA.style.color = event.target.value;
      });

      colorPicker.addEventListener('change', () => {
        document.body.removeChild(colorPicker);
      });

      colorPicker.click();
    });
    const buttonB = document.createElement('button');
    buttonB.textContent = 'B';
    buttonB.className = 'button-b';
    buttonB.style.padding = '8px';
    buttonB.style.border = '1px solid #ccc';
    buttonB.style.borderRadius = '4px';
    buttonB.style.cursor = 'pointer';

    buttonB.addEventListener('click', (event) => {
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.style.position = 'absolute';
      colorPicker.style.zIndex = '1001';
      colorPicker.style.border = 'none';
      colorPicker.style.width = '100px';
      colorPicker.style.height = '50px';

      const buttonRect = event.target.getBoundingClientRect();
      colorPicker.style.left = `${buttonRect.left - 20}px`;
      colorPicker.style.top = `${buttonRect.top - 60}px`;

      document.body.appendChild(colorPicker);

      colorPicker.addEventListener('input', (event) => {
        buttonB.style.backgroundColor = event.target.value;
      });

      colorPicker.addEventListener('change', () => {
        document.body.removeChild(colorPicker);
      });

      colorPicker.click();
    });

    valueRow.appendChild(buttonA);
    valueRow.appendChild(buttonB);

    valueRow.insertBefore(valueText, valueRow.firstChild);

    const removeButton = document.createElement('button');
    removeButton.textContent = '✖';
    removeButton.style.border = 'none';
    removeButton.style.background = 'transparent';
    removeButton.style.cursor = 'pointer';
    removeButton.style.color = 'red';

    removeButton.addEventListener('click', () => {
      container.removeChild(row);
    });

    row.appendChild(labelRow);
    row.appendChild(valueRow);
    // row.appendChild(removeButton);
    container.appendChild(row);
  }

  // Initial rows
  createRow(formContainer);
  createRow(formContainer);

  addButton.addEventListener('click', () => {
    createRow(formContainer);
  });

  popup.appendChild(headerContainer);
  popup.appendChild(separator);
  popup.appendChild(formContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
