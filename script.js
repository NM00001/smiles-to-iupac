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

    // Vérification des entrées
    if (!value) {
        output.textContent = "Veuillez entrer une valeur valide.";
        return;
    }

    // Définir l'URL de l'API en fonction du type
    const url =
        type === "smiles"
            ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${value}/property/IUPACName/JSON`
            : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${value}/property/CanonicalSMILES/JSON`;

    try {
        // Effectuer la requête API
        const response = await fetch(url);

        // Vérifier si la réponse est correcte
        if (!response.ok) {
            throw new Error("Erreur lors de la conversion. Vérifiez votre entrée.");
        }

        // Traiter les données retournées
        const data = await response.json();
        const result =
            type === "smiles"
                ? data.PropertyTable.Properties[0].IUPACName
                : data.PropertyTable.Properties[0].CanonicalSMILES;

        // Afficher le résultat
        output.textContent = `Résultat : ${result}`;

        // Visualiser la molécule si possible (SMILES uniquement)
        if (type === "smiles") {
            visualizeMolecule(value);
        } else {
            visualizeMolecule(result);
        }
    } catch (error) {
        // Afficher un message d'erreur
        output.textContent = `Erreur : ${error.message}`;
    }
}

// Fonction pour visualiser une molécule en 3D avec 3Dmol.js
function visualizeMolecule(smiles) {
    // Effacer le visualiseur précédent
    visualizer.innerHTML = "";

    // Créer un nouveau visualiseur
    const viewer = $3Dmol.createViewer(visualizer, { backgroundColor: "white" });
    viewer.addModel(smiles, "smi"); // Ajouter le SMILES
    viewer.setStyle({}, { stick: {} }); // Style des molécules
    viewer.zoomTo();
    viewer.render();
    viewer.zoom(1.2, 500);
}

// Ajout d'un écouteur pour le bouton
convertBtn.addEventListener("click", convert);
