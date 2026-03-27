'use strict';
import { appState } from '../../state.js';

export function dataSourceOptions(config) {
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
  header.textContent = 'Choose JSON File';
  header.style.margin = '5px';
  header.style.textAlign = 'left';

  const headerSeparator = document.createElement('hr');
  headerSeparator.style.border = '0';
  headerSeparator.style.height = '1px';
  headerSeparator.style.backgroundColor = '#ccc';
  headerSeparator.style.margin = '10px 0';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';

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
    async () => {
      window.confirm('Are you sure to change the data source to JSON file!');
      const file = fileInput.files[0];
      if (file) {
        // Set the dataSource to the selected file
        config.dataSource = {
          type: 'file',
          file,
        };
        // also update the data use core package method to read data from file
        config.data = await appState.pivotEngine.readFileData(
          config.dataSource.file
        );
        appState.onFormatTable(config);
        cleanup();
      } else {
        alert('Please select a JSON file.');
      }
    },
    { signal }
  );

  const topButtonContainer = document.createElement('div');
  topButtonContainer.style.display = 'flex';
  topButtonContainer.style.justifyContent = 'center';
  topButtonContainer.style.marginBottom = '20px';

  const topButton = document.createElement('button');
  topButton.textContent = 'Upload JSON File';
  topButton.style.padding = '12px 24px';
  topButton.style.backgroundColor = '#007bff';
  topButton.style.color = '#fff';
  topButton.style.border = 'none';
  topButton.style.borderRadius = '6px';
  topButton.style.cursor = 'pointer';
  topButton.style.fontSize = '16px';
  topButton.style.fontWeight = 'bold';
  topButton.style.transition =
    'background-color 0.3s ease, transform 0.2s ease';
  topButton.addEventListener(
    'mouseover',
    () => {
      topButton.style.backgroundColor = '#0056b3';
      topButton.style.transform = 'scale(1.05)';
    },
    { signal }
  );
  topButton.addEventListener(
    'mouseout',
    () => {
      topButton.style.backgroundColor = '#007bff';
      topButton.style.transform = 'scale(1)';
    },
    { signal }
  );

  topButton.addEventListener(
    'click',
    () => {
      fileInput.click();
    },
    { signal }
  );

  topButtonContainer.appendChild(topButton);

  buttonContainer.appendChild(applyButton);
  buttonContainer.appendChild(cancelButton);

  popup.appendChild(header);
  popup.appendChild(headerSeparator);
  popup.appendChild(topButtonContainer);
  popup.appendChild(buttonContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
