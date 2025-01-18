// Sélection des éléments HTML
const inputType = document.getElementById("input-type");
const inputValue = document.getElementById("input-value");
const convertBtn = document.getElementById("convert-btn");
const output = document.getElementById("output");
const visualizer = document.getElementById("visualizer");

// Fonction pour convertir SMILES ↔ IUPAC via PubChem
async function convert() {
    const type = inputType.value;
    const value = inputValue.value.trim();
    if (!value) {
        output.textContent = "Veuillez entrer une valeur.";
        return;
    }

    const url =
        type === "smiles"
            ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${value}/property/IUPACName/JSON`
            : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${value}/property/CanonicalSMILES/JSON`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Conversion échouée. Vérifiez votre entrée.");
        }
        const data = await response.json();
        const result =
            type === "smiles"
                ? data.PropertyTable.Properties[0].IUPACName
                : data.PropertyTable.Properties[0].CanonicalSMILES;
        output.textContent = `Résultat : ${result}`;

        // Visualisation de la molécule
        if (type === "smiles") {
            visualizeMolecule(value);
        } else {
            visualizeMolecule(result);
        }
    } catch (error) {
        output.textContent = `Erreur : ${error.message}`;
    }
}

// Fonction pour visualiser une molécule en 3D
function visualizeMolecule(smiles) {
    const viewer = $3Dmol.createViewer(visualizer, { backgroundColor: "white" });
    viewer.addModel(smiles, "smi"); // Ajouter le SMILES
    viewer.setStyle({}, { stick: {} });
    viewer.zoomTo();
    viewer.render();
    viewer.zoom(1.2, 500);
}

// Écouteur pour le bouton
convertBtn.addEventListener("click", convert);
