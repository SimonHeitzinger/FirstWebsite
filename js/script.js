'use strict';

// --- 1. Konfigurationen und Variablen ---

const UNIT_FACTORS_TO_METER = {
    'um': 0.000001, 'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000
};

// Referenzen zu den HTML-Elementen
const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const unitLengthSelector = document.getElementById('unitLength');
const unitWidthSelector = document.getElementById('unitWidth');
const unitHeightSelector = document.getElementById('unitHeight');
const materialSelector = document.getElementById('materialSelector');

const resultArea = document.getElementById('resultArea');
const resultVolume = document.getElementById('resultVolume');
const resultWeight = document.getElementById('resultWeight');
const unitAreaSelector = document.getElementById('unitAreaSelector');
const unitVolumeSelector = document.getElementById('unitVolumeSelector');
const autoScaleButton = document.getElementById('autoScaleButton'); 

let globalSurfaceAreaM2 = 0;
let globalVolumeM3 = 0;


// --- 2. Hilfsfunktionen ---

// Funktion, um die Ergebnis-Dropdowns beim Start zu befüllen
function populateResultSelectors() {
    const units = ['µm²', 'mm²', 'cm²', 'm²', 'km²'];
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        unitAreaSelector.appendChild(option);
    });

    const unitsCubic = ['µm³', 'mm³', 'cm³', 'm³', 'km³'];
    unitsCubic.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        unitVolumeSelector.appendChild(option);
    });
}

// ... (findAppropriateUnit Funktion wie zuvor) ...
function findAppropriateUnit(valueM, dimensionSuffix) {
    const absValue = Math.abs(valueM);
    const orderedUnits = ['km', 'm', 'cm', 'mm', 'µm']; 

    for (const unit of orderedUnits) {
        const factorToMeter = UNIT_FACTORS_TO_METER[unit];
        const power = dimensionSuffix === '³' ? 3 : (dimensionSuffix === '²' ? 2 : 1);
        const scaleFactorFromM = 1 / Math.pow(factorToMeter, power);

        const scaledValue = absValue * scaleFactorFromM;

        if (scaledValue >= 0.1 && scaledValue < 1000) {
            return unit + dimensionSuffix;
        }
    }
    return 'm' + dimensionSuffix;
}

// ... (displayScaledResult Funktion wie zuvor) ...
function displayScaledResult(baseValueM, targetUnitWithSuffix) {
    const baseUnit = targetUnitWithSuffix.replace(/[²³]/g, ''); 
    const factorToMeter = UNIT_FACTORS_TO_METER[baseUnit];
    
    if (!factorToMeter) return 'Fehler';

    const power = targetUnitWithSuffix.includes('³') ? 3 : (targetUnitWithSuffix.includes('²') ? 2 : 1);
    const scaleFactor = 1 / Math.pow(factorToMeter, power); 
    
    const scaledValue = baseValueM * scaleFactor;
    return scaledValue.toFixed(3);
}


/**
 * NEU PLATZIERT: Funktion, die nur die Anzeige aktualisiert, wenn die Ergebnis-Einheit geändert wird
 */
function updateResultDisplay() {
    resultArea.textContent = displayScaledResult(globalSurfaceAreaM2, unitAreaSelector.value);
    resultVolume.textContent = displayScaledResult(globalVolumeM3, unitVolumeSelector.value);
}


// --- 3. Haupt-Berechnungsfunktion ---
function calculate() {
    // ... (Der gesamte Inhalt der calculate Funktion bleibt gleich) ...
    const lengthValue = parseFloat(lengthInput.value);
    const widthValue = parseFloat(widthInput.value);
    const heightValue = parseFloat(heightInput.value);
    
    if (isNaN(lengthValue) || isNaN(widthValue) || isNaN(heightInput.value) || lengthValue <= 0 || widthValue <= 0 || heightValue <= 0) {
        resultArea.textContent = 'Ungültig';
        resultVolume.textContent = 'Ungültig';
        resultWeight.textContent = 'Ungültig';
        return;
    }

    const lengthMeters = lengthValue * UNIT_FACTORS_TO_METER[unitLengthSelector.value];
    const widthMeters = widthValue * UNIT_FACTORS_TO_METER[unitWidthSelector.value];
    const heightMeters = heightValue * UNIT_FACTORS_TO_METER[unitHeightSelector.value];

    globalSurfaceAreaM2 = 2 * (lengthMeters * widthMeters + widthMeters * heightMeters + heightMeters * lengthMeters);
    globalVolumeM3 = lengthMeters * widthMeters * heightMeters;

    const density = materialSelector.options[materialSelector.selectedIndex].dataset.density;
    const weightInKg = density * globalVolumeM3; 

    // E. Ergebnisse im HTML anzeigen
    resultArea.textContent = displayScaledResult(globalSurfaceAreaM2, unitAreaSelector.value);
    resultVolume.textContent = displayScaledResult(globalVolumeM3, unitVolumeSelector.value);
    resultWeight.textContent = weightInKg.toFixed(4);
}


/**
 * NEU PLATZIERT: Diese Funktion wird nur beim Klick auf den Button ausgeführt
 */
function handleAutoScale() {
    const bestAreaUnit = findAppropriateUnit(globalSurfaceAreaM2, '²');
    const bestVolumeUnit = findAppropriateUnit(globalVolumeM3, '³');
    unitAreaSelector.value = bestAreaUnit;
    unitVolumeSelector.value = bestVolumeUnit;
    updateResultDisplay();
}


// --- 4. Event Listener und Initialisierung ---

// Event Listener für Eingaben
lengthInput.addEventListener('input', calculate);
widthInput.addEventListener('input', calculate);
heightInput.addEventListener('input', calculate);
unitLengthSelector.addEventListener('change', calculate);
unitWidthSelector.addEventListener('change', calculate);
unitHeightSelector.addEventListener('change', calculate);
materialSelector.addEventListener('change', calculate);

// Event Listener für die Ergebnis-Dropdowns (aktualisieren nur die Anzeige)
// Diese Zeilen funktionieren jetzt, da updateResultDisplay() weiter oben definiert ist.
unitAreaSelector.addEventListener('change', updateResultDisplay);
unitVolumeSelector.addEventListener('change', updateResultDisplay);

// Event Listener für den Button
autoScaleButton.addEventListener('click', handleAutoScale);


// Beim Laden der Seite einmal die Dropdowns befüllen und berechnen
populateResultSelectors();
calculate();
