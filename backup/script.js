'use strict';

// 1. Variablen: Elemente aus dem HTML holen und speichern
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

// Konstante für die Umrechnung in Meter (unsere Basis-Einheit für Berechnungen)
const UNIT_FACTORS_TO_METER = {
    'mm': 0.001,
    'cm': 0.01,
    'm': 1,
    'km': 1000,
    // 'um': 0.000001 // Haben wir aus HTML entfernt, um Dropdowns simpel zu halten
};


// 2. Event Listener: Auf Änderungen der Eingabewerte warten
// Wir müssen jetzt alle 6 Felder überwachen!
lengthInput.addEventListener('input', calculate);
widthInput.addEventListener('input', calculate);
heightInput.addEventListener('input', calculate);
unitLengthSelector.addEventListener('change', calculate);
unitWidthSelector.addEventListener('change', calculate);
unitHeightSelector.addEventListener('change', calculate);
materialSelector.addEventListener('change', calculate);


// 3. Die Hauptfunktion, die alles berechnet und anzeigt
function calculate() {
    // A. Werte aus den Eingabefeldern lesen
    const lengthValue = parseFloat(lengthInput.value);
    const widthValue = parseFloat(widthInput.value);
    const heightValue = parseFloat(heightInput.value);
    
    // Prüfen, ob die Werte gültig sind
    if (isNaN(lengthValue) || isNaN(widthValue) || isNaN(heightValue) || lengthValue <= 0 || widthValue <= 0 || heightValue <= 0) {
        resultArea.textContent = 'Ungültige Eingabe';
        resultVolume.textContent = 'Ungültige Eingabe';
        resultWeight.textContent = 'Ungültige Eingabe';
        return;
    }

    // B. Alle Eingabewerte in unsere Basis-Einheit umrechnen (Meter)
    const lengthMeters = lengthValue * UNIT_FACTORS_TO_METER[unitLengthSelector.value];
    const widthMeters = widthValue * UNIT_FACTORS_TO_METER[unitWidthSelector.value];
    const heightMeters = heightValue * UNIT_FACTORS_TO_METER[unitHeightSelector.value];

    // C. Die Berechnungen in Kubikmetern/Quadratmetern durchführen
    const surfaceAreaM2 = 2 * (lengthMeters * widthMeters + widthMeters * heightMeters + heightMeters * lengthMeters);
    const volumeM3 = lengthMeters * widthMeters * heightMeters;

    // D. Das Gewicht berechnen
    const density = materialSelector.options[materialSelector.selectedIndex].dataset.density;
    const weightInKg = density * volumeM3; // Dichte ist in kg/m³, Volumen in m³ -> Ergebnis in kg

    // E. Ergebnisse im HTML anzeigen (Wir zeigen die Ergebnisse jetzt immer in Metern an,
    // da die Eingaben gemischt sein können)
    resultArea.textContent = surfaceAreaM2.toFixed(4); // Mehr Nachkommastellen für m²
    resultVolume.textContent = volumeM3.toFixed(6); // Viele Nachkommastellen für m³
    resultWeight.textContent = weightInKg.toFixed(3);
}

// Beim Laden der Seite einmal die Berechnung ausführen, um Startwerte anzuzeigen
calculate();
