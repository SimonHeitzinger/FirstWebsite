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

        const density = materialSelector.options[materialSelector.selectedIndex].dataset.density;
        calculationData.globalWeightKg = density * calculationData.globalVolumeM3; 

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
});
