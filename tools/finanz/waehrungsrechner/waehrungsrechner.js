'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // --- 1. DOM Referenzen ---
    const amountFromInput = document.getElementById('amountFrom');
    const amountToInput = document.getElementById('amountTo');
    const currencyFromSelector = document.getElementById('currencyFrom');
    const currencyToSelector = document.getElementById('currencyTo');
    const rateDisplay = document.getElementById('exchangeRateDisplay');

    // --- 2. Datenhaltung & Konstanten ---
    const FRANKFURTER_API_URL =  'https://api.frankfurter.app/latest';
    const RESTCOUNTRIES_API_URL = 'https://restcountries.com/v3.1/all?fields=currencies';

    let exchangeRates = {};
    let currencyNames = {}; // Neu: Speichert die Namen aus der Länder-API


    // --- 3. Logik zum Laden der Daten (zwei APIs) ---
    function fetchAllData() {
        const fetchRates = fetch(FRANKFURTER_API_URL).then(response => {
            if (!response.ok) throw new Error('Frankfurter-API nicht erreichbar.');
            return response.json();
        });

        const fetchNames = fetch(RESTCOUNTRIES_API_URL).then(response => {
            if (!response.ok) throw new Error('REST Countries-API nicht erreichbar.');
            return response.json();
        });

        Promise.all([fetchRates, fetchNames])
            .then(([ratesData, countriesData]) => {
                if (ratesData && ratesData.rates) {
                    exchangeRates = ratesData.rates;
                    if(ratesData.base) {
                        exchangeRates[ratesData.base] = 1.0;
                    }
                } else {
                    throw new Error('Fehler: Ungültiges Datenformat von der Frankfurter-API.');
                }

                if (countriesData) {
                    countriesData.forEach(country => {
                        if (country.currencies) {
                            for (const code in country.currencies) {
                                if (exchangeRates[code] && !currencyNames[code]) {
                                    currencyNames[code] = country.currencies[code].name;
                                }
                            }
                        }
                    });
                }
                
                // HIER IST DIE KONSOLENAUSGABE
                console.log("-----------------------------------------");
                console.log("Währungen mit Namen (aus API-Daten):");
                console.log("-----------------------------------------");
                const sortedCurrencies = Object.keys(currencyNames).sort();
                sortedCurrencies.forEach(code => {
                    console.log(`Code: ${code}, Name: ${currencyNames[code]}`);
                });
                console.log("-----------------------------------------");

                populateCurrencySelectors();
                calculateConversion();
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Daten:', error);
                rateDisplay.textContent = 'Fehler: Daten konnten nicht geladen werden (API-Problem).';
            });
    }

    // --- 4. Befüllen der Dropdowns (Unverändert) ---
    function populateCurrencySelectors() {
        const currencies = Object.keys(exchangeRates).sort();
        currencies.forEach(currency => {
            const currencyName = currencyNames[currency] || currency;
            
            const optionFrom = document.createElement('option');
            optionFrom.value = currency;
            optionFrom.textContent = `${currency} - ${currencyName}`;
            currencyFromSelector.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = currency;
            optionTo.textContent = `${currency} - ${currencyName}`;
            currencyToSelector.appendChild(optionTo);
        });

        currencyFromSelector.value = 'EUR';
        currencyToSelector.value = 'USD';
    }

    // --- 5. Berechnungslogik (Unverändert) ---
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

    // --- 6. Event Listener (Unverändert) ---
    [amountFromInput, currencyFromSelector, currencyToSelector].forEach(element => {
        element.addEventListener('input', calculateConversion);
        element.addEventListener('change', calculateConversion);
    });

    // --- 7. Initialisierung ---
    fetchAllData();
});