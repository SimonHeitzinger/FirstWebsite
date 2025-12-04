// quader/script.js

'use strict';

// Die lokale getPathPrefix() Funktion WIRD HIER ENTFERNT, 
// da wir jetzt die globale Funktion aus menuLoader.js verwenden.

document.addEventListener('DOMContentLoaded', (event) => {
    // Stellen Sie sicher, dass menuLoader.js geladen wurde und die Funktion bereitstellt
    if (typeof window.getPathPrefix !== 'function') {
        console.error("Fehler: window.getPathPrefix ist nicht verfügbar. Bitte menuLoader.js vor diesem Skript laden.");
        return; 
    }

    // --- 1. DOM Referenzen setzen (lokal) ---
    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const unitLengthSelector = document.getElementById('unitLength');
    const unitWidthSelector = document.getElementById('unitWidth');
    const unitHeightSelector = document.getElementById('unitHeight');
    const materialSelector = document.getElementById('materialSelector');
    const autoScaleButton = document.getElementById('autoScaleButton');

    // Referenzen zu den Ausgabefeldern
    const resultSelectors = {
        resultArea: document.getElementById('resultArea'),
        resultVolume: document.getElementById('resultVolume'),
        resultWeight: document.getElementById('resultWeight'),
        unitAreaSelector: document.getElementById('unitAreaSelector'),
        unitVolumeSelector: document.getElementById('unitVolumeSelector'),
        unitWeightSelector: document.getElementById('unitWeightSelector')
    };

    // --- 2. Datenhaltung (lokale Variablen & Materialdaten) ---
    const calculationData = {
        globalSurfaceAreaM2: 0,
        globalVolumeM3: 0,
        globalWeightKg: 0
    };
    
    let materialsData = []; // Hier werden die JSON-Daten gespeichert

    
    // --- Funktion zum Laden der Materialien ---
    function loadMaterials() {
        // Verwenden der globalen Funktion, um den korrekten Pfad zu finden
        const materialPath = window.getPathPrefix() + 'data/materials.json';

        fetch(materialPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(materials => {
                materialsData = materials; // Daten in der Variable speichern

                materials.forEach(material => {
                    const option = document.createElement('option');
                    option.value = material.id; // Speichern Sie die ID als Wert
                    option.textContent = material.name; 
                    materialSelector.appendChild(option);
                });
                
                // Nachdem die Materialien geladen sind, initialisieren wir den Rechner
                initializeCalculator(); 
            })
            .catch(error => {
                console.error('Fehler beim Laden der Materialien:', error);
                document.getElementById('resultWeight').textContent = 'Fehler beim Laden der Materialien.';
            });
    }

    // --- 3. Spezifische Berechnungslogik (calculate & handleAutoScale) ---
    
    function calculate() {
        const lengthValue = parseFloat(lengthInput.value);
        const widthValue = parseFloat(widthInput.value);
        const heightValue = parseFloat(heightInput.value);
        
        if (isNaN(lengthValue) || isNaN(widthValue) || isNaN(heightInput.value) || lengthValue <= 0 || widthValue <= 0 || heightValue <= 0) {
            resultSelectors.resultArea.textContent = 'Ungültig';
            return;
        }

        const factors = window.Geometry.UNIT_FACTORS_TO_METER;

        const lengthMeters = lengthValue * factors[unitLengthSelector.value];
        const widthMeters = widthValue * factors[unitWidthSelector.value];
        const heightMeters = heightValue * factors[unitHeightSelector.value];

        calculationData.globalSurfaceAreaM2 = 2 * (lengthMeters * widthMeters + widthMeters * heightMeters + heightMeters * lengthMeters);
        calculationData.globalVolumeM3 = lengthMeters * widthMeters * heightMeters;

        // Dichte aus der JS-Variable materialsData abrufen
        const selectedMaterialId = materialSelector.value;
        const selectedMaterial = materialsData.find(m => m.id === selectedMaterialId);
        
        if (selectedMaterial) {
            const density = selectedMaterial.density; // Verwenden Sie die Dichte aus dem JSON
            calculationData.globalWeightKg = density * calculationData.globalVolumeM3; 
        } else {
            calculationData.globalWeightKg = 0;
        }

        window.Geometry.updateResultDisplay(calculationData, resultSelectors);
    }
    
    function handleAutoScale() {
        const bestAreaUnit = window.Geometry.findAppropriateUnit(calculationData.globalSurfaceAreaM2, '²');
        const bestVolumeUnit = window.Geometry.findAppropriateUnit(calculationData.globalVolumeM3, '³');
        const bestWeightUnit = window.Geometry.findAppropriateWeightUnit(calculationData.globalWeightKg);

        resultSelectors.unitAreaSelector.value = bestAreaUnit;
        resultSelectors.unitVolumeSelector.value = bestVolumeUnit;
        resultSelectors.unitWeightSelector.value = bestWeightUnit;
        
        window.Geometry.updateResultDisplay(calculationData, resultSelectors);
    }


    // --- 4. Event Listener und Initialisierung ---

    function initializeCalculator() {
        // Diese Event Listener werden erst nach dem Laden der Materialien zugewiesen
        [lengthInput, widthInput, heightInput, unitLengthSelector, unitWidthSelector, unitHeightSelector, materialSelector].forEach(element => {
            element.addEventListener('input', calculate);
            element.addEventListener('change', calculate);
        });

        [resultSelectors.unitAreaSelector, resultSelectors.unitVolumeSelector, resultSelectors.unitWeightSelector].forEach(element => {
             element.addEventListener('change', () => {
                 window.Geometry.updateResultDisplay(calculationData, resultSelectors);
             });
        });
       
        autoScaleButton.addEventListener('click', handleAutoScale);

        // --- 5. Initialisierung ---
        window.Geometry.populateResultSelectors(resultSelectors);
        calculate(); // Erste Berechnung nach Initialisierung
    }

    // Starten Sie den Ladevorgang der Materialien beim DOMContentLoaded
    loadMaterials();
});
