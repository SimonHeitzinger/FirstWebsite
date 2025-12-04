// js/menuLoader.js (GESAMTSCRIPT MIT HAMBURGER-LOGIK)

// Konfigurieren Sie hier den Namen Ihres GitHub-Repositories, falls zutreffend.
const REPO_BASE_NAME = 'FirstWebsite'; 
// Machen Sie diese global zugänglich
window.getBasePath = function() {
    if (window.location.hostname.endsWith('.github.io') && REPO_BASE_NAME.length > 0) {
        return '/' + REPO_BASE_NAME + '/';
    }
    return '/';
}

// Machen Sie diese global zugänglich
window.getPathPrefix = function() {
    const basePath = window.getBasePath(); // Jetzt rufen wir die globale Funktion auf
    const currentPath = window.location.pathname;
    const relativePath = currentPath.replace(basePath, '/').split('/').filter(segment => segment.length > 0);
    let prefix = '';
    for (let i = 0; i < relativePath.length - 1; i++) {
        prefix += '../';
    }
    return prefix;
}


document.addEventListener('DOMContentLoaded', () => {
    const menuPath = getPathPrefix() + 'includes/navigation.html'; 
    const menuContainer = document.getElementById('menu-container'); // Dies ist Ihr div im Haupt-HTML

    if (menuContainer) {
        fetch(menuPath)
            .then(response => response.text())
            .then(html => {
                menuContainer.innerHTML = html;
                
                // 1. Link-Umschreibung für korrekte Pfade (wie gehabt)
                const base = getBasePath();
                menuContainer.querySelectorAll('a').forEach(link => {
                    const originalHref = link.getAttribute('href');
                    
                    if (originalHref.startsWith('/')) {
                       link.setAttribute('href', base + originalHref.substring(1));
                    } else {
                       link.setAttribute('href', base + originalHref);
                    }
                });

                // 2. NEUE LOGIK FÜR DAS HAMBURGER-MENÜ (Schritt 3)
                const menuToggle = document.getElementById('menu-toggle'); // Der Button (☰)
                const menuInner = document.querySelector('.menu-container-inner'); // Das Menü, das ein-/ausgeblendet wird

                if (menuToggle && menuInner) {
                    menuToggle.addEventListener('click', () => {
                        // Diese Klasse wird per CSS gesteuert, um das Menü zu zeigen/verstecken
                        menuInner.classList.toggle('is-active');
                    });
                }

                // ... (Ihr bestehender Submenü-JS-Code für Klicks, falls vorhanden, hier einfügen) ...
            })
            .catch(error => {
                console.error('Fehler beim Laden des Navigationsmenüs:', error);
            });
    }
});
