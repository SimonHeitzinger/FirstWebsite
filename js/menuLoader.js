// js/menuLoader.js
document.addEventListener('DOMContentLoaded', () => {
    // Der Pfad ist jetzt relativ zur Basis-URL, die im HTML gesetzt wird (dank des <base>-Tags)
    const menuPath = 'includes/navigation.html'; 
    const menuContainer = document.getElementById('menu-container');

    if (menuContainer) {
        fetch(menuPath)
            .then(response => response.text())
            .then(html => {
                menuContainer.innerHTML = html;

                // NEU HIER: JS Logik für Klick-bares Submenü (besser für Touchscreens)
                document.querySelectorAll('.has-submenu > a').forEach(link => {
                    link.addEventListener('click', function(e) {
                        // Verhindert das Standard-Link-Verhalten auf mobilen Geräten
                        if (window.innerWidth < 600) { 
                             e.preventDefault();
                             const submenu = this.nextElementSibling;
                             if (submenu.style.display === 'block') {
                                 submenu.style.display = 'none';
                             } else {
                                 submenu.style.display = 'block';
                             }
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Fehler beim Laden des Navigationsmenüs:', error);
                menuContainer.innerHTML = '<p>Menü konnte nicht geladen werden.</p>';
            });
    }
});
