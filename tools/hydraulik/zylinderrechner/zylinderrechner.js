// zylinderrechner.js

// Hilfsfunktion: Fügt die Fehlerklasse hinzu oder entfernt sie
function toggleInvalidClass(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (element) {
        if (!isValid) {
            element.classList.add('is-invalid');
        } else {
            element.classList.remove('is-invalid');
        }
    }
}

// Funktion zum Umschalten der Kolbenstange (Standard: Einfachwirkend = versteckt)
function toggleRodInput() {
    const cylinderType = document.getElementById('cylinderType').value;
    document.getElementById('rodGroup').classList.toggle('hidden', cylinderType === 'single');
    calculateCylinder(); 
}

// Funktion zum Umschalten der Fluss-Eingaben
function toggleFlowInputs() {
    const flowSource = document.getElementById('flowSource').value;
    document.getElementById('directFlowGroup').classList.toggle('hidden', flowSource !== 'direct');
    document.getElementById('pumpFlowGroup').classList.toggle('hidden', flowSource === 'direct');
    calculateCylinder();
}

// NEU: Funktion zur Steuerung der Sichtbarkeit der Eingabefelder basierend auf dem Modus
function toggleSpeedInputs() {
    const calcMode = document.getElementById('calcModeOption').value;
    
    // Benötigt Volumen (forceVolume, all) ODER Geschwindigkeit (forceSpeed, all)
    const needsVolume = (calcMode === 'forceVolume' || calcMode === 'all');
    const needsSpeed = (calcMode === 'forceSpeed' || calcMode === 'all');

    // Hublänge wird für Volumen UND Geschwindigkeit benötigt
    document.getElementById('strokeGroup').classList.toggle('hidden', !(needsVolume || needsSpeed));

    // Ölversorgung wird NUR für Geschwindigkeit benötigt
    document.getElementById('oilSupplyGroup').classList.toggle('hidden', !needsSpeed);
    
    calculateCylinder(); // Nach dem Umschalten neu berechnen
}

// HILFSFUNKTION: formatForce bleibt gleich
function formatForce(newtons, unit) {
    let value;
    switch (unit) {
        case 'kN': value = newtons / 1000; return `${value.toFixed(2)} kN`;
        case 't': value = newtons / 9806.65; return `${value.toFixed(3)} t`;
        case 'N': default: value = newtons; return `${value.toFixed(0)} N`;
    }
}


