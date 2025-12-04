// tools/geometrie/zylinder/script.js (KORRIGIERT)
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // Stellen Sie sicher, dass menuLoader.js geladen wurde
    if (typeof window.getPathPrefix !== 'function') {
        console.error("Fehler: window.getPathPrefix ist nicht verfügbar. Bitte menuLoader.js vor diesem Skript laden.");
        document.getElementById('resultWeight').textContent = 'Fataler Fehler: Menü-Skript fehlt.';
        return; 
    }
    
    // --- 1. DOM Referenzen setzen (lokal) ---
    const radiusInput = document.getElementById('radius');
    const heightInput = document.getElementById('height');
    const unitRadiusSelector = document.getElementById('unitRadius');
    const unitHeightSelector = document.getElementById('unitHeight');
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

    // --- 2. Datenhaltung (lokale Variablen) ---
    const calculationData = {
        globalSurfaceAreaM2: 0,
        globalVolumeM3: 0,
        globalWeightKg: 0
    };
    let materialsData = []; // Hier werden die JSON-Daten gespeichert

    
    // --- Funktion zum Laden der Materialien ---
    function loadMaterials() {
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
                
                // WICHTIG: Hier rufen wir die Initialisierung erst auf!
                initializeCalculator(); 
            })
            .catch(error => {
                console.error('Fehler beim Laden der Materialien:', error);
                document.getElementById('resultWeight').textContent = 'Fehler beim Laden der Materialien.';
            });
    }

    // --- 3. Spezifische Berechnungslogik ---
    function calculate() {
        const radiusValue = parseFloat(radiusInput.value);
        const heightValue = parseFloat(heightInput.value);
        if (isNaN(radiusValue) || isNaN(heightValue) || radiusValue <= 0 || heightValue <= 0) {
            resultSelectors.resultArea.textContent = 'Ungültig';
            return;
        }
        // ... (Der Rest der Berechnungslogik bleibt gleich) ...
        const factors = window.Geometry.UNIT_FACTORS_TO_METER;
        const radiusMeters = radiusValue * factors[unitRadiusSelector.value];
        const heightMeters = heightValue * factors[unitHeightSelector.value];
        const baseArea = Math.PI * Math.pow(radiusMeters, 2);
        const circumference = 2 * Math.PI * radiusMeters;
        
        calculationData.globalSurfaceAreaM2 = (2 * baseArea) + (circumference * heightMeters);
        calculationData.globalVolumeM3 = baseArea * heightMeters;

        const selectedMaterialId = materialSelector.value;
        const selectedMaterial = materialsData.find(m => m.id === selectedMaterialId);
        
        if (selectedMaterial) {
            const density = selectedMaterial.density;
            calculationData.globalWeightKg = density * calculationData.globalVolumeM3; 
        } else {
            calculationData.globalWeightKg = 0;
        }

        window.Geometry.updateResultDisplay(calculationData, resultSelectors);
    }

    function handleAutoScale() {
        // ... (Logik wie gehabt) ...
        const bestAreaUnit = window.Geometry.findAppropriateUnit(calculationData.globalSurfaceAreaM2, '²');
        const bestVolumeUnit = window.Geometry.findAppropriateUnit(calculationData.globalVolumeM3, '³');
        const bestWeightUnit = window.Geometry.findAppropriateWeightUnit(calculationData.globalWeightKg);
        resultSelectors.unitAreaSelector.value = bestAreaUnit;
        resultSelectors.unitVolumeSelector.value = bestVolumeUnit;
        resultSelectors.unitWeightSelector.value = bestWeightUnit;
        window.Geometry.updateResultDisplay(calculationData, resultSelectors);
    }

    // --- 4. Event Listener und Initialisierung (In Funktion verpackt) ---
    function initializeCalculator() {
        // Event Listener werden JETZT zugewiesen, nachdem Materialien da sind
        [radiusInput, heightInput, unitRadiusSelector, unitHeightSelector, materialSelector].forEach(element => {
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
        calculate(); // Erste Berechnung funktioniert jetzt
    }

    
    // Starten Sie den Ladevorgang der Materialien beim DOMContentLoaded
    loadMaterials();
});
