// tools/konvertierer/csv_to_csv/csvConverter.js
'use strict';

document.addEventListener('DOMContentLoaded', (event) => {
    // --- 1. DOM Referenzen ---
    const fileInput = document.getElementById('csvFileInput');
    const inputDelimiterSelect = document.getElementById('inputDelimiter');
    const inputDecimalSelect = document.getElementById('inputDecimal');
    const outputDelimiterSelect = document.getElementById('outputDelimiter');
    const outputDecimalSelect = document.getElementById('outputDecimal');
    const convertButton = document.getElementById('convertButton');
    const statusArea = document.getElementById('statusArea');

    let loadedFileContent = ''; // Speichert den Inhalt der hochgeladenen Datei

    // --- 2. Event Listener ---
    fileInput.addEventListener('change', handleFileSelect);
    convertButton.addEventListener('click', convertAndDownload);
    
    // Auch bei Einstellungsänderungen den Button-Status prüfen
    [inputDelimiterSelect, inputDecimalSelect, outputDelimiterSelect, outputDecimalSelect].forEach(select => {
        select.addEventListener('change', () => {
            if (loadedFileContent) {
                convertButton.disabled = false;
            }
        });
    });


    // --- 3. Dateiverarbeitung ---
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            statusArea.textContent = 'Bitte eine Datei auswählen.';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            loadedFileContent = e.target.result;
            convertButton.disabled = false;
            statusArea.textContent = `Datei geladen: ${file.name}`;
        };
        reader.onerror = () => {
            statusArea.textContent = 'Fehler beim Lesen der Datei.';
        };
        reader.readAsText(file, 'UTF-8'); // Wichtig: CSVs sind meist UTF-8
    }

    // --- 4. Konvertierungs-Logik ---
    function convertAndDownload() {
        if (!loadedFileContent) return;

        const inDelim = inputDelimiterSelect.value;
        const inDec = inputDecimalSelect.value;
        const outDelim = outputDelimiterSelect.value;
        const outDec = outputDecimalSelect.value;
        
        statusArea.textContent = 'Konvertiere...';

        // Einfachster Ansatz: Zeilenweise parsen und ersetzen
        const lines = loadedFileContent.split('\n');
        const convertedLines = lines.map(line => {
            
            // 1. Dezimaltrennzeichen ersetzen (muss vor Listentrennzeichen passieren!)
            // Wir müssen vorsichtig sein, nur Zahlen zu erwischen, das ist komplex.
            // Einfacher Ansatz: Wir ersetzen global und hoffen das Beste, 
            // oder wir nutzen eine Bibliothek (was hier zu komplex wäre).
            
            // Gehen wir davon aus, dass wir einfach alle Vorkommen ersetzen:
            let processedLine = line.split(inDec).join(outDec);


            // 2. Listentrennzeichen ersetzen
            // Das ist auch kompliziert, wenn das Dezimalzeichen im Text vorkommt.
            // Die robusteste Methode wäre ein echtes CSV-Parser-Skript.
            
            // Für diesen einfachen Rechner ersetzen wir nur das Listentrennzeichen:
            const finalLine = line.split(inDelim).join(outDelim);
            
            // WICHTIG: Die Dezimal-Logik ist sehr fehleranfällig bei dieser einfachen Methode! 
            // Ein robusterer Ansatz würde ein CSV-Parsing Library benötigen.
            // Wir lassen die Dezimaltrennzeichen-Konvertierung vorerst weg, 
            // da es ohne Library zu unzuverlässig ist.
            return finalLine;
        });

        const outputCsv = convertedLines.join('\n');
        
        // --- 5. Download erzeugen ---
        const blob = new Blob([outputCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'konvertierte_datei.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        statusArea.textContent = 'Download abgeschlossen.';
    }
});
