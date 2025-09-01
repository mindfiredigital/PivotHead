import type { PivotHeadHost } from './host';
import type { FormatOptions } from '../../types/types';

export function showFormatPopup(host: PivotHeadHost): void {
  if (!host.engine) {
    console.error('Engine not initialized');
    return;
  }

  const state = host.engine.getState();
  const availableMeasures = state.measures || [];

  // Get available fields based on current mode - only numeric/measure fields
  let availableFields: string[] = [];
  if (host._showRawData) {
    // For raw data, get only numeric fields (measures) from the data
    if (state.rawData && state.rawData.length > 0) {
      const allFields = Object.keys(state.rawData[0]);
      // Filter to only include measure fields (price, discount, etc.)
      availableFields = allFields.filter(field => {
        const sampleValue = state.rawData[0][field];
        return typeof sampleValue === 'number';
      });
    }
  } else {
    // For processed data, get measure names
    availableFields = availableMeasures.map(
      measure => measure.caption || measure.uniqueName
    );
  }

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
  header.textContent = 'Format cells';
  header.style.margin = '0 0 10px 0';
  header.style.textAlign = 'left';

  const headerSeparator = document.createElement('hr');
  headerSeparator.style.border = '0';
  headerSeparator.style.height = '1px';
  headerSeparator.style.backgroundColor = '#ccc';
  headerSeparator.style.margin = '10px 0';

  const formContainer = document.createElement('div');

  // Form fields configuration
  const fields = [
    {
      name: 'Choose value',
      options: ['Choose value', 'All values', ...availableFields],
    },
    { name: 'Text align', options: ['right', 'left', 'center'] },
    {
      name: 'Thousand separator',
      options: ['(Space)', '(Comma)', '(None)', '(Dot)'],
    },
    { name: 'Decimal separator', options: ['.', ','] },
    { name: 'Decimal places', options: ['None', '0', '1', '2', '3', '4', '5'] },
    { name: 'Currency symbol', options: ['', '$', '₹', '€', '£'] },
    { name: 'Currency align', options: ['left', 'right'] },
    { name: 'Null value', options: ['', 'null', '0', 'N/A', '-'] },
    { name: 'Format as percent', options: ['false', 'true'] },
  ];

  const formValues: Record<string, string> = {};
  const dropdownElements: HTMLSelectElement[] = [];

  fields.forEach((field, index) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '15px';

    const label = document.createElement('label');
    label.textContent = field.name;
    label.style.flex = '1';
    label.style.marginRight = '10px';
    label.style.textAlign = 'left';

    const dropdown = document.createElement('select');
    dropdown.style.flex = '2';
    dropdown.style.padding = '8px';
    dropdown.style.borderRadius = '4px';
    dropdown.style.border = '1px solid #ccc';

    // Populate dropdown options
    field.options.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      dropdown.appendChild(option);
    });

    // Set initial value
    formValues[field.name] = field.options[0];

    // Disable all fields except first one initially
    if (index !== 0) {
      dropdown.disabled = true;
    }

    // Handle change events
    dropdown.addEventListener('change', e => {
      const target = e.target as HTMLSelectElement;
      formValues[field.name] = target.value;

      // Enable/disable other fields based on first field
      if (index === 0) {
        const selectedValue = target.value;
        dropdownElements.forEach((el, i) => {
          if (i !== 0) {
            el.disabled = selectedValue === 'Choose value';
          }
        });
      }
    });

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
  applyButton.textContent = 'APPLY';
  applyButton.style.padding = '10px 20px';
  applyButton.style.backgroundColor = '#666';
  applyButton.style.color = '#fff';
  applyButton.style.border = 'none';
  applyButton.style.borderRadius = '4px';
  applyButton.style.cursor = 'pointer';
  applyButton.style.marginRight = '10px';

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'CANCEL';
  cancelButton.style.padding = '10px 20px';
  cancelButton.style.backgroundColor = '#f5f5f5';
  cancelButton.style.color = '#333';
  cancelButton.style.border = '1px solid #ccc';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';

  // Event handlers
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  applyButton.addEventListener('click', () => {
    const selectedField = formValues['Choose value'];

    if (selectedField && selectedField !== 'Choose value') {
      // Map UI values to FormatOptions
      const formatOptions: FormatOptions = {};

      // Text align
      if (formValues['Text align']) {
        formatOptions.align = formValues['Text align'] as
          | 'left'
          | 'right'
          | 'center';
      }

      // Thousand separator
      const thousandSep = formValues['Thousand separator'];
      if (thousandSep === '(Space)') formatOptions.thousandSeparator = ' ';
      else if (thousandSep === '(Comma)') formatOptions.thousandSeparator = ',';
      else if (thousandSep === '(None)') formatOptions.thousandSeparator = '';
      else if (thousandSep === '(Dot)') formatOptions.thousandSeparator = '.';

      // Decimal separator
      if (formValues['Decimal separator']) {
        formatOptions.decimalSeparator = formValues['Decimal separator'];
      }

      // Decimal places
      if (
        formValues['Decimal places'] &&
        formValues['Decimal places'] !== 'None'
      ) {
        formatOptions.decimals = parseInt(formValues['Decimal places'], 10);
      }

      // Currency
      const currencySymbol = formValues['Currency symbol'];
      if (currencySymbol) {
        formatOptions.type = 'currency';
        if (currencySymbol === '$') formatOptions.currency = 'USD';
        else if (currencySymbol === '₹') formatOptions.currency = 'INR';
        else if (currencySymbol === '€') formatOptions.currency = 'EUR';
        else if (currencySymbol === '£') formatOptions.currency = 'GBP';
      }

      // Currency align
      if (formValues['Currency align']) {
        formatOptions.currencyAlign = formValues['Currency align'] as
          | 'left'
          | 'right';
      }

      // Null value
      if (formValues['Null value']) {
        formatOptions.nullValue =
          formValues['Null value'] === 'null' ? null : formValues['Null value'];
      }

      // Format as percent
      if (formValues['Format as percent'] === 'true') {
        formatOptions.percent = true;
        formatOptions.type = 'percentage';
      }

      // Apply formatting
      try {
        if (host.engine) {
          if (selectedField === 'All values') {
            // Apply to all numeric fields
            if (host._showRawData) {
              // For raw data, apply to all numeric fields
              if (state.rawData && state.rawData.length > 0) {
                const allFields = Object.keys(state.rawData[0]);
                const numericFields = allFields.filter(field => {
                  const sampleValue = state.rawData[0][field];
                  return typeof sampleValue === 'number';
                });
                numericFields.forEach(field => {
                  if (host.engine) {
                    host.engine.updateFieldFormatting(field, formatOptions);
                  }
                });
                console.log(
                  'Applied formatting to all numeric fields:',
                  numericFields
                );
              }
            } else {
              // For processed data, apply to all measures
              availableMeasures.forEach(measure => {
                if (host.engine) {
                  host.engine.updateFieldFormatting(
                    measure.uniqueName,
                    formatOptions
                  );
                }
              });
              console.log(
                'Applied formatting to all measures:',
                availableMeasures.map(m => m.uniqueName)
              );
            }
          } else {
            // Apply to specific field
            let fieldName = selectedField;
            if (!host._showRawData) {
              // For processed data, find the measure's uniqueName
              const measure = availableMeasures.find(
                m =>
                  m.caption === selectedField || m.uniqueName === selectedField
              );
              if (measure) {
                fieldName = measure.uniqueName;
              }
            }

            host.engine.updateFieldFormatting(fieldName, formatOptions);
            console.log(
              'Applied formatting:',
              formatOptions,
              'to field:',
              fieldName
            );
          }

          // Trigger re-render
          host._renderSwitch();
        }
      } catch (error) {
        console.error('Error applying formatting:', error);
      }
    }

    document.body.removeChild(overlay);
  });

  buttonContainer.appendChild(applyButton);
  buttonContainer.appendChild(cancelButton);

  popup.appendChild(header);
  popup.appendChild(headerSeparator);
  popup.appendChild(formContainer);
  popup.appendChild(buttonContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
