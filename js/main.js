// Gestione globale dell'utente
let utenteCorrente = "";

/**
 * Cambia la visualizzazione tra le diverse sezioni (pagine) dell'app
 * @param {string} pageId - L'ID della sezione da mostrare
 */
function showPage(pageId) {
    console.log("Navigazione verso:", pageId);
    
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

// Inizializzazione: assicura che all'avvio si veda la home
window.onload = () => showPage('page-home');