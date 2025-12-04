// tools/geometrie/kugel/script.js
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // --- 1. DOM Referenzen setzen (lokal) ---
    const radiusInput = document.getElementById('radius');
    const unitRadiusSelector = document.getElementById('unitRadius');
    const materialSelector = document.getElementById('materialSelector');
    const autoScaleButton = document.getElementById('autoScaleButton');

    const resultSelectors = {
        resultArea: document.getElementById('resultArea'),
        resultVolume: document.getElementById('resultVolume'),
        resultWeight: document.getElementById('resultWeight'),
        unitAreaSelector: document.getElementById('unitAreaSelector'),
        unitVolumeSelector: document.getElementById('unitVolumeSelector'),
        unitWeightSelector: document.getElementById('unitWeightSelector')
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

    // --- 2. Datenhaltung (lokale Variablen) ---
    const calculationData = {
        globalSurfaceAreaM2: 0,
        globalVolumeM3: 0,
        globalWeightKg: 0
    };
    
    // --- 3. Spezifische Berechnungslogik ---
    function calculate() {
        const radiusValue = parseFloat(radiusInput.value);
        if (isNaN(radiusValue) || radiusValue <= 0) {
            resultSelectors.resultArea.textContent = 'Ungültig';
            return;
        }

        const factors = window.Geometry.UNIT_FACTORS_TO_METER;
        const radiusMeters = radiusValue * factors[unitRadiusSelector.value];

        // KUGEL FORMELN
        calculationData.globalSurfaceAreaM2 = 4 * Math.PI * Math.pow(radiusMeters, 2);
        calculationData.globalVolumeM3 = (4/3) * Math.PI * Math.pow(radiusMeters, 3);



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
    [radiusInput, unitRadiusSelector, materialSelector].forEach(element => {
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
    calculate(); 

    
    // Starten Sie den Ladevorgang der Materialien beim DOMContentLoaded
    loadMaterials();
});
