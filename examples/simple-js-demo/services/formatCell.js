// Updated formatcell.js file
// This integrates with the new cell formatting system

import { formatTable } from '../index.js';

export function formatCellPopUp(config, PivotEngine) {
  // Get all measures, not just currency ones
  const allMeasures = config.measures || [];

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
  popup.style.width = '450px'; // Slightly wider
  popup.style.padding = '20px';
  popup.style.backgroundColor = '#fff';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

  const header = document.createElement('h2');
  header.textContent = 'Format Cells (Field-Level)';
  header.style.margin = '5px';
  header.style.textAlign = 'left';

  const headerSeparator = document.createElement('hr');
  headerSeparator.style.border = '0';
  headerSeparator.style.height = '1px';
  headerSeparator.style.backgroundColor = '#ccc';
  headerSeparator.style.margin = '10px 0';

  // Add info text
  const infoText = document.createElement('p');
  infoText.textContent =
    'This applies formatting to all cells for the selected field. For individual cell formatting, use the "🎨 Format Cells" button.';
  infoText.style.fontSize = '12px';
  infoText.style.color = '#666';
  infoText.style.marginBottom = '15px';
  infoText.style.fontStyle = 'italic';

  const formContainer = document.createElement('div');

  // Enhanced fields with more options
  const fields = [
    {
      name: 'Choose Field',
      options: [
        'None',
        ...allMeasures.map(measure => measure.caption || measure.uniqueName),
      ],
    },
    {
      name: 'Format Type',
      options: ['Currency', 'Number', 'Percentage', 'Date'],
    },
    {
      name: 'Decimal Places',
      options: ['0', '1', '2', '3', '4'],
    },
    {
      name: 'Currency Symbol',
      options: ['Dollar ($)', 'Euro (€)', 'Pound (£)', 'Rupee (₹)', 'Yen (¥)'],
    },
    {
      name: 'Locale',
      options: ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'hi-IN'],
    },
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
    label.style.fontWeight = '500';

    const dropdown = document.createElement('select');
    dropdown.style.flex = '2';
    dropdown.style.padding = '8px';
    dropdown.style.borderRadius = '4px';
    dropdown.style.border = '1px solid #ccc';
    dropdown.style.fontSize = '14px';

    field.options.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      dropdown.appendChild(option);
    });

    // Disable fields except "Choose Field" initially
    if (index !== 0) {
      dropdown.disabled = true;
    }

    // Handle "Choose Field" change
    if (index === 0) {
      dropdown.addEventListener('change', e => {
        const selectedValue = e.target.value;
        if (selectedValue !== 'None') {
          // Enable other dropdowns
          dropdownElements.forEach((dropdown, i) => {
            if (i !== 0) {
              dropdown.disabled = false;
            }
          });
        } else {
          // Disable other dropdowns
          dropdownElements.forEach((dropdown, i) => {
            if (i !== 0) {
              dropdown.disabled = true;
            }
          });
        }
      });
    }

    // Handle "Format Type" change
    if (index === 1) {
      dropdown.addEventListener('change', e => {
        const formatType = e.target.value;
        const currencyDropdown = dropdownElements[3]; // Currency Symbol dropdown

        // Show/hide currency symbol based on format type
        if (formatType === 'Currency') {
          currencyDropdown.disabled = false;
          currencyDropdown.style.opacity = '1';
        } else {
          currencyDropdown.disabled = true;
          currencyDropdown.style.opacity = '0.5';
        }
      });
    }

    dropdown.addEventListener('change', e => {
      dropdownValues[index].value = e.target.value;
    });

    row.appendChild(label);
    row.appendChild(dropdown);
    formContainer.appendChild(row);
    dropdownElements.push(dropdown);
  });

  // Preview section
  const previewContainer = document.createElement('div');
  previewContainer.style.marginTop = '15px';
  previewContainer.style.padding = '10px';
  previewContainer.style.backgroundColor = '#f8f9fa';
  previewContainer.style.borderRadius = '4px';
  previewContainer.style.border = '1px solid #e9ecef';

  const previewLabel = document.createElement('label');
  previewLabel.textContent = 'Preview:';
  previewLabel.style.fontWeight = '500';
  previewLabel.style.display = 'block';
  previewLabel.style.marginBottom = '5px';

  const previewValue = document.createElement('div');
  previewValue.textContent = '1234.56';
  previewValue.style.fontSize = '16px';
  previewValue.style.fontWeight = 'bold';
  previewValue.style.color = '#007bff';

  previewContainer.appendChild(previewLabel);
  previewContainer.appendChild(previewValue);

  // Update preview function
  function updatePreview() {
    const formatType = dropdownValues.find(
      item => item.field === 'Format Type'
    )?.value;
    const decimals =
      parseInt(
        dropdownValues.find(item => item.field === 'Decimal Places')?.value
      ) || 2;
    const currencySymbol = dropdownValues.find(
      item => item.field === 'Currency Symbol'
    )?.value;
    const locale = dropdownValues.find(item => item.field === 'Locale')?.value;

    let sampleValue = 1234.56;
    let formattedValue = '';

    try {
      switch (formatType) {
        case 'Currency':
          const currency = getCurrencyCode(currencySymbol);
          formattedValue = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(sampleValue);
          break;
        case 'Number':
          formattedValue = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(sampleValue);
          break;
        case 'Percentage':
          formattedValue = new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: decimals,
          }).format(sampleValue / 100);
          break;
        case 'Date':
          formattedValue = new Date().toLocaleDateString(locale);
          break;
        default:
          formattedValue = sampleValue.toString();
      }
    } catch (error) {
      formattedValue = 'Preview Error';
    }

    previewValue.textContent = formattedValue;
  }

  // Add change listeners to update preview
  dropdownElements.forEach(dropdown => {
    dropdown.addEventListener('change', updatePreview);
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

  applyButton.addEventListener('mouseover', () => {
    applyButton.style.backgroundColor = '#218838';
    applyButton.style.transform = 'scale(1.05)';
  });
  applyButton.addEventListener('mouseout', () => {
    applyButton.style.backgroundColor = '#28a745';
    applyButton.style.transform = 'scale(1)';
  });

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

  cancelButton.addEventListener('mouseover', () => {
    cancelButton.style.backgroundColor = '#c82333';
    cancelButton.style.transform = 'scale(1.05)';
  });
  cancelButton.addEventListener('mouseout', () => {
    cancelButton.style.backgroundColor = '#dc3545';
    cancelButton.style.transform = 'scale(1)';
  });

  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  applyButton.addEventListener('click', () => {
    console.log('Field-level formatting applied:', dropdownValues);

    const selectedField = dropdownValues.find(
      item => item.field === 'Choose Field'
    )?.value;
    const formatType = dropdownValues.find(
      item => item.field === 'Format Type'
    )?.value;

    if (selectedField && selectedField !== 'None') {
      // Find the corresponding measure
      const measure = allMeasures.find(
        m =>
          (m.caption && m.caption === selectedField) ||
          m.uniqueName === selectedField
      );

      if (measure) {
        const decimals =
          parseInt(
            dropdownValues.find(item => item.field === 'Decimal Places')?.value
          ) || 2;
        const currencySymbol = dropdownValues.find(
          item => item.field === 'Currency Symbol'
        )?.value;
        const locale = dropdownValues.find(
          item => item.field === 'Locale'
        )?.value;

        // Update measure format
        const newFormat = {
          type: formatType.toLowerCase(),
          locale: locale,
          decimals: decimals,
        };

        if (formatType === 'Currency') {
          newFormat.currency = getCurrencyCode(currencySymbol);
        }

        measure.format = newFormat;

        // Also update config.formatting for consistency
        if (!config.formatting) {
          config.formatting = {};
        }
        config.formatting[measure.uniqueName] = newFormat;

        console.log('Updated measure format:', measure.format);
        console.log('Updated config:', config);

        // Refresh the table
        formatTable(config);
      } else {
        console.error('Measure not found:', selectedField);
      }
    } else {
      console.log('No field selected.');
    }

    document.body.removeChild(overlay);
  });

  // Helper function to get currency code
  function getCurrencyCode(currencyDisplay) {
    const currencyMap = {
      'Dollar ($)': 'USD',
      'Euro (€)': 'EUR',
      'Pound (£)': 'GBP',
      'Rupee (₹)': 'INR',
      'Yen (¥)': 'JPY',
    };
    return currencyMap[currencyDisplay] || 'USD';
  }

  buttonContainer.appendChild(applyButton);
  buttonContainer.appendChild(cancelButton);

  popup.appendChild(header);
  popup.appendChild(headerSeparator);
  popup.appendChild(infoText);
  popup.appendChild(formContainer);
  popup.appendChild(previewContainer);
  popup.appendChild(buttonContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Initial preview update
  updatePreview();
}
