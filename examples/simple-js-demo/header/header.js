import { formatCellPopUp } from '../services/formatCell.js';
import { createOptionsPopup } from '../services/optionsPopup.js';
import { conditionFormattingPopUp } from '../services/conditionFormattingPopUp.js';
import { createFieldsPopup } from '../services/fieldsPopup.js';
import { dataSourceOptions } from '../services/dataSourceOptions.js';
import { pivotEngine } from '../index.js';
import {
  exportToHTML,
  exportToExcel,
  exportToPDF,
  openPrintDialog,
} from '../services/exportService.js';

export function createHeader(config) {
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.padding = '10px 20px';
  header.style.backgroundColor = '#f3f4f6';
  header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  header.style.position = 'fixed';
  header.style.top = '0';
  header.style.left = '0';
  header.style.right = '0';
  header.style.zIndex = '1000';

  function createOption(icon, label, dropdownOptions) {
    const option = document.createElement('div');
    option.style.position = 'relative';
    option.style.display = 'flex';
    option.style.flexDirection = 'column';
    option.style.alignItems = 'center';
    option.style.margin = '0 10px';
    option.style.cursor = 'pointer';

    // Icon element
    const iconElement = document.createElement('div');
    iconElement.textContent = icon;
    iconElement.style.fontSize = '24px';

    // Label element
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    labelElement.style.fontSize = '12px';
    labelElement.style.color = '#4b5563';

    // Dropdown container
    const dropdown = document.createElement('div');
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.right = '0';
    dropdown.style.backgroundColor = '#ffffff';
    dropdown.style.border = '1px solid #d1d5db';
    dropdown.style.borderRadius = '10px';
    dropdown.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    dropdown.style.display = 'none';
    dropdown.style.flexDirection = 'column';
    dropdown.style.padding = '5px';
    dropdown.style.zIndex = '1000';
    dropdown.style.width = 'max-content';
    dropdown.style.whiteSpace = 'nowrap';

    // Populate dropdown if options are provided
    if (dropdownOptions && dropdownOptions.length) {
      dropdownOptions.forEach(optionName => {
        const dropdownItem = document.createElement('div');
        dropdownItem.textContent = optionName;
        dropdownItem.style.padding = '8px 16px';
        dropdownItem.style.cursor = 'pointer';
        dropdownItem.style.fontSize = '14px';
        dropdownItem.style.backgroundColor = '#ffffff';
        dropdownItem.style.transition = 'background-color 0.3s';

        // Dropdown item click logic
        dropdownItem.addEventListener('click', () => {
          console.log(optionName);
          switch (optionName) {
            case 'Format Cell':
              formatCellPopUp(config);
              break;
            case 'Condition Formatting':
              conditionFormattingPopUp();
              break;
            case 'Options':
              createOptionsPopup();
              break;
            case 'To Local JSON':
              dataSourceOptions(config);
              break;
            case 'Print':
              dropdown.style.display = 'none';
              openPrintDialog(pivotEngine);
              break;
            case 'To HTML':
              dropdown.style.display = 'none';
              console.log('Exporting to HTML...');
              exportToHTML(pivotEngine);
              break;
            case 'To Excel':
              dropdown.style.display = 'none';
              console.log('Exporting to Excel...');
              exportToExcel(pivotEngine);
              break;
            case 'To PDF':
              dropdown.style.display = 'none';
              console.log('Exporting to PDF...');
              exportToPDF(pivotEngine);
              break;
            default:
              alert(optionName + ` is under development`);
          }
        });

        // Hover effects for dropdown items
        dropdownItem.addEventListener('mouseover', () => {
          dropdownItem.style.backgroundColor = '#f3f4f6';
        });

        dropdownItem.addEventListener('mouseout', () => {
          dropdownItem.style.backgroundColor = '#ffffff';
        });

        dropdown.appendChild(dropdownItem);
      });
    } else {
      // Fallback for no dropdown options
      option.addEventListener('click', () => {
        console.log('label clicked: ' + label);
        switch (label) {
          case 'Options':
            createOptionsPopup();
            break;
          case 'Fields':
            createFieldsPopup();
            break;
          default:
            alert(label);
        }
      });
    }

    // Append elements to the option container
    option.appendChild(iconElement);
    option.appendChild(labelElement);
    option.appendChild(dropdown);

    // Show dropdown on hover
    option.addEventListener('mouseover', () => {
      dropdown.style.display = 'flex';
    });

    // Hide dropdown when mouse leaves
    option.addEventListener('mouseout', () => {
      dropdown.style.display = 'none';
    });

    return option;
  }

  const leftSection = document.createElement('div');
  leftSection.style.display = 'flex';

  const rightSection = document.createElement('div');
  rightSection.style.display = 'flex';

  const leftOptions = [
    {
      icon: '🔗',
      label: 'Connect',
      dropdownOptions: ['To Local CSV', 'To Local JSON'],
    },

    {
      icon: '📤',
      label: 'Export',
      dropdownOptions: ['Print', 'To HTML', 'To Excel', 'To PDF'],
    },
  ];

  const rightOptions = [
    {
      icon: '↕️',
      label: 'Format',
      dropdownOptions: ['Format Cell', 'Condition Formatting'],
    },
    // { icon: '⚙️', label: 'Options', dropdownOptions: [] },
    { icon: '📋', label: 'Fields', dropdownOptions: [] },
  ];

  leftOptions.forEach(option =>
    leftSection.appendChild(
      createOption(option.icon, option.label, option.dropdownOptions)
    )
  );

  rightOptions.forEach(option =>
    rightSection.appendChild(
      createOption(option.icon, option.label, option.dropdownOptions)
    )
  );

  header.appendChild(leftSection);
  header.appendChild(rightSection);

  document.body.appendChild(header);
}
