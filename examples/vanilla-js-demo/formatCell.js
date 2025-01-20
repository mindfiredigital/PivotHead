import { formatTable } from "./main.js"
export function formatCellPopUp(config, PivotEngine) {
    const dynamicData = config.measures.filter(measure => measure.format.type === "currency");

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
    popup.style.width = "400px";
    popup.style.padding = "20px";
    popup.style.backgroundColor = "#fff";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

    const header = document.createElement("h2");
    header.textContent = "Format Cell";
    header.style.margin = "5px";
    header.style.textAlign = "left";

    const headerSeparator = document.createElement("hr");
    headerSeparator.style.border = "0";
    headerSeparator.style.height = "1px";
    headerSeparator.style.backgroundColor = "#ccc";
    headerSeparator.style.margin = "10px 0";

    const formContainer = document.createElement("div");

    // Updated "Choose Value" to show dynamic measure captions
    const fields = [
        { name: "Choose Value", options: ["None", ...dynamicData.map(measure => measure.caption)] },
        // { name: "Text Align", options: ["Left", "Right"] },
        // { name: "Thousand Separator", options: ["Space", "Comma", "Dot"] },
        // { name: "Decimal Separator", options: [",", "."] },
        { name: "Decimal Places", options: Array.from({ length: 9 }, (_, i) => (i + 1).toString()) },
        { name: "Currency Symbol", options: ["Dollar ($)", "Rupees (₹)"] },
        // { name: "Currency Align", options: ["Left", "Right"] },
        // { name: "Null Value", options: ["None", "Null"] },
        // { name: "Format as Percent", options: ["Yes", "No"] },
    ];

    const dropdownValues = fields.map((field) => ({ field: field.name, value: field.options[0] }));

    const dropdownElements = [];

    fields.forEach((field, index) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.marginBottom = "15px";

        const label = document.createElement("label");
        label.textContent = `${field.name}:`;
        label.style.flex = "1";
        label.style.marginRight = "10px";

        const dropdown = document.createElement("select");
        dropdown.style.flex = "2";
        dropdown.style.padding = "10px";
        dropdown.style.borderRadius = "4px";
        dropdown.style.border = "1px solid #ccc";

        // Populate the dropdown with dynamic options
        field.options.forEach((optionText) => {
            const option = document.createElement("option");
            option.value = optionText;
            option.textContent = optionText;
            dropdown.appendChild(option);
        });

        // Disable all fields except "Choose Value"
        if (index !== 0) {
            dropdown.disabled = true;
        }

        if (index === 0) {
            dropdown.addEventListener("change", (e) => {
                const selectedValue = e.target.value;
                if (selectedValue !== "None") {
                    dropdownElements.forEach((dropdown, i) => {
                        if (i !== 0) {
                            dropdown.disabled = false;
                        }
                    });
                } else {
                    dropdownElements.forEach((dropdown, i) => {
                        if (i !== 0) {
                            dropdown.disabled = true;
                        }
                    });
                }
            });
        }

        dropdown.addEventListener("change", (e) => {
            dropdownValues[index].value = e.target.value;
        });

        row.appendChild(label);
        row.appendChild(dropdown);
        formContainer.appendChild(row);
        dropdownElements.push(dropdown);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.marginTop = "20px";

    const applyButton = document.createElement("button");
    applyButton.textContent = "Apply";
    applyButton.style.padding = "12px 24px";
    applyButton.style.backgroundColor = "#28a745";
    applyButton.style.color = "#fff";
    applyButton.style.border = "none";
    applyButton.style.borderRadius = "6px";
    applyButton.style.cursor = "pointer";
    applyButton.style.fontSize = "16px";
    applyButton.style.fontWeight = "bold";
    applyButton.style.margin = "0px 10px";
    applyButton.style.transition = "background-color 0.3s ease, transform 0.2s ease";
    applyButton.addEventListener("mouseover", () => {
        applyButton.style.backgroundColor = "#218838";
        applyButton.style.transform = "scale(1.05)";
    });
    applyButton.addEventListener("mouseout", () => {
        applyButton.style.backgroundColor = "#28a745";
        applyButton.style.transform = "scale(1)";
    });

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.padding = "12px 24px";
    cancelButton.style.backgroundColor = "#dc3545";
    cancelButton.style.color = "#fff";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "6px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontSize = "16px";
    cancelButton.style.fontWeight = "bold";
    cancelButton.style.margin = "0px 10px";
    cancelButton.style.transition = "background-color 0.3s ease, transform 0.2s ease";
    cancelButton.addEventListener("mouseover", () => {
        cancelButton.style.backgroundColor = "#c82333";
        cancelButton.style.transform = "scale(1.05)";
    });
    cancelButton.addEventListener("mouseout", () => {
        cancelButton.style.backgroundColor = "#dc3545";
        cancelButton.style.transform = "scale(1)";
    });

    cancelButton.addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    applyButton.addEventListener("click", () => {
        console.log("Selected Values:", dropdownValues);

        // Extract the selected "Choose Value" field
        const selectedMeasure = dropdownValues.find(item => item.field === "Choose Value")?.value;

        if (selectedMeasure && selectedMeasure !== "None") {
            // Find the corresponding measure in the config
            const measure = config.measures.find(m => m.caption === selectedMeasure);

            if (measure) {
                // Update the measure's format based on the dropdown selections
                measure.format = {
                    type: "currency",
                    currency: dropdownValues.find(item => item.field === "Currency Symbol")?.value.includes("Dollar") ? "USD" : "INR",
                    locale: "en-US",
                    decimals: parseInt(dropdownValues.find(item => item.field === "Decimal Places")?.value, 10) || 2,
                    // decimalSeparator: dropdownValues.find(item => item.field === "Decimal Separator")?.value || ".",
                    // align: dropdownValues.find(item => item.field === "Currency Align")?.value || "Left",
                    // percent: dropdownValues.find(item => item.field === "Format as Percent")?.value === "Yes",
                };
                config.formatting[measure.uniqueName] = {
                    type: "currency",
                    currency: measure.format.currency,
                    locale: measure.format.locale,
                    decimals: measure.format.decimals,
                    // percent: measure.format.percent,
                };

                console.log("Updated Measure Format:", measure.format);
            }
        } else {
            console.log("No valid measure selected. Config unchanged.");
        }

        console.log("Updated Config:", config); // Log the updated config for debugging
        formatTable(config)
        document.body.removeChild(overlay); // Remove the popup
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
