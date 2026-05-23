// Gestione globale dell'utente
let utenteCorrente = "";

// ========== CONFIGURAZIONE DEBUG ==========
// Variabile per attivare/disattivare i bottoni debug
let DEBUG_MODE = false;

// Funzione per attivare la modalità debug
function enableDebugMode() {
    DEBUG_MODE = true;
    const debugButtons = document.getElementById('debug-buttons');
    if (debugButtons) {
        debugButtons.style.display = 'flex';
    }
    console.log('%c✓ Modalità DEBUG attivata!', 'color: green; font-weight: bold; font-size: 14px;');
    console.log('%cI bottoni di test sono ora visibili nella pagina "Scegli la sfida".', 'color: green;');
}

// Funzione per disattivare la modalità debug
function disableDebugMode() {
    DEBUG_MODE = false;
    const debugButtons = document.getElementById('debug-buttons');
    if (debugButtons) {
        debugButtons.style.display = 'none';
    }
    console.log('%c✗ Modalità DEBUG disattivata.', 'color: red; font-weight: bold; font-size: 14px;');
}

// Funzione per controllare lo stato della modalità debug
function getDebugMode() {
    console.log('Debug Mode:', DEBUG_MODE ? 'ATTIVATO' : 'DISATTIVATO');
    return DEBUG_MODE;
}

/**
 * Cambia la visualizzazione tra le diverse sezioni (pagine) dell'app
 * @param {string} pageId - L'ID della sezione da mostrare
 */
function showPage(pageId) {
    console.log("Navigazione verso:", pageId);

    document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
    document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    
    // Nasconde tutte le pagine
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none'; // Forza la chiusura
    });

    // Mostra la pagina richiesta
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'flex'; // Usa flex per mantenere il layout pop
        targetPage.style.minHeight = '100vh';
        targetPage.style.height = '100vh';
        targetPage.style.setProperty('overflow-y', 'auto', 'important');
        targetPage.style.setProperty('overflow-x', 'hidden', 'important');
    }
}

/**
 * Valida l'inserimento del nome e passa alla scelta del quiz
 */
function validaEInizia() {
    const nome = document.getElementById('username').value.trim();
    const eta = document.getElementById('user-age').value;

    if (nome.length < 2) {
        alert("Inserisci un nome valido per iniziare!");
        return;
    }

    // Qui puoi salvare i dati globalmente o inviarli alle tue statistiche
    window.utenteLoggato = {
        nome: nome,
        eta: eta || "Non specificata"
    };

    showPage('page-quiz');
}

// Registrazione del Service Worker per il funzionamento Offline (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('PWA: Service Worker registrato con successo!'))
            .catch(err => console.error('PWA: Errore registrazione SW:', err));
    });
}

// Monitoraggio dello stato di connessione
let offlineNotificationShown = false;
window.addEventListener('online', () => {
    console.log('✓ Connessione ripristinata');
    offlineNotificationShown = false;
});

window.addEventListener('offline', () => {
    console.log('✗ Sei offline - la webapp continuerà a funzionare con i contenuti in cache');
    if (!offlineNotificationShown && document.documentElement.lang) {
        offlineNotificationShown = true;
    }
});

// Inizializzazione: assicura che all'avvio si veda la home
window.onload = () => showPage('page-home');

try {
    Object.assign(window, {
        showPage,
        validaEInizia,
        enableDebugMode,
        disableDebugMode,
        getDebugMode
    });
} catch (err) {
    // ambiente non-browser o scope limitato
}