'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM Referenzen ---
    const amountFromInput = document.getElementById('amountFrom');
    const amountToInput = document.getElementById('amountTo');
    const currencyFromSelector = document.getElementById('currencyFrom');
    const currencyToSelector = document.getElementById('currencyTo');
    const rateDisplay = document.getElementById('exchangeRateDisplay');

    // --- 2. API URLs ---
    const FRANKFURTER_API_URL = 'https://api.frankfurter.app/latest';
    const RESTCOUNTRIES_API_URL = 'https://restcountries.com/v3.1/all?fields=currencies';

    // ✅ Richtige CoinGecko API
    const COINGECKO_API_URL =
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=eur';

    // --- 3. Datenhaltung ---
    let exchangeRates = {};
    let currencyNames = {};
    let cryptoRates = {};

    // --- 4. Alle Daten laden ---
    function fetchAllData() {

        const fetchRates = fetch(FRANKFURTER_API_URL)
            .then(response => {
                if (!response.ok) throw new Error('Frankfurter-API nicht erreichbar');
                return response.json();
            });

        const fetchNames = fetch(RESTCOUNTRIES_API_URL)
            .then(response => {
                if (!response.ok) throw new Error('REST Countries-API nicht erreichbar');
                return response.json();
            });

        const fetchCrypto = fetch(COINGECKO_API_URL)
            .then(response => {
                if (!response.ok) throw new Error('CoinGecko-API nicht erreichbar');
                return response.json();
            });

        Promise.all([fetchRates, fetchNames, fetchCrypto])
            .then(([ratesData, countriesData, cryptoData]) => {

                // --- Fiat Wechselkurse ---
                exchangeRates = ratesData.rates;
                exchangeRates[ratesData.base] = 1;

                // --- Währungsnamen ---
                countriesData.forEach(country => {
                    if (country.currencies) {
                        for (const code in country.currencies) {
                            currencyNames[code] = country.currencies[code].name;
                        }
                    }
                });

                // --- Krypto-Kurse (EUR als Basis) ---
                cryptoRates = {
                    BTC: cryptoData.bitcoin.eur,
                    ETH: cryptoData.ethereum.eur,
                    XRP: cryptoData.ripple.eur
                };

                // --- Krypto in Wechselkurse integrieren ---
                exchangeRates = { ...exchangeRates, ...cryptoRates };

                // --- Krypto-Namen ---
                currencyNames = {
                    ...currencyNames,
                    BTC: 'Bitcoin',
                    ETH: 'Ethereum',
                    XRP: 'XRP'
                };

                populateCurrencySelectors();
                calculateConversion();
            })
            .catch(error => {
                console.error(error);
                rateDisplay.textContent = 'Fehler beim Laden der APIs.';
            });
    }

    // --- 5. Dropdowns befüllen ---
    function populateCurrencySelectors() {
        const currencies = Object.keys(exchangeRates).sort();

        currencyFromSelector.innerHTML = '';
        currencyToSelector.innerHTML = '';

        currencies.forEach(currency => {
            const name = currencyNames[currency] || currency;

            const optionFrom = document.createElement('option');
            optionFrom.value = currency;
            optionFrom.textContent = `${currency} - ${name}`;
            currencyFromSelector.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = currency;
            optionTo.textContent = `${currency} - ${name}`;
            currencyToSelector.appendChild(optionTo);
        });

        currencyFromSelector.value = 'EUR';
        currencyToSelector.value = 'USD';
    }

    // --- 6. Berechnung ---
    function calculateConversion() {
        const amountFrom = parseFloat(amountFromInput.value);
        const currencyFrom = currencyFromSelector.value;
        const currencyTo = currencyToSelector.value;

        if (
            isNaN(amountFrom) ||
            amountFrom < 0 ||
            !exchangeRates[currencyFrom] ||
            !exchangeRates[currencyTo]
        ) {
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

    // --- 7. Events ---
    [amountFromInput, currencyFromSelector, currencyToSelector].forEach(element => {
        element.addEventListener('input', calculateConversion);
        element.addEventListener('change', calculateConversion);
    });

    // --- 8. Start ---
    fetchAllData();

});
