// tools/hydraulik/viskositaet/viskositaetsrechner.js
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // --- 1. DOM Referenzen ---
    const oilTypeSelector = document.getElementById('oilTypeSelector');
    const customInputsDiv = document.getElementById('customInputs');
    const visc40CInput = document.getElementById('viscosity40C');
    const visc100CInput = document.getElementById('viscosity100C');
    const operatingTempInput = document.getElementById('operatingTemp');
    const resultViscosityStrong = document.getElementById('resultViscosity');
    const statusArea = document.getElementById('statusArea');

    // Vordefinierte Öle
    const predefinedOils = {
        'ISO VG 32': { v40: 32, v100: 5.3 }, // Typische Werte
        'ISO VG 46': { v40: 46, v100: 7.0 },
        'ISO VG 68': { v40: 68, v100: 9.0 }
    };

    // --- 2. Sichtbarkeit der Felder steuern ---
    oilTypeSelector.addEventListener('change', () => {
        if (oilTypeSelector.value === 'custom') {
            customInputsDiv.style.display = 'block';
        } else {
            customInputsDiv.style.display = 'none';
        }
        calculateViscosity();
    });

    // --- 3. Berechnungslogik (Ubbelohde-Walther-Gleichung) ---
    function calculateViscosity() {
        statusArea.textContent = '';

        let v40, v100;
        const opTemp = parseFloat(operatingTempInput.value);
        const selectedType = oilTypeSelector.value;

        if (selectedType === 'custom') {
            v40 = parseFloat(visc40CInput.value);
            v100 = parseFloat(visc100CInput.value);
        } else {
            v40 = predefinedOils[selectedType].v40;
            v100 = predefinedOils[selectedType].v100;
        }

        if (isNaN(v40) || isNaN(v100) || isNaN(opTemp) || v40 <= 0 || v100 <= 0) {
            statusArea.textContent = 'Ungültige Eingabe.';
            resultViscosityStrong.textContent = '0';
            return;
        }

        // Die Ubbelohde-Walther-Gleichung erfordert double-logarithmische Skalierung
        // und Umrechnung von Celsius in Rankine/Kelvin für die Formel.
        // Vereinfachte JS-Implementierung basierend auf ASTM D341:
        
        // Konstanten T1=40°C (313.15 K), T2=100°C (373.15 K)
        const T1 = 313.15; // 40C in Kelvin
        const T2 = 373.15; // 100C in Kelvin
        const T3 = opTemp + 273.15; // Betriebstemp in Kelvin

        // Anpassen der Viskositäten für die logarithmische Skala
        const Y1 = Math.log(Math.log(v40 + 0.7));
        const Y2 = Math.log(Math.log(v100 + 0.7));

        // Steigung berechnen
        const m = (Y2 - Y1) / (Math.log(T2) - Math.log(T1));

        // Achsenabschnitt berechnen (oder direkt interpolieren)
        // Interpolieren der Viskosität bei T3
        const Y3 = Y1 + m * (Math.log(T3) - Math.log(T1));
        const v3 = Math.exp(Math.exp(Y3)) - 0.7;


        resultViscosityStrong.textContent = v3.toFixed(2);
    }

    // --- 4. Event Listener ---
    [oilTypeSelector, operatingTempInput, visc40CInput, visc100CInput].forEach(element => {
        element.addEventListener('input', calculateViscosity);
        element.addEventListener('change', calculateViscosity);
    });

    // --- 5. Initialisierung ---
    if (typeof window.getPathPrefix !== 'function') {
         console.error("Fehler: window.getPathPrefix ist nicht verfügbar.");
    }
    calculateViscosity(); 
});
