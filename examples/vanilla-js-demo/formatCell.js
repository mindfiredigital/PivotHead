import temp from "./constant.js";

export function formatCellPopUp(config, PivotEngine) {
    const dynamicData = config.measures;
    console.log(dynamicData);

    engine = new PivotEngine(config);

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
        { name: "Decimal Separator", options: [",", "."] },
        // { name: "Decimal Places", options: Array.from({ length: 9 }, (_, i) => (i + 1).toString()) },
        { name: "Currency Symbol", options: ["Dollar ($)", "Rupees (₹)"] },
        { name: "Currency Align", options: ["Left", "Right"] },
        // { name: "Null Value", options: ["None", "Null"] },
        { name: "Format as Percent", options: ["Yes", "No"] },
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
    applyButton.style.padding = "10px 20px";
    applyButton.style.backgroundColor = "#fff";
    applyButton.style.color = "#000";
    applyButton.style.border = "none";
    applyButton.style.borderRadius = "4px";
    applyButton.style.cursor = "pointer";
    applyButton.style.border = "1px solid #000";
    applyButton.style.margin = "0px 10px";

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.padding = "10px 20px";
    cancelButton.style.backgroundColor = "#fff";
    cancelButton.style.color = "#000";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "4px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.border = "1px solid #000";
    cancelButton.style.margin = "0px 10px";

    cancelButton.addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    applyButton.addEventListener("click", () => {
        console.log("Selected Values:", dropdownValues);
        let engine = new PivotEngine(config);
        PivotEngine.prototype.formatValue = function (value, field) {
            // Search in measures first
            const measure = config.measures.find((m) => m.uniqueName === field);

            if (measure && measure.format?.type === 'currency') {
                const format = measure.format || {};
                const { symbol, align } = format;

                // Format the currency value
                const formattedValue = value
                    .toFixed(temp.decimalPlaces)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, temp.thousandSeparator)
                    .replace('.', temp.decimalSeparator);

                return `${symbol || temp.currencySymbol}${formattedValue}`

            }

            // If not found in measures, check in dimensions
            const dimension = config.dimensions.find((dim) => dim.field === field);

            if (dimension && dimension.format?.type === 'currency') {
                const format = dimension.format || {};
                const { symbol, align } = format;

                // Format the currency value
                const formattedValue = value
                    .toFixed(temp.decimalPlaces)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, temp.thousandSeparator)
                    .replace('.', temp.decimalSeparator);

                return `${symbol || temp.currencySymbol}${formattedValue}`
            }

            // Return the original value if it's not a currency type
            return value;
        };
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
