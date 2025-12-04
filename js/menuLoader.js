// js/menuLoader.js (NEU MIT UMSCHREIB-LOGIK)

// Funktion, um den relativen Pfad vom aktuellen Standort zum Stamm zu berechnen
function getPathPrefix() {
    const pathSegments = window.location.pathname.split('/').filter(segment => segment.length > 0);
    // Zählen, wie viele Ebenen wir hoch müssen, um zum Stamm zu gelangen
    // Wir ignorieren das Repositoriums-Segment bei GitHub Pages
    const depth = window.location.hostname.endsWith('.github.io') ? pathSegments.length - 1 : pathSegments.length;
    
    let prefix = '';
    for (let i = 0; i < depth - 1; i++) { // -1 weil die index.html selbst eine Ebene ist
        prefix += '../';
    }
    return prefix;
}


document.addEventListener('DOMContentLoaded', () => {
    const menuPath = getPathPrefix() + 'includes/navigation.html'; // Lädt die Quelldatei relativ
    const menuContainer = document.getElementById('menu-container');

    if (menuContainer) {
        fetch(menuPath)
            .then(response => response.text())
            .then(html => {
                menuContainer.innerHTML = html;
                
                // JETZT WERDEN ALLE LINKS IM EINGEFÜGTEN HTML ANGEPASST
                const prefix = getPathPrefix();
                menuContainer.querySelectorAll('a').forEach(link => {
                    const originalHref = link.getAttribute('href');
                    // Wir hängen das Präfix VOR den Link
                    link.setAttribute('href', prefix + originalHref);
                });

                // ... (Ihr Submenü-JS-Code für Klicks bleibt gleich) ...
            })
            .catch(error => {
                console.error('Fehler beim Laden des Navigationsmenüs:', error);
            });
    }
});
