// Select HTML elements
const inputType = document.getElementById("input-type");
const inputValue = document.getElementById("input-value");
const convertBtn = document.getElementById("convert-btn");
const output = document.getElementById("output");
const visualizer = document.getElementById("visualizer");
const loadingIndicator = document.getElementById("loading"); // Add a loading indicator in HTML

// Function to enable/disable the convert button
function toggleConvertBtn() {
    if (inputType.value && inputValue.value.trim()) {
        convertBtn.disabled = false;
    } else {
        convertBtn.disabled = true;
    }
}

// Add event listeners for input fields
inputType.addEventListener("change", toggleConvertBtn);
inputValue.addEventListener("input", toggleConvertBtn);

// Function to convert SMILES ↔ IUPAC via PubChem API
async function convert() {
    const type = inputType.value.toLowerCase();
    const value = inputValue.value.trim();

    // Show loading indicator and clear output
    loadingIndicator.style.display = "block";
    output.textContent = "";
    visualizer.innerHTML = "";

    try {
        // Validate input type
        if (!["smiles", "iupac"].includes(type)) {
            throw new Error("Type must be 'smiles' or 'iupac'.");
        }

        // Construct API URL based on input type
        let apiUrl;
        if (type === "smiles") {
            apiUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(value)}/property/IUPACName/JSON`;
        } else {
            apiUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(value)}/property/CanonicalSMILES/JSON`;
        }

        // Fetch data from PubChem API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();

        // Check if there are properties returned
        if (!data.PropertyTable || !data.PropertyTable.Properties || data.PropertyTable.Properties.length === 0) {
            throw new Error("No data returned from the API.");
        }

        // Extract the result based on input type
        const property = data.PropertyTable.Properties[0];
        const result = type === "smiles" ? property.IUPACName : property.CanonicalSMILES;

        // Display the result
        output.textContent = `Résultat : ${result}`;

        // Visualize the molecule
        visualizeMolecule(type === "smiles" ? value : result);

    } catch (error) {
        // Display error message
        output.textContent = `Erreur : ${error.message}`;
    } finally {
        // Hide loading indicator
        loadingIndicator.style.display = "none";
    }
}

// Function to visualize a molecule using 3Dmol.js
function visualizeMolecule(smiles) {
    // Ensure 3Dmol.js is loaded
    if (typeof $3Dmol === "undefined") {
        output.textContent += "\n3Dmol.js n'est pas chargé.";
        return;
    }

    // Clear previous visualization
    visualizer.innerHTML = "";

    // Create a new viewer
    const viewer = $3Dmol.createViewer(visualizer, { backgroundColor: "white" });

    // Add the molecule model
    viewer.addModel(smiles, "smi");

    // Set style for the molecule
    viewer.setStyle({}, { stick: {} });

    // Zoom and render the molecule
    viewer.zoomTo();
    viewer.render();
    viewer.zoom(1.2, 500);
}

// Add event listener for the convert button
convertBtn.addEventListener("click", convert);
