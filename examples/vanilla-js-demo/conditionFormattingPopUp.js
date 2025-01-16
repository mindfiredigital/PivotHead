function createConditionFormattingPopup({ onApply, onCancel }) {
  // Create overlay
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
  popup.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  popup.style.width = '600px';
  popup.style.padding = '24px';

  // Create header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '16px';

  const title = document.createElement('h2');
  title.textContent = 'Conditional formatting';
  title.style.fontSize = '20px';
  title.style.fontWeight = '600';

  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.gap = '8px';

  const addButton = createButton('+', 'border');
  const applyButton = createButton('APPLY', 'primary');
  const cancelButton = createButton('CANCEL', 'secondary');

  buttonGroup.append(addButton, applyButton, cancelButton);
  header.append(title, buttonGroup);

  // Create divider
  const divider = document.createElement('hr');
  divider.style.margin = '16px 0';
  divider.style.border = 'none';
  divider.style.borderTop = '1px solid #e5e7eb';

  // Create conditions container
  const conditionsContainer = document.createElement('div');
  conditionsContainer.style.display = 'flex';
  conditionsContainer.style.flexDirection = 'column';
  conditionsContainer.style.gap = '24px';

  // Add initial condition
  addCondition(conditionsContainer);

  // Close function
  const close = () => {
    document.body.removeChild(overlay);
  };

  // Event listeners
  addButton.addEventListener('click', () => {
    addCondition(conditionsContainer);
    updateRemoveButtons(conditionsContainer);
  });
  applyButton.addEventListener('click', () => {
    const conditions = Array.from(conditionsContainer.children).map(
      getConditionData,
    );
    onApply(conditions);
    close();
  });
  cancelButton.addEventListener('click', () => {
    close();
    onCancel();
  });

  // Assemble popup
  popup.append(header, divider, conditionsContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  return { overlay, close };
}

function createButton(text, variant) {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.padding = variant === '+' ? '4px 12px' : '4px 16px';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontWeight = '500';

  switch (variant) {
    case 'primary':
      button.style.backgroundColor = '#28a745';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.padding = '10px 15px';
      break;
    case 'secondary':
      button.style.backgroundColor = ' #dc3545';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.padding = '10px 15px';
      break;
    case 'border':
      button.style.backgroundColor = 'white';
      button.style.border = '1px solid #d1d5db';
      button.style.color = '#374151';
      break;
  }

  return button;
}

function addCondition(container) {
  const conditionWrapper = document.createElement('div');
  conditionWrapper.style.position = 'relative';
  conditionWrapper.style.width = '100%';

  const condition = document.createElement('div');
  condition.style.display = 'flex';
  condition.style.flexDirection = 'column';
  condition.style.gap = '16px';

  // Value row
  const valueRow = createFormRow('Value:', [
    createSelect(['All values', 'Number', 'Text']),
    createSelect(['Greater than', 'Less than', 'Equal to']), // Add 'Between' to list in future.
    createInput('text', ''),
  ]);

  // Add "between" input when needed
  const operatorSelect = valueRow.querySelector('select:nth-child(2)');
  operatorSelect.addEventListener('change', (e) => {
    const existingBetween = valueRow.querySelector('.between-input');
    if (e.target.value === 'Between' && !existingBetween) {
      const betweenGroup = document.createElement('div');
      betweenGroup.className = 'between-input';
      betweenGroup.style.display = 'flex';
      betweenGroup.style.alignItems = 'center';
      betweenGroup.style.gap = '8px';

      const andText = document.createElement('span');
      andText.textContent = '&';
      const secondInput = createInput('text', '');

      betweenGroup.append(andText, secondInput);
      valueRow.insertBefore(betweenGroup, valueRow.lastChild);
    } else if (e.target.value !== 'Between' && existingBetween) {
      existingBetween.remove();
    }
  });

  // Format row
  const formatRow = createFormRow('Format:', [
    createSelect(['Trebuchet MS', 'Arial', 'Times New Roman']),
    createSelect(['12px', '14px', '16px']),
    createColorInput('#000000'),
    createBackgroundColorInput('#FFFFFF'),
  ]);

  // Remove button
  const removeButton = document.createElement('button');
  removeButton.innerHTML = '&#10005;'; // 'x' symbol
  removeButton.style.position = 'absolute';
  removeButton.style.right = '0';
  removeButton.style.top = '0';
  removeButton.style.padding = '8px';
  removeButton.style.color = '#6b7280';
  removeButton.style.backgroundColor = 'transparent';
  removeButton.style.border = 'none';
  removeButton.style.cursor = 'pointer';
  removeButton.style.fontSize = '16px';
  removeButton.style.display = 'none'; // Initially hidden

  removeButton.addEventListener('click', () => {
    conditionWrapper.remove();
    updateRemoveButtons(container);
  });

  condition.append(valueRow, formatRow);
  conditionWrapper.appendChild(condition);
  conditionWrapper.appendChild(removeButton);

  // Set a data attribute to identify if it's the first condition
  conditionWrapper.dataset.isFirst = container.children.length === 0;

  container.appendChild(conditionWrapper);
  updateRemoveButtons(container);
}

function createFormRow(label, inputs) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.gap = '16px';
  row.style.position = 'relative';

  const labelElement = document.createElement('span');
  labelElement.textContent = label;
  labelElement.style.width = '64px';

  row.appendChild(labelElement);
  inputs.forEach((input) => row.appendChild(input));

  return row;
}

