'use strict';
import { logger } from '../../logger.js';
import { appState } from '../../state.js';

export function formatCellPopUp(config, PivotEngine) {
  // Get available measures from the engine
  const state = appState.pivotEngine.getState();
  const availableMeasures = state.measures || [];

  const ac = new AbortController();
  const { signal } = ac;

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
  popup.style.width = '400px';
  popup.style.padding = '20px';
  popup.style.backgroundColor = '#fff';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

  const header = document.createElement('h2');
  header.textContent = 'Format Cell';
  header.style.margin = '5px';
  header.style.textAlign = 'left';

  const headerSeparator = document.createElement('hr');
  headerSeparator.style.border = '0';
  headerSeparator.style.height = '1px';
  headerSeparator.style.backgroundColor = '#ccc';
  headerSeparator.style.margin = '10px 0';

  const formContainer = document.createElement('div');

  // Updated fields with proper options
  const fields = [
    {
      name: 'Choose Value',
      options: ['None', ...availableMeasures.map(measure => measure.caption)],
    },
    { name: 'Text Align', options: ['Left', 'Right', 'Center'] },
    { name: 'Thousand Separator', options: ['None', 'Comma', 'Space', 'Dot'] },
    { name: 'Decimal Separator', options: ['.', ','] },
    {
      name: 'Decimal Places',
      options: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
    {
      name: 'Currency Symbol',
      options: ['Dollar ($)', 'Rupees (₹)', 'Euro (€)'],
    },
    { name: 'Currency Align', options: ['Left', 'Right'] },
    { name: 'Null Value', options: ['None', 'Null', '0', 'N/A', '-'] },
    { name: 'Format as Percent', options: ['No', 'Yes'] },
  ];

  const dropdownValues = fields.map(field => ({
    field: field.name,
    value: field.options[0],
  }));

  const dropdownElements = [];

  fields.forEach((field, index) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '15px';

    const label = document.createElement('label');
    label.textContent = `${field.name}:`;
    label.style.flex = '1';
    label.style.marginRight = '10px';

    const dropdown = document.createElement('select');
    dropdown.style.flex = '2';
    dropdown.style.padding = '10px';
    dropdown.style.borderRadius = '4px';
    dropdown.style.border = '1px solid #ccc';

    // Populate the dropdown with options
    field.options.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      dropdown.appendChild(option);
    });

    // Disable all fields except "Choose Value" initially
    if (index !== 0) {
      dropdown.disabled = true;
    }

    // Enable/disable other fields based on "Choose Value" selection
    if (index === 0) {
      dropdown.addEventListener(
        'change',
        e => {
          const selectedValue = e.target.value;
          dropdownValues[index].value = selectedValue;

          if (selectedValue !== 'None') {
            // Enable all other dropdowns
            dropdownElements.forEach((dropdown, i) => {
              if (i !== 0) {
                dropdown.disabled = false;
              }
            });
          } else {
            // Disable all other dropdowns
            dropdownElements.forEach((dropdown, i) => {
              if (i !== 0) {
                dropdown.disabled = true;
              }
            });
          }
        },
        { signal }
      );
    }

    dropdown.addEventListener(
      'change',
      e => {
        dropdownValues[index].value = e.target.value;
      },
      { signal }
    );

    row.appendChild(label);
    row.appendChild(dropdown);
    formContainer.appendChild(row);
    dropdownElements.push(dropdown);
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.marginTop = '20px';

  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply';
  applyButton.style.padding = '12px 24px';
  applyButton.style.backgroundColor = '#28a745';
  applyButton.style.color = '#fff';
  applyButton.style.border = 'none';
  applyButton.style.borderRadius = '6px';
  applyButton.style.cursor = 'pointer';
  applyButton.style.fontSize = '16px';
  applyButton.style.fontWeight = 'bold';
  applyButton.style.margin = '0px 10px';
  applyButton.style.transition =
    'background-color 0.3s ease, transform 0.2s ease';

  applyButton.addEventListener(
    'mouseover',
    () => {
      applyButton.style.backgroundColor = '#218838';
      applyButton.style.transform = 'scale(1.05)';
    },
    { signal }
  );

  applyButton.addEventListener(
    'mouseout',
    () => {
      applyButton.style.backgroundColor = '#28a745';
      applyButton.style.transform = 'scale(1)';
    },
    { signal }
  );

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '12px 24px';
  cancelButton.style.backgroundColor = '#dc3545';
  cancelButton.style.color = '#fff';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '6px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.fontSize = '16px';
  cancelButton.style.fontWeight = 'bold';
  cancelButton.style.margin = '0px 10px';
  cancelButton.style.transition =
    'background-color 0.3s ease, transform 0.2s ease';

  cancelButton.addEventListener(
    'mouseover',
    () => {
      cancelButton.style.backgroundColor = '#c82333';
      cancelButton.style.transform = 'scale(1.05)';
    },
    { signal }
  );

  cancelButton.addEventListener(
    'mouseout',
    () => {
      cancelButton.style.backgroundColor = '#dc3545';
      cancelButton.style.transform = 'scale(1)';
    },
    { signal }
  );

  const cleanup = () => {
    ac.abort();
    if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
  };

  cancelButton.addEventListener(
    'click',
    () => {
      cleanup();
    },
    { signal }
  );

  applyButton.addEventListener(
    'click',
    () => {
      logger.info('Selected Values:', dropdownValues);

      logger.info(
        'Text Align:',
        dropdownValues.find(item => item.field === 'Text Align')?.value
      );
      logger.info(
        'Currency Align:',
        dropdownValues.find(item => item.field === 'Currency Align')?.value
      );

      // Get the selected measure
      const selectedMeasure = dropdownValues.find(
        item => item.field === 'Choose Value'
      )?.value;

      if (selectedMeasure && selectedMeasure !== 'None') {
        // Find the corresponding measure
        const measure = availableMeasures.find(
          m => m.caption === selectedMeasure
        );

        if (measure) {
          // Map UI selections to internal formatting values
          let currencySymbol = dropdownValues.find(
            item => item.field === 'Currency Symbol'
          )?.value;
          let currency = 'USD';
          if (currencySymbol?.includes('Dollar')) currency = 'USD';
          else if (currencySymbol?.includes('Rupees')) currency = 'INR';
          else if (currencySymbol?.includes('Euro')) currency = 'EUR';

          // Thousand Separator mapping
          let thousandSeparatorVal = dropdownValues.find(
            item => item.field === 'Thousand Separator'
          )?.value;
          let thousandSeparator = ','; // default
          if (thousandSeparatorVal === 'None') thousandSeparator = '';
          else if (thousandSeparatorVal === 'Space') thousandSeparator = ' ';
          else if (thousandSeparatorVal === 'Comma') thousandSeparator = ',';
          else if (thousandSeparatorVal === 'Dot') thousandSeparator = '.';

          // Decimal Separator mapping
          let decimalSeparator =
            dropdownValues.find(item => item.field === 'Decimal Separator')
              ?.value || '.';

          // Decimal Places
          let decimals = parseInt(
            dropdownValues.find(item => item.field === 'Decimal Places')?.value,
            10
          );
          if (isNaN(decimals)) decimals = 2; // default

          // Text Align
          let textAlign =
            dropdownValues
              .find(item => item.field === 'Text Align')
              ?.value?.toLowerCase() || 'right';

          // Currency Align
          let currencyAlign =
            dropdownValues
              .find(item => item.field === 'Currency Align')
              ?.value?.toLowerCase() || 'left';

          // Null Value
          let nullValue = dropdownValues.find(
            item => item.field === 'Null Value'
          )?.value;
          if (nullValue === 'None') nullValue = '';
          else if (nullValue === 'Null') nullValue = null;
          // Otherwise use the selected value as is

          // Percent Format
          let formatAsPercent = dropdownValues.find(
            item => item.field === 'Format as Percent'
          )?.value;
          let percent = formatAsPercent === 'Yes';

          // Determine format type
          let formatType = 'number';
          if (percent) formatType = 'percentage';
          else if (currency !== 'USD' || currencySymbol)
            formatType = 'currency';

          // Create the enhanced format object
          const enhancedFormat = {
            type: formatType,
            currency: currency,
            locale: 'en-US',
            decimals: decimals,
            thousandSeparator: thousandSeparator,
            decimalSeparator: decimalSeparator,
            align: textAlign,
            currencyAlign: currencyAlign,
            nullValue: nullValue,
            percent: percent,
          };

          // Use the enhanced engine's updateFieldFormatting method
          appState.pivotEngine.updateFieldFormatting(
            measure.uniqueName,
            enhancedFormat
          );

          logger.info(
            'Updated Field Formatting using enhanced engine:',
            enhancedFormat
          );
        }
      } else {
        logger.info('No valid measure selected. Config unchanged.');
      }

      // Close the popup
      cleanup();
    },
    { signal }
  );

  buttonContainer.appendChild(applyButton);
  buttonContainer.appendChild(cancelButton);

  popup.appendChild(header);
  popup.appendChild(headerSeparator);
  popup.appendChild(formContainer);
  popup.appendChild(buttonContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
