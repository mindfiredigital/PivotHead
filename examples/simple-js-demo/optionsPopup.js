export function createOptionsPopup() {
  // Create the overlay
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

  // Create the popup container
  const popup = document.createElement('div');
  popup.style.width = '500px';
  popup.style.padding = '20px';
  popup.style.backgroundColor = '#fff';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

  // Header with buttons
  const headerContainer = document.createElement('div');
  headerContainer.style.display = 'flex';
  headerContainer.style.justifyContent = 'space-between';
  headerContainer.style.alignItems = 'center';
  headerContainer.style.marginBottom = '20px';

  const header = document.createElement('h3');
  header.textContent = 'Popup Header';
  header.style.margin = '0';

  const buttonContainer = document.createElement('div');

  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply';
  applyButton.style.padding = '8px 16px';
  applyButton.style.backgroundColor = '#fff';
  applyButton.style.color = '#000';
  applyButton.style.border = '1px solid #000';
  applyButton.style.borderRadius = '4px';
  applyButton.style.cursor = 'pointer';
  applyButton.style.marginLeft = '10px';

  applyButton.addEventListener('click', () => {
    const selectedData = {};
    const groups = formContainer.querySelectorAll('.radio-group');
    groups.forEach(group => {
      const title = group.dataset.title;
      const selectedRadio = group.querySelector("input[type='radio']:checked");
      selectedData[title] = selectedRadio
        ? selectedRadio.value
        : 'None Selected';
    });
    console.log(selectedData); // Log the selected data
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

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);

  headerContainer.appendChild(header);
  headerContainer.appendChild(buttonContainer);

  // Function to create a title with 4 radio buttons
  const createRadioButtonGroup = titleText => {
    const groupContainer = document.createElement('div');
    groupContainer.classList.add('radio-group');
    groupContainer.dataset.title = titleText;

    const title = document.createElement('h4');
    title.textContent = titleText;
    title.style.color = 'gray';
    title.style.marginBottom = '10px';

    const radioContainer = document.createElement('div');
    radioContainer.style.display = 'flex';
    radioContainer.style.flexDirection = 'column';
    radioContainer.style.gap = '5px';

    for (let i = 1; i <= 4; i++) {
      const radioLabel = document.createElement('label');
      radioLabel.style.display = 'flex';
      radioLabel.style.alignItems = 'center';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = titleText;
      radio.value = `Option ${i}`;
      radio.style.marginRight = '5px';

      radioLabel.appendChild(radio);
      radioLabel.appendChild(document.createTextNode(`Option ${i}`));
      radioContainer.appendChild(radioLabel);
    }

    groupContainer.appendChild(title);
    groupContainer.appendChild(radioContainer);

    return groupContainer;
  };

  // Add radio button groups (3 titles)
  const formContainer = document.createElement('div');
  formContainer.style.display = 'grid';
  formContainer.style.gridTemplateColumns = '1fr 1fr';
  formContainer.style.gap = '20px';

  formContainer.appendChild(createRadioButtonGroup('Title 1'));
  formContainer.appendChild(createRadioButtonGroup('Title 2'));
  formContainer.appendChild(createRadioButtonGroup('Title 3'));

  // Append everything to the popup
  popup.appendChild(headerContainer);
  popup.appendChild(formContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