function createSelect(options) {
  const select = document.createElement('select');
  select.style.padding = '8px';
  select.style.border = '1px solid #d1d5db';
  select.style.borderRadius = '4px';
  select.style.backgroundColor = 'white';

  options.forEach((optionText) => {
    const option = document.createElement('option');
    option.value = optionText;
    option.textContent = optionText;
    select.appendChild(option);
  });

  return select;
}

function createInput(type, value) {
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  input.style.padding = '8px';
  input.style.border = '1px solid #d1d5db';
  input.style.borderRadius = '4px';
  input.style.width = type === 'text' ? '100px' : 'auto';
  return input;
}

function createColorInput(defaultColor) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '32px';
  wrapper.style.height = '32px';

  const input = document.createElement('input');
  input.type = 'color';
  input.value = defaultColor;
  input.style.position = 'absolute';
  input.style.inset = '0';
  input.style.opacity = '0';
  input.style.cursor = 'pointer';

  const preview = document.createElement('div');
  preview.style.width = '100%';
  preview.style.height = '100%';
  preview.style.backgroundColor = defaultColor;
  preview.style.border = '1px solid #d1d5db';
  preview.style.borderRadius = '4px';

  input.addEventListener('input', (e) => {
    preview.style.backgroundColor = e.target.value;
  });

  wrapper.append(preview, input);
  return wrapper;
}

function createBackgroundColorInput(defaultColor) {
  const wrapper = document.createElement('div');
  wrapper.style.width = '128px';
  wrapper.style.height = '32px';
  wrapper.style.position = 'relative';

  const input = document.createElement('input');
  input.type = 'color';
  input.value = defaultColor;
  input.style.position = 'absolute';
  input.style.inset = '0';
  input.style.opacity = '0';
  input.style.cursor = 'pointer';

  const preview = document.createElement('div');
  preview.style.width = '100%';
  preview.style.height = '100%';
  preview.style.backgroundColor = defaultColor;
  preview.style.border = '1px solid #d1d5db';
  preview.style.borderRadius = '4px';

  input.addEventListener('input', (e) => {
    preview.style.backgroundColor = e.target.value;
  });

  wrapper.append(preview, input);
  return wrapper;
}

function getConditionData(conditionWrapper) {
  const condition = conditionWrapper.firstChild;
  const [valueRow, formatRow] = condition.children;
  const valueSelects = valueRow.querySelectorAll('select');
  const valueInputs = valueRow.querySelectorAll('input[type="text"]');
  const formatSelects = formatRow.querySelectorAll('select');
  const formatColors = formatRow.querySelectorAll('input[type="color"]');

  return {
    value: {
      type: valueSelects[0].value,
      operator: valueSelects[1].value,
      value1: valueInputs[0].value,
      value2: valueInputs[1]?.value || '',
    },
    format: {
      font: formatSelects[0].value,
      size: formatSelects[1].value,
      color: formatColors[0].value,
      backgroundColor: formatColors[1].value,
    },
  };
}

function updateRemoveButtons(container) {
  const conditionWrappers = container.children;
  Array.from(conditionWrappers).forEach((wrapper, index) => {
    const removeButton = wrapper.querySelector('button');
    if (index === 0 && wrapper.dataset.isFirst === 'true') {
      removeButton.style.display = 'none';
    } else {
      removeButton.style.display = 'block';
    }
  });
}

export function conditionFormattingPopUp(config) {
  // Ensure config is an object
  if (typeof config !== 'object' || config === null) {
    config = {};
  }

  createConditionFormattingPopup({
    onApply: (conditions) => {
      console.log('Applied conditions:', conditions);
      // Update the formatting configuration
      if (!config.hasOwnProperty('conditionalFormatting')) {
        config.conditionalFormatting = [];
      }
      config.conditionalFormatting = conditions;
      // Apply the formatting directly
      applyConditionalFormatting(config);
    },
    onCancel: () => {
      console.log('Conditional formatting cancelled');
    },
  });
}

function applyConditionalFormatting(config) {
  const table = document.querySelector('#pivotTable table');
  if (!table) {
    console.error('Pivot table not found');
    return;
  }

  if (
    !config.conditionalFormatting ||
    !Array.isArray(config.conditionalFormatting)
  ) {
    console.warn('No conditional formatting rules found');
    return;
  }

  const cells = table.querySelectorAll('td');
  cells.forEach((cell) => {
    const cellValue = cell.textContent.trim();
    let value = parseFloat(cellValue.replace(/[^0-9.-]+/g, ''));

    // Reset styles before applying new formatting
    cell.style.fontFamily = '';
    cell.style.fontSize = '';
    cell.style.color = '';
    cell.style.backgroundColor = '';

    config.conditionalFormatting.forEach((rule) => {
      if (
        rule.value.type === 'All values' ||
        (rule.value.type === 'Number' && !isNaN(value))
      ) {
        let applyFormat = false;
        switch (rule.value.operator) {
          case 'Greater than':
            applyFormat = value > parseFloat(rule.value.value1);
            break;
          case 'Less than':
            applyFormat = value < parseFloat(rule.value.value1);
            break;
          case 'Equal to':
            applyFormat = value === parseFloat(rule.value.value1);
            break;
          case 'Between':
            applyFormat =
              value >= parseFloat(rule.value.value1) &&
              value <= parseFloat(rule.value.value2);
            break;
        }
        if (applyFormat) {
          cell.style.fontFamily = rule.format.font;
          cell.style.fontSize = rule.format.size;
          cell.style.color = rule.format.color;
          cell.style.backgroundColor = rule.format.backgroundColor;
        }
      }
    });
  });
}
