// quader/script.js
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
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

    // --- 2. Datenhaltung (lokale Variablen) ---
    const calculationData = {
        globalSurfaceAreaM2: 0,
        globalVolumeM3: 0,
        globalWeightKg: 0
    };

    // --- 3. Spezifische Berechnungslogik (calculate & handleAutoScale) ---
    
    function calculate() {
        const lengthValue = parseFloat(lengthInput.value);
        const widthValue = parseFloat(widthInput.value);
        const heightValue = parseFloat(heightInput.value);
        
        if (isNaN(lengthValue) || isNaN(widthValue) || isNaN(heightInput.value) || lengthValue <= 0 || widthValue <= 0 || heightValue <= 0) {
            resultSelectors.resultArea.textContent = 'Ungültig';
            return;
        }

        // Zugriff auf shared config durch window.Geometry
        const factors = window.Geometry.UNIT_FACTORS_TO_METER;

        const lengthMeters = lengthValue * factors[unitLengthSelector.value];
        const widthMeters = widthValue * factors[unitWidthSelector.value];
        const heightMeters = heightValue * factors[unitHeightSelector.value];

        calculationData.globalSurfaceAreaM2 = 2 * (lengthMeters * widthMeters + widthMeters * heightMeters + heightMeters * lengthMeters);
        calculationData.globalVolumeM3 = lengthMeters * widthMeters * heightMeters;

        const density = materialSelector.options[materialSelector.selectedIndex].dataset.density;
        calculationData.globalWeightKg = density * calculationData.globalVolumeM3; 

        // Update der Anzeige durch shared function
        window.Geometry.updateResultDisplay(calculationData, resultSelectors);
    }

    function handleAutoScale() {
        // Zugriff auf shared functions
        const bestAreaUnit = window.Geometry.findAppropriateUnit(calculationData.globalSurfaceAreaM2, '²');
        const bestVolumeUnit = window.Geometry.findAppropriateUnit(calculationData.globalVolumeM3, '³');
        const bestWeightUnit = window.Geometry.findAppropriateWeightUnit(calculationData.globalWeightKg);

        resultSelectors.unitAreaSelector.value = bestAreaUnit;
        resultSelectors.unitVolumeSelector.value = bestVolumeUnit;
        resultSelectors.unitWeightSelector.value = bestWeightUnit;
        
        // Update der Anzeige
        window.Geometry.updateResultDisplay(calculationData, resultSelectors);
    }


    // --- 4. Event Listener und Initialisierung ---

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
    // Aufruf der shared function, übergibt die lokalen DOM-Referenzen
    window.Geometry.populateResultSelectors(resultSelectors);
    calculate(); 
});
