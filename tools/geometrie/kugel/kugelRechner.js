// tools/geometrie/kugel/script.js (KORRIGIERT)
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // Stellen Sie sicher, dass menuLoader.js geladen wurde und die Funktion bereitstellt
    if (typeof window.getPathPrefix !== 'function') {
        console.error("Fehler: window.getPathPrefix ist nicht verfügbar. Bitte menuLoader.js vor diesem Skript laden.");
        // Zeigt einen Fehler im HTML an, falls das Menü-Skript fehlt
        document.getElementById('resultWeight').textContent = 'Fataler Fehler: Menü-Skript fehlt.';
        return; 
    }
    
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

    // --- 2. Datenhaltung (lokale Variablen & Materialdaten) ---
    let materialsData = []; 
    const calculationData = {
        globalSurfaceAreaM2: 0,
        globalVolumeM3: 0,
        globalWeightKg: 0
    };

    
    // --- Funktion zum Laden der Materialien (Bleibt fast gleich) ---
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
                materialsData = materials; 

                materials.forEach(material => {
                    const option = document.createElement('option');
                    option.value = material.id; 
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

    // --- 3. Spezifische Berechnungslogik (calculate & handleAutoScale) ---
    function calculate() {
        // ... (Logik wie gehabt) ...
        const radiusValue = parseFloat(radiusInput.value);
        if (isNaN(radiusValue) || radiusValue <= 0) {
            resultSelectors.resultArea.textContent = 'Ungültig';
            return;
        }

        const factors = window.Geometry.UNIT_FACTORS_TO_METER;
        const radiusMeters = radiusValue * factors[unitRadiusSelector.value];

        calculationData.globalSurfaceAreaM2 = 4 * Math.PI * Math.pow(radiusMeters, 2);
        calculationData.globalVolumeM3 = (4/3) * Math.PI * Math.pow(radiusMeters, 3);

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

        // --- 5. Initialisierung: Erste Berechnung nach Zuweisung der Listener ---
        window.Geometry.populateResultSelectors(resultSelectors);
        calculate(); // Jetzt funktioniert calculate(), weil materialsData gefüllt ist
    }
    
    // Starten Sie den Ladevorgang der Materialien beim DOMContentLoaded
    loadMaterials();
});