// DIE HAUPTBERECHNUNGSFUNKTION
function calculateCylinder() {
    // --- 1. Eingabewerte auslesen ---
    const pistonD = parseFloat(document.getElementById('pistonDiameter').value);
    const rodD = parseFloat(document.getElementById('rodDiameter').value);
    const pressure = parseFloat(document.getElementById('pressure').value);
    const strokeL = parseFloat(document.getElementById('strokeLength').value);
    const cylinderType = document.getElementById('cylinderType').value;
    const calcMode = document.getElementById('calcModeOption').value;

    const mainResultsGroup = document.getElementById('mainResultsGroup');

    // Standardmäßig alle Fehlerklassen entfernen, bevor neu geprüft wird
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.classList.remove('is-invalid');
    });

    let isValid = true;
    
    // --- 2. Validierung der Basiswerte (Kraft) ---
    if (isNaN(pistonD) || pistonD <= 0) { toggleInvalidClass('pistonDiameter', false); isValid = false; }
    if (isNaN(pressure) || pressure <= 0) { toggleInvalidClass('pressure', false); isValid = false; }
    if (cylinderType === 'double' && (isNaN(rodD) || rodD <= 0 || rodD >= pistonD)) { 
        toggleInvalidClass('rodDiameter', false); isValid = false; 
    }

    // --- 3. Zusätzliche Validierung für Volumen/Geschwindigkeit (wenn benötigt) ---
    const needsSpeed = (calcMode === 'forceSpeed' || calcMode === 'all');
    const needsVolume = (calcMode === 'forceVolume' || calcMode === 'all');
    const needsSpeedOrVolume = needsSpeed || needsVolume;
    
    if (needsSpeedOrVolume) {
        // Hublänge MUSS validiert werden, wenn Volumen oder Geschwindigkeit benötigt wird
        if (isNaN(strokeL) || strokeL <= 0) { 
            toggleInvalidClass('strokeLength', false); 
            isValid = false; 
        }
        
        // Flussrate MUSS validiert werden, wenn Geschwindigkeit benötigt wird
        if (needsSpeed) {
            const flowSource = document.getElementById('flowSource').value;
            if (flowSource === 'direct') {
                const flowRate = parseFloat(document.getElementById('flowRate').value);
                if (isNaN(flowRate) || flowRate <= 0) { toggleInvalidClass('flowRate', false); isValid = false; }
            } else {
                const pumpCCM = parseFloat(document.getElementById('pumpCCM').value);
                const pumpRPM = parseFloat(document.getElementById('pumpRPM').value);
                if (isNaN(pumpCCM) || pumpCCM <= 0) { toggleInvalidClass('pumpCCM', false); isValid = false; }
                if (isNaN(pumpRPM) || pumpRPM <= 0) { toggleInvalidClass('pumpRPM', false); isValid = false; }
            }
        }
    }


    if (!isValid) {
        // Wenn Fehler vorliegen, Ergebnisse verstecken und Berechnung abbrechen
        mainResultsGroup.classList.add('results-hidden'); 
        return;
    }
    
    // Ab hier ist isValid TRUE und die Berechnungen finden statt...
    
    // ... (Der Rest des Codes für Berechnungen, Ergebnisse anzeigen und Sichtbarkeit 
    // der speed/volume P-Tags bleibt gleich wie in den vorherigen Antworten) ...

    // --- 4. Berechnungen (Flächen, Kräfte) ---
    const D_m = pistonD / 1000;
    const d_m = rodD / 1000;
    const P_Pa = pressure * 100000; 
    const areaExtend = Math.PI * Math.pow(D_m / 2, 2);
    const areaRetract = Math.PI * Math.pow(D_m / 2, 2) - Math.PI * Math.pow(d_m / 2, 2);
    const forceExtendN = P_Pa * areaExtend;
    const forceRetractN = P_Pa * areaRetract;

    // --- 5. Ergebnisse anzeigen ---
    mainResultsGroup.classList.remove('results-hidden'); // Ergebnisse jetzt anzeigen

    const unitExtend = document.getElementById('unitSelectorExtend').value; 
    const unitRetract = document.getElementById('unitSelectorRetract').value;

    document.getElementById('forceExtend').textContent = formatForce(forceExtendN, unitExtend);

    // Logik für Geschwindigkeit und Volumen (Sichtbarkeit der P-Tags)
    // ... (Der Code hierfür war in der vorherigen Antwort korrekt) ...
    const needsSpeedVisible = (calcMode === 'forceSpeed' || calcMode === 'all');
    const needsVolumeVisible = (calcMode === 'forceVolume' || calcMode === 'all');
    
    document.getElementById('speedExtendResultP').classList.toggle('hidden', !needsSpeedVisible);
    document.getElementById('volumeExtendResultP').classList.toggle('hidden', !needsVolumeVisible);
    document.getElementById('speedRetractResultP').classList.toggle('hidden', !needsSpeedVisible);
    document.getElementById('volumeRetractResultP').classList.toggle('hidden', !needsVolumeVisible);


    // Dynamische Werte berechnen und anzeigen (Flussrate, Geschwindigkeit, Volumen)
    if (needsSpeedOrVolume) {
        // ... (Berechnung von QL_per_min, L_m, etc. und Anzeige in den span-Tags 
        // war in der vorherigen Antwort korrekt und muss hier eingefügt werden) ...
        
        let QL_per_min = 0;
        const flowSource = document.getElementById('flowSource').value;
        const calculatedFlowRateP = document.getElementById('calculatedFlowRateP'); 

        if (needsSpeed) {
            // Hier muss QL_per_min neu berechnet werden, da die Validierung durchlaufen wurde
            if (flowSource === 'direct') {
                QL_per_min = parseFloat(document.getElementById('flowRate').value);
                calculatedFlowRateP.classList.add('hidden');
            } else {
                const pumpCCM = parseFloat(document.getElementById('pumpCCM').value);
                const pumpRPM = parseFloat(document.getElementById('pumpRPM').value);
                QL_per_min = (pumpCCM * pumpRPM) / 1000;
                document.getElementById('calculatedFlowRate').textContent = QL_per_min.toFixed(1);
                calculatedFlowRateP.classList.remove('hidden'); 
            }
        } else {
            QL_per_min = 0;
            calculatedFlowRateP.classList.add('hidden');
        }

        const L_m = strokeL / 1000; 
        const Q_m3_per_s = QL_per_min / 60000; 

        if (needsSpeed) {
            const speedExtendMMS = (Q_m3_per_s / areaExtend) * 1000;
            document.getElementById('speedExtend').textContent = `${speedExtendMMS.toFixed(1)} mm/s`;
        }
        if (needsVolume) {
             const volumeExtendL = (areaExtend * L_m) * 1000;
            document.getElementById('volumeExtend').textContent = `${volumeExtendL.toFixed(2)} L`;
        }
        
        if (cylinderType === 'double') {
            if (needsSpeed) {
                const speedRetractMMS = (Q_m3_per_s / areaRetract) * 1000;
                document.getElementById('speedRetract').textContent = `${speedRetractMMS.toFixed(1)} mm/s`;
            }
            if (needsVolume) {
                const volumeRetractL = (areaRetract * L_m) * 1000;
                document.getElementById('volumeRetract').textContent = `${volumeRetractL.toFixed(2)} L`;
            }
        }
    } else {
        document.getElementById('calculatedFlowRateP').classList.add('hidden');
    }


    // Einfahren Ergebnisse anzeigen (nur bei Doppeltwirkend)
    document.getElementById('retractResults').classList.toggle('hidden', cylinderType === 'single');
    document.getElementById('forceRetract').textContent = formatForce(forceRetractN, unitRetract); 
}


// Beim Laden der Seite die Initialisierung durchführen
document.addEventListener('DOMContentLoaded', (event) => {
    // Initialisierungsreihenfolge ist wichtig:
    toggleRodInput();     // Initialisiert die Stange (Standard: Einfachwirkend -> versteckt)
    toggleFlowInputs();   // Initialisiert die Pumpeneingaben (Standard: Direkt -> Pumpe versteckt)
    toggleSpeedInputs();  // Initialisiert die Sichtbarkeit der dynamischen Eingaben (Standard: Nur Kraft -> versteckt)
    // calculateCylinder(); // Keine Berechnung beim Start, Ergebnisse bleiben hidden, bis Button gedrückt wird
});
