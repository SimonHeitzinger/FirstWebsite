// tools/geometrie/zylinder/script.js
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
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
    
    // --- 3. Spezifische Berechnungslogik ---
    function calculate() {
        const radiusValue = parseFloat(radiusInput.value);
        const heightValue = parseFloat(heightInput.value);
        if (isNaN(radiusValue) || isNaN(heightValue) || radiusValue <= 0 || heightValue <= 0) {
            resultSelectors.resultArea.textContent = 'Ungültig';
            return;
        }

        const factors = window.Geometry.UNIT_FACTORS_TO_METER;
        const radiusMeters = radiusValue * factors[unitRadiusSelector.value];
        const heightMeters = heightValue * factors[unitHeightSelector.value];

        // ZYLINDER FORMELN
        const baseArea = Math.PI * Math.pow(radiusMeters, 2);
        const circumference = 2 * Math.PI * radiusMeters;
        
        calculationData.globalSurfaceAreaM2 = (2 * baseArea) + (circumference * heightMeters);
        calculationData.globalVolumeM3 = baseArea * heightMeters;

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
    calculate(); 
});
