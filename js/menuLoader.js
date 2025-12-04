// js/menuLoader.js (KORRIGIERTE VERSION)

// Konfigurieren Sie hier den Namen Ihres GitHub-Repositories, falls zutreffend.
// Bei simonheitzinger.github.io ist es leer ('').
// Bei benutzername.github.io wäre es 'MeinRepo'.
const REPO_BASE_NAME = ''; // <-- HIER ggf. 'FirstWebsite' eintragen, falls nötig

/**
 * Berechnet den Basis-URL-Pfad für das Projekt.
 * Passt sich automatisch an, ob es lokal läuft oder auf GitHub Pages.
 */
function getBasePath() {
    if (window.location.hostname.endsWith('.github.io') && REPO_BASE_NAME.length > 0) {
        return '/' + REPO_BASE_NAME + '/';
    }
    // Lokal oder bei Veröffentlichung direkt im Root der gh-pages Domain
    return '/';
}

/**
 * Berechnet den relativen Pfad (z.B. '../../') vom aktuellen Standort zum Stamm.
 */
function getPathPrefix() {
    const basePath = getBasePath();
    const currentPath = window.location.pathname;

    // Wir schneiden den Basispfad vom aktuellen Pfad ab, um den relativen Pfad zu erhalten
    const relativePath = currentPath.replace(basePath, '/').split('/').filter(segment => segment.length > 0);

    // Zählen, wie viele Ebenen wir hoch müssen, um zur Basis zu gelangen
    // Jeder Segment muss durch '../' ersetzt werden
    let prefix = '';
    // Der letzte Segment ist normalerweise die Datei selbst (z.B. index.html), die ignorieren wir beim Hochzählen
    for (let i = 0; i < relativePath.length - 1; i++) {
        prefix += '../';
    }
    return prefix;
}


document.addEventListener('DOMContentLoaded', () => {
    // Die Pfade in navigation.html sollten nun relative URLs sein, 
    // z.B. <a href="tools/geometrie/index.html"> anstatt <a href="/tools/geometrie/index.html">
    const menuPath = getPathPrefix() + 'includes/navigation.html'; 
    const menuContainer = document.getElementById('menu-container');

    if (menuContainer) {
        fetch(menuPath)
            .then(response => response.text())
            .then(html => {
                menuContainer.innerHTML = html;
                
                // Wir verwenden jetzt getBasePath(), um alle Links absolut zu machen
                const base = getBasePath();
                menuContainer.querySelectorAll('a').forEach(link => {
                    const originalHref = link.getAttribute('href');
                    
                    // Verhindert doppelte Schrägstriche, falls originalHref bereits mit '/' beginnt
                    if (originalHref.startsWith('/')) {
                       link.setAttribute('href', base + originalHref.substring(1));
                    } else {
                       // Die Pfade in navigation.html sind relativ zum Stammverzeichnis
                       link.setAttribute('href', base + originalHref);
                    }
                });

                // ... (Ihr Submenü-JS-Code für Klicks bleibt gleich) ...
            })
            .catch(error => {
                console.error('Fehler beim Laden des Navigationsmenüs:', error);
            });
    }
});
