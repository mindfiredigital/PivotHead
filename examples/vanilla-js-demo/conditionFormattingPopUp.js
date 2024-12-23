export function conditionFormattingPopUp() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";

  const popup = document.createElement("div");
  popup.style.width = "600px";
  popup.style.padding = "20px";
  popup.style.backgroundColor = "#fff";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  const headerContainer = document.createElement("div");
  headerContainer.style.display = "flex";
  headerContainer.style.justifyContent = "space-between";
  headerContainer.style.alignItems = "center";
  headerContainer.style.marginBottom = "10px";

  const header = document.createElement("h2");
  header.textContent = "Popup Header";
  header.style.margin = "0";

  const buttonContainer = document.createElement("div");

  const addButton = document.createElement("button");
  addButton.textContent = "+";
  addButton.style.padding = "8px 16px";
  addButton.style.backgroundColor = "#fff";
  addButton.style.color = "#000";
  addButton.style.border = "1px solid #000";
  addButton.style.borderRadius = "4px";
  addButton.style.cursor = "pointer";
  addButton.style.marginRight = "10px";

  addButton.addEventListener("click", () => {
    alert("Add button clicked!");
  });

  const applyButton = document.createElement("button");
  applyButton.textContent = "Apply";
  applyButton.style.padding = "8px 16px";
  applyButton.style.backgroundColor = "#fff";
  applyButton.style.color = "#000";
  applyButton.style.border = "1px solid #000";
  applyButton.style.borderRadius = "4px";
  applyButton.style.cursor = "pointer";
  applyButton.style.margin = "0px 10px";

  applyButton.addEventListener("click", () => {
    alert("Apply button clicked!");
  });

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.padding = "8px 16px";
  cancelButton.style.backgroundColor = "#fff";
  cancelButton.style.color = "#000";
  cancelButton.style.border = "1px solid #000";
  cancelButton.style.borderRadius = "4px";
  cancelButton.style.cursor = "pointer";

  cancelButton.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  buttonContainer.appendChild(addButton);
  buttonContainer.appendChild(applyButton);
  buttonContainer.appendChild(cancelButton);

 

  headerContainer.appendChild(header);
  headerContainer.appendChild(buttonContainer);

  const separator = document.createElement("hr");
  separator.style.border = "0";
  separator.style.height = "1px";
  separator.style.backgroundColor = "#ccc";
  separator.style.margin = "10px 0";

  const formContainer = document.createElement("div");

  for (let i = 1; i <= 2; i++) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.marginBottom = "20px";

    const label = document.createElement("label");
    label.textContent = `Label ${i}`;
    label.style.flex = "1";
    label.style.marginRight = "10px";

    row.appendChild(label);

    for (let j = 1; j <= 3; j++) {
      const dropdown = document.createElement("select");
      dropdown.style.flex = "1";
      dropdown.style.padding = "10px";
      dropdown.style.marginRight = j < 3 ? "10px" : "0";
      dropdown.style.borderRadius = "4px";
      dropdown.style.border = "1px solid #ccc";

      ["Option 1", "Option 2", "Option 3"].forEach((optionText) => {
        const option = document.createElement("option");
        option.value = optionText;
        option.textContent = optionText;
        dropdown.appendChild(option);
      });

      row.appendChild(dropdown);
    }

    formContainer.appendChild(row);
  }

  popup.appendChild(headerContainer);
  popup.appendChild(separator);
  popup.appendChild(formContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
