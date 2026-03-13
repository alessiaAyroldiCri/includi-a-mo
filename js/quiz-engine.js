let statisticheGlobali = {
    genere: { punti: 0, totali: 0 },
    neuro: { punti: 0, totali: 0 },
    lgbt: { punti: 0, totali: 0 },
    multi: { punti: 0, totali: 0 }
};

let domandeCorrenti = [];
let indiceDomanda = 0;
let categoriaCorrente = "";
let punteggioTotale = 0;
let timerDislessia;
let caosInterval;

async function startQuiz(categoria) {
    categoriaCorrente = categoria;
    indiceDomanda = 0;
    punteggioTotale = 0;
    domandeCorrenti = await fetchQuizDati(categoria);
    
    if (domandeCorrenti && domandeCorrenti.length > 0) {
        showPage('page-action');
        mostraDomanda();
    }
}

function mostraDomanda() {
    // 1. Recuperiamo tutti i riferimenti necessari
    const questionContainer = document.querySelector('.question-container');
    const container = document.getElementById('options-grid');
    const display = document.getElementById('main-content');
    const skipWrapper = document.getElementById('skip-wrapper');
    const titolo = document.getElementById('game-title');
    const progressBar = document.getElementById('progress-bar');
    const betaWrapper = document.getElementById('beta-wrapper');

    // 2. RIPRISTINO UI (Importante per far sparire la schermata Multiculturalità)
    if (questionContainer) questionContainer.style.display = 'block';
    if (container) container.style.display = 'grid';
    if (betaWrapper) betaWrapper.style.display = 'none';
    if (skipWrapper) skipWrapper.style.display = 'block';

    // 3. Controllo se le domande sono finite
    if (indiceDomanda >= domandeCorrenti.length) {
        fineGioco(); // Questa funzione mostra la classifica del singolo quiz
        return;
    }

    const item = domandeCorrenti[indiceDomanda];

    // 4. Reset UI e Timer
    container.innerHTML = "";
    if (timerDislessia) clearInterval(timerDislessia);
    if (caosInterval) clearInterval(caosInterval);

    // 5. Gestione Progress Bar
    const percentuale = (indiceDomanda / domandeCorrenti.length) * 100;
    if (progressBar) progressBar.style.width = percentuale + "%";

    // --- LOGICA CATEGORIE ---

    // --- GENERE ---
    if (categoriaCorrente === 'genere') {
        titolo.innerText = "Lo conosci?"; 
        display.innerText = item.Frase;
        
        skipWrapper.innerHTML = `
            <button class="btn-skip" onclick="apriModale('${item.Frase.replace(/'/g, "\\'")}', '${item.Spiegazione.replace(/'/g, "\\'")}')">
                NON LO CONOSCO
            </button>
        `;

        container.innerHTML = `
            <button class="btn-option primary" onclick="aggiungiPuntoEApri('${item.Frase.replace(/'/g, "\\'")}', '${item.Spiegazione.replace(/'/g, "\\'")}')">
                SÌ, LO CONOSCO
            </button>
            <button class="btn-option primary" onclick="aggiungiPuntoEApri('${item.Frase.replace(/'/g, "\\'")}', '${item.Spiegazione.replace(/'/g, "\\'")}')">
                SÌ, L'HO GIÀ SENTITO
            </button>
        `;
    }

    // --- NEURO (DISLESSIA) ---
    else if (categoriaCorrente === 'neuro') {
        const nomiSfide = ["Visione Instabile", "Messa a Fuoco", "Occhio al Caos", "Decriptazione", "Sforzo Cognitivo"];
        titolo.innerText = nomiSfide[indiceDomanda] || "Sfida Estrema";
        skipWrapper.style.display = "none";
        
        let tempoSfida = 7;
        if (indiceDomanda === 1) tempoSfida = 5;
        if (indiceDomanda >= 2) tempoSfida = 3;

        avviaGiocoDislessia(item.Frase, tempoSfida);
    }

    // --- LGBTQ+ ---
    else if (categoriaCorrente === 'lgbt') {
        titolo.innerText = "Linguaggio Inclusivo";
        display.innerHTML = `
            <div class="box-errore">
                <small style="color:var(--cri-red); font-weight:800; text-transform:uppercase;">Frase da migliorare:</small><br>
                <span style="font-style: italic; font-size: 1.1rem;">"${item.Frase}"</span>
            </div>
            <p style="font-size:0.9rem; font-weight:800; margin-bottom:10px;">QUALE VERSIONE È PIÙ RISPETTOSA?</p>
        `;
        skipWrapper.style.display = "none"; 

        const opzioni = [
            { testo: item.Corretta, corretta: true },
            { testo: item.Sbagliata, corretta: false },
            { testo: item.Sbagliata2, corretta: false }
        ].sort(() => Math.random() - 0.5);

        container.innerHTML = opzioni.map(opt => {
            const spiegazionePulita = item.Spiegazione.replace(/'/g, "\\'").replace(/\n/g, ' ');
            const correttaPulita = item.Corretta.replace(/'/g, "\\'");
            return `
                <button class="btn-option primary" onclick="gestisciRispostaLGBT(this, ${opt.corretta}, '${correttaPulita}', '${spiegazionePulita}')">
                    ${opt.testo.toUpperCase()}
                </button>
            `;
        }).join('');
    }

    // --- MULTICULTURALITÀ ---
    else if (categoriaCorrente === 'multi') {
        titolo.innerText = "MULTICULTURALITÀ";
        display.innerHTML = `
            <div style="text-align: center; position: relative;">
                <img src="assets/icone/workInProgress.png" 
                     alt="Work in Progress" 
                     style="width: 90%; max-width: 320px; border: 4px solid black; box-shadow: 10px 10px 0px black; border-radius: 20px;">
                
                <p style="margin-top: 25px; font-weight: 900; font-size: 1.1rem; color: black; text-transform: uppercase;">
                    Sezione in arrivo...
                </p>
            </div>
        `;
        container.innerHTML = ``;
        skipWrapper.style.display = "none";
    }
}

function avviaGiocoDislessia(testoOriginale, tempo) {
    const display = document.getElementById('main-content');
    const container = document.getElementById('options-grid');
    
    const velocitàCaos = indiceDomanda >= 2 ? 200 : 400;
    const rimescola = () => { display.innerHTML = preparatestoDanzante(testoOriginale); };
    
    rimescola();
    caosInterval = setInterval(rimescola, velocitàCaos);
    
    let secondi = tempo;
    container.innerHTML = `
        <div style="text-align:center; width:100%;">
            <p style="color:var(--cri-red); font-weight:800; font-size: 0.9rem;">NON STACCARE GLI OCCHI!</p>
            <div id="timer" style="font-size: 3.5rem; font-weight: 800; color: var(--cri-red); line-height: 1;">${secondi}</div>
        </div>
    `;

    timerDislessia = setInterval(() => {
        secondi--;
        if (document.getElementById('timer')) document.getElementById('timer').innerText = secondi;
        if (secondi <= 0) {
            clearInterval(timerDislessia);
            clearInterval(caosInterval);
            mostraInputVerifica(testoOriginale);
        }
    }, 1000);
}

function mostraInputVerifica(corretta) {
    const display = document.getElementById('main-content');
    const container = document.getElementById('options-grid');

    display.innerText = "Cosa hai letto?";
    
    container.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; gap:12px;">
            <textarea id="risposta-neuro" class="pop-input" rows="3" placeholder="Scrivi qui la frase..." style="resize:none; padding:15px; font-size:1.1rem;"></textarea>
            <button class="btn-option primary" onclick="controllaRispostaNeuro('${corretta.replace(/'/g, "\\'")}')">VERIFICA RISPOSTA</button>
        </div>
    `;
    setTimeout(() => document.getElementById('risposta-neuro').focus(), 150);
}

function controllaRispostaNeuro(corretta) {
    const rispostaUtente = document.getElementById('risposta-neuro').value.trim().toLowerCase();
    const correttaLower = corretta.toLowerCase().trim();
    
    // Controlliamo se questa è l'ultima domanda del set
    const isUltimaDomanda = (indiceDomanda === domandeCorrenti.length - 1);

    if (rispostaUtente === correttaLower && rispostaUtente !== "") {
        punteggioTotale++;
        if (isUltimaDomanda) {
            // Se è l'ultima, carichiamo direttamente la schermata di fine gioco
            fineGioco();
        } else {
            apriModale("Ottima Vista!", `Hai decodificato correttamente: <br>"<em>${corretta}</em>"`);
        }
    } else {
        if (isUltimaDomanda) {
            // Anche se sbaglia l'ultima, mostriamo la fine del gioco con la spiegazione corretta
            statisticheGlobali[categoriaCorrente] = { punti: punteggioTotale, totali: domandeCorrenti.length };
            const percentuale = Math.round((punteggioTotale / domandeCorrenti.length) * 100);
            
            apriModale("Faticoso, vero?", `La frase era: <br>"<strong>${corretta}</strong>"<br><br>Questo è lo stress visivo quotidiano della dislessia.`, true);
        } else {
            apriModale("Faticoso, vero?", `La frase era: <br>"<strong>${corretta}</strong>"<br><br>Questo è lo stress visivo quotidiano della dislessia.`);
        }
    }
}

function preparatestoDanzante(testo) {
    return testo.split('').map(l => {
        if (l === ' ') return ' ';
        const anim = Math.floor(Math.random() * 3) + 1;
        return `<span class="lettera-danzante anim-${anim}">${l}</span>`;
    }).join('');
}

function gestisciRispostaLGBT(btn, isCorretta, corretta, spiegazione) {
    if (isCorretta) {
        punteggioTotale++;
        btn.style.backgroundColor = "#2ecc71"; // Verde successo
        btn.style.color = "white";
        setTimeout(() => apriModale("Esatto! ✨", spiegazione), 300);
    } else {
        // Applica la classe shake definita nel CSS
        btn.classList.add('shake');
        
        // Apri il modale dopo che l'animazione è finita
        setTimeout(() => {
            apriModale("Si può fare di meglio", `La forma più inclusiva è:<br><strong>${corretta}</strong><br><br>${spiegazione}`);
            btn.classList.remove('shake');
        }, 600);
    }
}

function aggiungiPuntoEApri(termine, spiegazione) {
    punteggioTotale++;
    // Se siamo all'ultima domanda, mostra il punteggio del quiz
    const isUltima = (indiceDomanda + 1 >= domandeCorrenti.length);
    if (isUltima) {
        fineGioco();
    } else {
        apriModale(termine, spiegazione, false);
    }
}

function apriModale(titolo, testo, isFineGioco = false) {
    document.getElementById('modal-termine').innerText = titolo;
    document.getElementById('modal-testo').innerHTML = testo;
    
    const btnHoCapito = document.querySelector('#modal-spiegazione .btn-start');

    if (isFineGioco) {
        // Nascondiamo il tasto "Ho Capito" e mostriamo il contenuto di fine gioco
        if (btnHoCapito) btnHoCapito.style.display = 'none';
        
        // Aggiungiamo il tasto "Torna alla Home" se non è già presente nel testo
        if (!testo.includes('tornaAllaHome')) {
            document.getElementById('modal-testo').innerHTML += `
                <button class="btn-option primary" onclick="tornaAllaHome()" style="margin-top:20px; width:100%;">
                    CONTINUA IL PERCORSO
                </button>
            `;
        }
    } else {
        if (btnHoCapito) btnHoCapito.style.display = 'block';
    }

    document.getElementById('modal-spiegazione').style.display = 'flex';
}

function chiudiModale() {
    document.getElementById('modal-spiegazione').style.display = 'none';
    
    // Se eravamo all'ultima domanda, chiudendo il modale andiamo alla home
    if (indiceDomanda >= domandeCorrenti.length - 1) {
        fineGioco();
    } else {
        prossimaDomanda();
    }
}

function prossimaDomanda() {
    indiceDomanda++;
    mostraDomanda();
}

function controllaSeTuttiCompletati() {
    // Controlliamo se almeno 3 categorie su 4 hanno un punteggio (totali > 0)
    const categorieGiocate = Object.values(statisticheGlobali).filter(s => s.totali > 0).length;
    
    // Per il TEST: impostiamo a 3 invece di 4
    if (categorieGiocate === 3) {
        mostraProfiloFinale();
    }
}

function mostraProfiloFinale() {
    let puntiTot = 0;
    let maxTot = 0;
    
    for (let cat in statisticheGlobali) {
        puntiTot += statisticheGlobali[cat].punti;
        maxTot += statisticheGlobali[cat].totali;
    }
    
    const mediaFinale = Math.round((puntiTot / maxTot) * 100);
    
    let personaggio = "";
    let descrizione = "";
    let emoji = "";
    
    if (mediaFinale >= 90) {
        personaggio = "L'AMBASCIATORE";
        emoji = "👑";
        descrizione = "Incredibile! Sei un punto di riferimento. Promuovi l'equità e il rispetto in ogni tuo gesto quotidiano.";
    } else if (mediaFinale >= 70) {
        personaggio = "L'ALLEATO";
        emoji = "🤝";
        descrizione = "Ottimo! Sei una persona molto sensibile e sai come supportare attivamente le diversità intorno a te.";
    } else if (mediaFinale >= 50) {
        personaggio = "L'ESPLORATORE";
        emoji = "🔍";
        descrizione = "Sei sulla strada giusta! La tua curiosità e voglia di imparare ti renderanno un cittadino più consapevole.";
    } else {
        personaggio = "IL CURIOSO";
        emoji = "✨";
        descrizione = "Hai appena iniziato il tuo viaggio nell'inclusione. Continua a esplorare per abbattere ogni barriera!";
    }

    // Effetto coriandoli a pioggia continua per il gran finale!
    var duration = 3 * 1000;
    var end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e10613', '#ff0000']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e10613', '#ff0000']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
    
    // Popoliamo la pagina profilo
    document.getElementById('profilo-emoji').innerText = emoji;
    document.getElementById('profilo-nome').innerText = personaggio;
    document.getElementById('profilo-descrizione').innerText = descrizione;
    document.getElementById('profilo-percentuale').innerText = mediaFinale + "%";

    // Mostriamo la pagina finale
    showPage('page-profile');
}

function fineGioco() {
    statisticheGlobali[categoriaCorrente] = {
        punti: punteggioTotale,
        totali: domandeCorrenti.length
    };

    const percentualePercorso = Math.round((punteggioTotale / domandeCorrenti.length) * 100);
    
    // Lancio dei coriandoli se la percentuale è 100%
    if (percentualePercorso === 100) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#e10613', '#ffffff', '#ffccd5'] // Colori CRI
        });
    }

    let fraseMotivazionale = "";
    if (percentualePercorso === 100) fraseMotivazionale = "Eccellente! Sei un vero alleato dell'inclusione! 🌟";
    else if (percentualePercorso >= 70) fraseMotivazionale = "Ottimo lavoro! La tua consapevolezza è molto alta. 🚀";
    else if (percentualePercorso >= 40) fraseMotivazionale = "Buon inizio! C'è sempre spazio per imparare cose nuove. 🌱";
    else fraseMotivazionale = "Grazie per esserti messo in gioco. L'importante è iniziare a capire! 💪";

    apriModale("Gioco Completato!", `
        <div style="text-align:center;">
            <h2 style="font-size: 3.5rem; color: var(--cri-red); margin: 10px 0; font-weight: 900;">${percentualePercorso}%</h2>
            <p style="text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Grado di Inclusività</p>
            <p style="margin: 20px 0; font-size: 1.1rem; line-height: 1.4;">${fraseMotivazionale}</p>
            <p style="color: #666;">Risposte corrette: ${punteggioTotale} su ${domandeCorrenti.length}</p>
            
            <button class="btn-option primary" onclick="tornaAllaHome()" style="margin-top:25px; width: 100%;">
                CONTINUA IL PERCORSO
            </button>
        </div>
    `, true);
}

// Funzione di supporto per tornare alla home
function tornaAllaHome() {
    document.getElementById('modal-spiegazione').style.display = 'none';
    showPage('page-quiz');
    
    const card = document.querySelector(`[onclick="startQuiz('${categoriaCorrente}')"]`);
    if(card && !card.innerHTML.includes("✅")) { // Controllo se l'emoji c'è già
        card.style.opacity = "0.6";
        card.style.border = "2px solid #2ecc71";
        card.innerHTML += " ✅";
        card.onclick = null; 
    }

    controllaSeTuttiCompletati();
}

// per DEBUG
function debugSimulaTutto(punteggioPercentuale) {
    // Simuliamo 5 domande per ogni categoria
    const categorie = ['genere', 'neuro', 'lgbt', 'multi'];
    
    categorie.forEach(cat => {
        // Calcoliamo i punti in base alla percentuale che vogliamo testare
        const puntiSimulati = Math.round((5 * punteggioPercentuale) / 100);
        
        statisticheGlobali[cat] = {
            punti: puntiSimulati,
            totali: 5
        };
    });

    // Lanciamo la schermata finale che abbiamo costruito
    mostraProfiloFinale();
}

function mostraWorkInProgress() {
    showPage('page-action'); 
    
    const display = document.getElementById('main-content');
    const container = document.getElementById('options-grid');
    const skipWrapper = document.getElementById('skip-wrapper');
    const titolo = document.getElementById('game-title');
    const questionContainer = document.querySelector('.question-container');
    const progressBar = document.querySelector('.progress-fill');

    // 1. Nascondiamo i pezzi del quiz che non servono
    if (questionContainer) questionContainer.style.display = 'none';
    if (container) container.style.display = 'none';
    if (skipWrapper) skipWrapper.style.display = 'none';
    display.innerHTML = ""; 

    titolo.innerText = "MULTICULTURALITÀ";
    if (progressBar) progressBar.style.width = "100%";

    // 2. Creiamo il contenitore per l'immagine (se non esiste)
    let betaWrapper = document.getElementById('beta-wrapper');
    if (!betaWrapper) {
        betaWrapper = document.createElement('div');
        betaWrapper.id = 'beta-wrapper';
        document.getElementById('page-action').appendChild(betaWrapper);
    }
    
    betaWrapper.style.display = 'block';
    
    // 3. Layout con Tasto Home e Tasto Risultati
    betaWrapper.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; position: relative;">
            
            <button onclick="location.reload()" class="btn-home-top" style="position: absolute; top: -10px; left: 10px;">
                🏠 HOME
            </button>

            <div style="margin-top: 40px; text-align: center;">
                <img src="assets/icone/workInProgress.png" 
                     alt="Work in Progress" 
                     style="width: 90%; max-width: 320px; border: 4px solid black; box-shadow: 10px 10px 0px black; border-radius: 20px;">
                
                <p style="margin-top: 25px; font-weight: 900; font-size: 1.1rem; color: black; text-transform: uppercase;">
                    Sezione in arrivo...
                </p>

                <button onclick="terminaSessioneBeta()" class="btn-option primary" style="margin-top: 20px; width: auto; padding: 15px 30px;">
                    COMPLETA IL TOUR
                </button>
            </div>
        </div>
    `;
}

// Questa funzione simula la fine del 3° quiz
function terminaSessioneBeta() {
    categoriaCorrente = 'multi';
    punteggioTotale = 1;
    domandeCorrenti = [{Frase: "Beta"}]; 

    const betaWrapper = document.getElementById('beta-wrapper');
    if (betaWrapper) betaWrapper.style.display = 'none';

    // Chiama la funzione che mostra il punteggio e controlla se hai fatto i 3 quiz
    fineGioco();
}