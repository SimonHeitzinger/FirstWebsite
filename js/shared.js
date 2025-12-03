// js/shared.js
'use strict';

// Globales Objekt für gemeinsame Logik
window.Geometry = {
    // --- 1. Konfigurationen ---
    UNIT_FACTORS_TO_METER: {
        'um': 0.000001, 'mm': 0.001, 'cm': 0.01,'dm': 0.1, 'm': 1, 'km': 1000
    },
    UNIT_FACTORS_TO_KG: {
        'mg': 0.000001, 'g': 0.001, 'kg': 1, 't': 1000 
    },

    // --- 2. Hilfsfunktionen (Einheitenumrechnung & Skalierung) ---

    populateResultSelectors: function(resultSelectors) {
        const units = ['µm²', 'mm²', 'cm²','dm²' ,'m²', 'km²'];
        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit; option.textContent = unit;
            resultSelectors.unitAreaSelector.appendChild(option);
        });

        const unitsCubic = ['µm³', 'mm³', 'cm³','dm³' , 'm³', 'km³'];
        unitsCubic.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit; option.textContent = unit;
            resultSelectors.unitVolumeSelector.appendChild(option);
        });
        
        const weightUnits = ['mg', 'g', 'kg', 't'];
        weightUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit; option.textContent = unit;
            resultSelectors.unitWeightSelector.appendChild(option);
        });

        resultSelectors.unitAreaSelector.value = 'cm²';
        resultSelectors.unitVolumeSelector.value = 'cm³';
        resultSelectors.unitWeightSelector.value = 'kg';
    },

    findAppropriateUnit: function(valueM, dimensionSuffix) {
        const absValue = Math.abs(valueM);
        const orderedUnits = ['km', 'm', 'dm', 'cm', 'mm', 'um']; 
        for (const unit of orderedUnits) {
            const factorToMeter = this.UNIT_FACTORS_TO_METER[unit]; 
            if (!factorToMeter) continue; 
            const power = dimensionSuffix === '³' ? 3 : (dimensionSuffix === '²' ? 2 : 1);
            const scaleFactorFromM = 1 / Math.pow(factorToMeter, power);
            const scaledValue = absValue * scaleFactorFromM;
            if (scaledValue >= 0.1 && scaledValue < 1000) {
                const displayUnit = unit === 'um' ? 'µm' : unit;
                return displayUnit + dimensionSuffix;
            }
        }
        return 'm' + dimensionSuffix; 
    },

    findAppropriateWeightUnit: function(valueKg) {
        const absValue = Math.abs(valueKg);
        const orderedUnits = ['t', 'kg', 'g', 'mg']; 
        for (const unit of orderedUnits) {
            const factorToKg = this.UNIT_FACTORS_TO_KG[unit]; 
            const scaledValue = absValue / factorToKg;
            if (scaledValue >= 0.1 && scaledValue < 1000) {
                return unit;
            }
        }
        return 'kg';
    },

    displayScaledResult: function(baseValue, targetUnitWithSuffix, type = 'length') {
        let baseUnitKey;
        let factorObject;
        let power = 1;

        if (type === 'weight') {
            baseUnitKey = targetUnitWithSuffix;
            factorObject = this.UNIT_FACTORS_TO_KG;
        } else {
            if (targetUnitWithSuffix.includes('µm')) {
                baseUnitKey = 'um';
            } else {
                baseUnitKey = targetUnitWithSuffix.replace(/[²³]/g, ''); 
            }
            power = targetUnitWithSuffix.includes('³') ? 3 : (targetUnitWithSuffix.includes('²') ? 2 : 1);
            factorObject = this.UNIT_FACTORS_TO_METER;
        }
        
        const factorToTarget = factorObject[baseUnitKey];
        if (!factorToTarget) {
            console.error("Fehler: Unbekannte Einheit im displayScaledResult:", baseUnitKey, "Typ:", type);
            return 'Fehler';
        }

        const scaleFactor = 1 / Math.pow(factorToTarget, power); 
        const scaledValue = baseValue * scaleFactor;
        return scaledValue.toFixed(4);
    },

    // Diese Funktion benötigt die aktuellen Daten und DOM-Referenzen von der spezifischen Seite
    updateResultDisplay: function(data, selectors) {
        selectors.resultArea.textContent = this.displayScaledResult(data.globalSurfaceAreaM2, selectors.unitAreaSelector.value, 'length');
        selectors.resultVolume.textContent = this.displayScaledResult(data.globalVolumeM3, selectors.unitVolumeSelector.value, 'length');
        selectors.resultWeight.textContent = this.displayScaledResult(data.globalWeightKg, selectors.unitWeightSelector.value, 'weight');
    }
};
