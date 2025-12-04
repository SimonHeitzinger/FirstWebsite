// tools/finanzen/waehrung/waehrungsrechner.js
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // --- 1. DOM Referenzen ---
    const amountFromInput = document.getElementById('amountFrom');
    const amountToInput = document.getElementById('amountTo');
    const currencyFromSelector = document.getElementById('currencyFrom');
    const currencyToSelector = document.getElementById('currencyTo');
    const rateDisplay = document.getElementById('exchangeRateDisplay');

    // --- 2. Datenhaltung ---
    const API_URL = 'api.frankfurter.app'; 
    let exchangeRates = {}; 

    // --- 3. Logik zum Laden der Kurse ---
    function fetchExchangeRates() {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // Die Struktur von Frankfurter API ist etwas anders:
                exchangeRates = data.rates;
                // Da Frankfurter API den Basiswert nicht in data.rates anzeigt, müssen wir ihn hinzufügen.
                // In diesem Fall ist es der EUR-Wert aus dem "base"-Feld der API-Antwort.
                if(data.base) {
                    exchangeRates[data.base] = 1.0;
                }
                
                populateCurrencySelectors();
                calculateConversion(); 
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Wechselkurse:', error);
                rateDisplay.textContent = 'Fehler: Kurse konnten nicht geladen werden (API-Problem).';
            });
    }

    // Befüllt die Dropdowns mit den Währungscodes
    function populateCurrencySelectors() {
        const currencies = Object.keys(exchangeRates).sort(); 
        currencies.forEach(currency => {
            const optionFrom = document.createElement('option');
            optionFrom.value = currency;
            optionFrom.textContent = currency;
            currencyFromSelector.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = currency;
            optionTo.textContent = currency;
            currencyToSelector.appendChild(optionTo);
        });
        
        currencyFromSelector.value = 'EUR';
        currencyToSelector.value = 'USD';
    }

    // --- 4. Berechnungslogik ---
    function calculateConversion() {
        const amountFrom = parseFloat(amountFromInput.value);
        const currencyFrom = currencyFromSelector.value;
        const currencyTo = currencyToSelector.value;

        if (isNaN(amountFrom) || amountFrom < 0 || !exchangeRates[currencyFrom] || !exchangeRates[currencyTo]) {
            amountToInput.value = '';
            rateDisplay.textContent = 'Ungültige Eingabe oder Kurse fehlen.';
            return;
        }

        const amountInEur = amountFrom / exchangeRates[currencyFrom];
        const amountTo = amountInEur * exchangeRates[currencyTo];
        const currentRate = exchangeRates[currencyTo] / exchangeRates[currencyFrom];

        amountToInput.value = amountTo.toFixed(2);
        rateDisplay.textContent = `1 ${currencyFrom} = ${currentRate.toFixed(4)} ${currencyTo}`;
    }

    // --- 5. Event Listener ---
    [amountFromInput, currencyFromSelector, currencyToSelector].forEach(element => {
        element.addEventListener('input', calculateConversion);
        element.addEventListener('change', calculateConversion);
    });

    // --- 6. Initialisierung ---
    fetchExchangeRates(); 
});
