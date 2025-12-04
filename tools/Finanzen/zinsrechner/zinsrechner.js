// tools/finanzen/zinsrechner/zinsrechner.js
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // --- 1. DOM Referenzen setzen ---
    const initialAmountInput = document.getElementById('initialAmount');
    const interestRateInput = document.getElementById('interestRate');
    const yearsInput = document.getElementById('years');

    const resultInterest = document.getElementById('resultInterest');
    const resultTotal = document.getElementById('resultTotal');

    // --- 2. Berechnungslogik ---
    function calculateInterest() {
        const principal = parseFloat(initialAmountInput.value);
        const rate = parseFloat(interestRateInput.value);
        const years = parseFloat(yearsInput.value);

        // Validierung
        if (isNaN(principal) || isNaN(rate) || isNaN(years) || principal < 0 || years < 0) {
            resultInterest.textContent = 'Ungültig';
            resultTotal.textContent = 'Ungültig';
            return;
        }

        // Einfache Zinsberechnung (für diesen einfachen Rechner)
        // Zinsen = Kapital * Zinssatz * Jahre / 100
        const totalInterest = (principal * rate * years) / 100;
        const totalAmount = principal + totalInterest;

        // Ergebnisse formatieren (2 Nachkommastellen für Währung)
        resultInterest.textContent = totalInterest.toFixed(2);
        resultTotal.textContent = totalAmount.toFixed(2);
    }

    // --- 3. Event Listener ---
    [initialAmountInput, interestRateInput, yearsInput].forEach(element => {
        element.addEventListener('input', calculateInterest);
        element.addEventListener('change', calculateInterest);
    });

    // --- 4. Initialisierung ---
    calculateInterest(); // Erste Berechnung beim Laden der Seite
});
