let statisticheGlobali = {
    genere: { punti: 0, totali: 0 },
    neuro: { punti: 0, totali: 0 },
    lgbt: { punti: 0, totali: 0 },
    video_interactive: { punti: 0, totali: 0 }
};

let domandeCorrenti = [];
let indiceDomanda = 0;
let categoriaCorrente = "";
let punteggioTotale = 0;
let timerDislessia;
let caosInterval;
const REPORT_STORAGE_KEY = 'includiamo_report_records';
// Session report corrente (inizializzato al primo utilizzo)
let sessioneReportCorrente = null;

function initSessioneReport() {
    if (sessioneReportCorrente) return;
    sessioneReportCorrente = {
        sessionId: 's-' + Date.now(),
        nome: (window.utenteLoggato && window.utenteLoggato.nome) || 'Anonimo',
        etaRange: (window.utenteLoggato && window.utenteLoggato.eta) || '',
        timestamp: new Date().toISOString(),
        minigiochi: {
            genere: { punti: 0, totali: 0 },
            neuro: { punti: 0, totali: 0 },
            lgbt: { punti: 0, totali: 0 },
            video_interactive: { punti: 0, totali: 0 }
        },
        completato: false
    };
}

function salvaSessioneReport() {
    initSessioneReport();
    try {
        const lista = JSON.parse(localStorage.getItem(REPORT_STORAGE_KEY) || '[]');
        const idx = lista.findIndex(r => r.sessionId === sessioneReportCorrente.sessionId);
        if (idx >= 0) lista[idx] = sessioneReportCorrente;
        else lista.push(sessioneReportCorrente);
        localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(lista));
    } catch (err) {
        console.warn('Impossibile salvare sessioneReportCorrente:', err);
    }
}

function registraRispostaMinigioco(categoria, dati) {
    try {
        initSessioneReport();
        if (!sessioneReportCorrente.risposte) {
            sessioneReportCorrente.risposte = {};
        }
        if (!sessioneReportCorrente.risposte[categoria]) {
            sessioneReportCorrente.risposte[categoria] = [];
        }
        sessioneReportCorrente.risposte[categoria].push(dati);
        salvaSessioneReport();
    } catch (err) {
        console.warn('Errore nella registrazione risposta:', err);
    }
}

    // Gestione della sequenza di video-interactive (due parti con overlay e opzioni)
    async function gestisciVideoSequence(startIndex) {
        const questionContainer = document.querySelector('.question-container');
        const standardOptions = document.getElementById('options-grid');
        const skipWrapper = document.getElementById('skip-wrapper');
        const title = document.getElementById('game-title');
        const display = document.getElementById('main-content');
        const videoContainer = document.getElementById('video-game-container');
        const videoInstructions = document.getElementById('video-instructions');
        const player = document.getElementById('interactive-player');
        const overlay = document.getElementById('video-overlay');
        const questionText = document.getElementById('overlay-question-text');
        const optionsGrid = document.getElementById('video-options-grid');

        if (questionContainer) questionContainer.style.display = 'none';
        if (standardOptions) standardOptions.style.display = 'none';
        if (skipWrapper) skipWrapper.style.display = 'none';
        if (videoContainer) videoContainer.classList.remove('hidden');
        // Mostro le istruzioni solo per il primo video (quando startIndex === 0)
        if (videoInstructions) videoInstructions.style.display = (startIndex === 0) ? 'block' : 'none';
        if (title) title.innerText = 'MULTICULTURALITÀ';
        if (display) display.textContent = '';
        if (overlay) overlay.classList.add('hidden');

        if (!player || !overlay || !questionText || !optionsGrid) {
            console.warn('Elementi video quiz mancanti nel DOM.');
            return;
        }

        const entraInFullscreen = async () => {
            if (!videoContainer || !player) return;
            
            // Se siamo già in fullscreen, non fare nulla
            if (document.fullscreenElement) return;
            
            try {
                // Per iOS: usa il fullscreen nativo del video
                if (player.webkitEnterFullscreen && typeof player.webkitEnterFullscreen === 'function') {
                    player.webkitEnterFullscreen();
                    return;
                }
                
                // Per altri browser (Android, Desktop): fullscreen del container
                if (videoContainer.requestFullscreen) {
                    await videoContainer.requestFullscreen({ navigationUI: 'hide' });
                    return;
                }
                
                // Fallback per webkit browsers
                if (videoContainer.webkitRequestFullscreen) {
                    videoContainer.webkitRequestFullscreen();
                    return;
                }
                
                // Fallback per altri prefissi
                if (videoContainer.mozRequestFullScreen) {
                    videoContainer.mozRequestFullScreen();
                    return;
                }
                
                if (videoContainer.msRequestFullscreen) {
                    videoContainer.msRequestFullscreen();
                    return;
                }
            } catch (err) {
                console.warn('Fullscreen non disponibile:', err);
            }
        };

        const esciDaFullscreen = async () => {
            if (!document.fullscreenElement) return;
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } catch (err) {
                console.warn('Exit fullscreen fallito:', err);
            }
        };

        const playQuestion = (domanda, isSecondVideo = false) => new Promise((resolve) => {
            const onPart1Ended = () => {
                player.removeEventListener('ended', onPart1Ended);
                
                // Esci dal fullscreen prima di mostrare l'overlay con la domanda
                if (overlay) {
                    overlay.classList.remove('hidden');
                    // Rendi l'overlay fullscreen
                    overlay.style.position = 'fixed';
                    overlay.style.inset = '0';
                    overlay.style.zIndex = '200';
                    overlay.style.display = 'flex';
                }
                questionText.textContent = domanda.question || domanda.Frase || '';
                optionsGrid.innerHTML = '';

                domanda.options.forEach((opzione) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'video-option-btn';
                    button.textContent = opzione;
                    button.dataset.correct = String(opzione === domanda.correctAnswer);

                    const onClick = () => {
                        const isCorrect = button.dataset.correct === 'true';
                        if (overlay) {
                            overlay.classList.add('hidden');
                            overlay.style.position = '';
                            overlay.style.inset = '';
                            overlay.style.zIndex = '';
                            overlay.style.display = '';
                        }

                        const onPart2Ended = () => {
                            player.removeEventListener('ended', onPart2Ended);
                            resolve(isCorrect);
                        };
                        
                        const handlePart2Error = () => {
                            player.removeEventListener('error', handlePart2Error);
                            console.warn('Seconda parte del video non disponibile');
                            // Se fallisce il caricamento della parte 2, considera la risposta già data
                            resolve(isCorrect);
                        };

                        player.addEventListener('ended', onPart2Ended);
                        player.addEventListener('error', handlePart2Error, { once: true });
                        player.pause();
                        player.currentTime = 0;
                        player.src = domanda.videoPart2 || domanda.videoPart1;
                        player.load();
                        player.play().catch(err => console.warn('Impossibile avviare la seconda parte:', err));
                    };

                    button.addEventListener('click', onClick, { once: true });
                    optionsGrid.appendChild(button);
                });
            };

            const startVideo = () => {
                player.addEventListener('ended', onPart1Ended, { once: true });
                player.pause();
                player.currentTime = 0;
                player.src = domanda.videoPart1;
                player.load();
                
                // Gestione degli errori di caricamento video (offline)
                player.addEventListener('error', () => {
                    console.warn('Video non disponibile (offline):', domanda.videoPart1);
                    
                    // Crea un placeholder visivo
                    const fallbackContainer = document.createElement('div');
                    fallbackContainer.style.cssText = `
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
                        color: white;
                        font-family: 'Lexend', sans-serif;
                        padding: 40px 20px;
                        box-sizing: border-box;
                        text-align: center;
                    `;
                    fallbackContainer.innerHTML = `
                        <div style="font-size: 4rem; margin-bottom: 20px;">📹</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1.3rem; font-weight: 800;">Video non disponibile</h3>
                        <p style="margin: 0; font-size: 1rem; opacity: 0.9;">Sei offline</p>
                        <p style="margin: 20px 0 0 0; font-size: 0.9rem; opacity: 0.7;">Continua in 3 secondi...</p>
                    `;
                    
                    const playerContainer = player.parentNode;
                    if (playerContainer) {
                        playerContainer.replaceChild(fallbackContainer, player);
                    }
                    
                    setTimeout(() => {
                        if (overlay) overlay.classList.remove('hidden');
                        onPart1Ended();
                    }, 3000);
                }, { once: true });
                
                // Richiedi fullscreen PRIMA di fare il play
                setTimeout(async () => {
                    player.play().catch(err => console.warn('Impossibile avviare il video:', err));
                }, 50);
            };

            // Se è il secondo video, mostra overlay di contesto per 8 secondi prima di partire
            if (isSecondVideo) {
                const contextOverlay = document.getElementById('context-overlay-fullscreen');
                const countdownElement = contextOverlay.querySelector('#context-countdown-timer');
                
                if (contextOverlay) {
                    contextOverlay.classList.remove('hidden');
                }
                
                // Countdown per autostart oppure click dell'utente
                let secondsLeft = 8;
                const countdownInterval = setInterval(() => {
                    secondsLeft--;
                    if (countdownElement) {
                        countdownElement.textContent = secondsLeft > 0 ? `Inizia tra ${secondsLeft} secondi...` : 'Inizia ora...';
                    }
                    if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                        startVideoWithFullscreen();
                    }
                }, 1000);
                
                // Consenti all'utente di cliccare l'overlay per far partire subito il video
                const startVideoWithFullscreen = () => {
                    if (contextOverlay) {
                        contextOverlay.classList.add('hidden');
                        // Abbassa il z-index dell'overlay dietro il video
                        contextOverlay.style.zIndex = '-1000';
                        contextOverlay.style.pointerEvents = 'none';
                    }
                    clearInterval(countdownInterval);
                    // Delay sufficiente per assicurare che l'overlay sia rimosso prima del fullscreen
                    setTimeout(() => startVideo(), 100);
                };
                
                contextOverlay.addEventListener('click', startVideoWithFullscreen, { once: true });
            } else {
                startVideo();
            }
        });

        const q1 = domandeCorrenti[startIndex];
        const q2 = domandeCorrenti[startIndex + 1];
        const risposte = [];

        if (q1) {
            const r1 = await playQuestion(q1, false);
            risposte.push({ question: q1.question || q1.Frase || '', correct: r1 });
        }
        if (q2) {
            const r2 = await playQuestion(q2, true);
            risposte.push({ question: q2.question || q2.Frase || '', correct: r2 });
        }

        const puntiOttenuti = risposte.filter(r => r.correct).length;
        punteggioTotale += puntiOttenuti;
        statisticaAggiorna('video_interactive', puntiOttenuti, risposte.length);
        registraRispostaMinigioco('video_interactive', { risposte, punti: puntiOttenuti, totali: risposte.length, timestamp: new Date().toISOString() });

        const percent = Math.round((puntiOttenuti / (risposte.length || 1)) * 100);
        const resultHtml = `
            <div style="text-align:center;">
                <h2 style="font-size: 2rem; margin: 6px 0;">${percent}%</h2>
                <p style="font-weight:800; text-transform:uppercase;">Punteggio Video Quiz</p>
                <p style="margin:10px 0; font-size:1.1rem;">Hai totalizzato <strong>${puntiOttenuti}</strong> su <strong>${risposte.length}</strong></p>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:12px; flex-wrap:wrap;">
                    <button class="btn-option primary" onclick="chiudiModale()" style="min-width:150px;">CONTINUA</button>
                </div>
            </div>
        `;

        
        apriModale('Risultato', resultHtml, false);
        indiceDomanda = startIndex + risposte.length;
        mostraDomanda();
    }
// Funzione chiamata dal bottone nel modale per forzare il fullscreen sul contenitore video
function entraFullscreenDaModal() {
    const videoContainer = document.getElementById('video-game-container');
    const player = document.getElementById('interactive-player');
    if (!videoContainer || !player) return;

    const doRequest = async () => {
        try {
            // Per iOS: usa il fullscreen nativo del video
            if (player.webkitEnterFullscreen && typeof player.webkitEnterFullscreen === 'function') {
                player.webkitEnterFullscreen();
                return;
            }
            
            // Per altri browser (Android, Desktop): fullscreen del container
            if (videoContainer.requestFullscreen) {
                await videoContainer.requestFullscreen({ navigationUI: 'hide' });
                if (player) player.play().catch(err => console.warn('Play dopo fullscreen fallito:', err));
                return;
            }
            
            // Fallback per webkit browsers
            if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
                if (player) player.play().catch(err => console.warn('Play dopo fullscreen fallito:', err));
                return;
            }
            
            // Fallback per altri prefissi
            if (videoContainer.mozRequestFullScreen) {
                videoContainer.mozRequestFullScreen();
                if (player) player.play().catch(err => console.warn('Play dopo fullscreen fallito:', err));
                return;
            }
            
            if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
                if (player) player.play().catch(err => console.warn('Play dopo fullscreen fallito:', err));
                return;
            }
        } catch (err) {
            console.warn('Fullscreen fallito:', err);
        }
    };

    doRequest();
}

// Helper per aggiornare statistiche globali in modo coerente
function statisticaAggiorna(categoria, punti, totali) {
    if (!statisticheGlobali[categoria]) statisticheGlobali[categoria] = { punti: 0, totali: 0 };
    statisticheGlobali[categoria].punti += punti;
    statisticheGlobali[categoria].totali += totali;
    if (sessioneReportCorrente && sessioneReportCorrente.minigiochi[categoria]) {
        sessioneReportCorrente.minigiochi[categoria].punti = (sessioneReportCorrente.minigiochi[categoria].punti || 0) + punti;
        sessioneReportCorrente.minigiochi[categoria].totali = (sessioneReportCorrente.minigiochi[categoria].totali || 0) + totali;
        salvaSessioneReport();
    }
}

function resetVideoQuizUI() {
    const videoContainer = document.getElementById('video-game-container');
    const overlay = document.getElementById('video-overlay');
    const videoInstructions = document.getElementById('video-instructions');
    const player = document.getElementById('interactive-player');
    const pageAction = document.getElementById('page-action');
    const display = document.getElementById('main-content');

    if (player) {
        player.pause();
        player.onended = null;
        player.removeAttribute('src');
        player.load();
    }

    if (overlay) overlay.classList.add('hidden');
    if (videoContainer) videoContainer.classList.add('hidden');
    if (videoInstructions) videoInstructions.style.display = 'none';
    if (pageAction) pageAction.classList.remove('video-mode');
    if (display && display.textContent === '') display.textContent = 'CARICAMENTO...';
}

async function mostraDomanda() {
    // 1. Recuperiamo tutti i riferimenti necessari
    const questionContainer = document.querySelector('.question-container');
    const container = document.getElementById('options-grid');
    const display = document.getElementById('main-content');
    const skipWrapper = document.getElementById('skip-wrapper');
    const titolo = document.getElementById('game-title');
    const progressBar = document.getElementById('progress-bar');
    const betaWrapper = document.getElementById('beta-wrapper');
    const pageAction = document.getElementById('page-action');

    resetVideoQuizUI();

    // 2. RIPRISTINO UI (Importante per far sparire la schermata Multiculturalità)
    if (questionContainer) questionContainer.style.display = 'block';
    if (container) container.style.display = 'grid';
    if (betaWrapper) betaWrapper.style.display = 'none';
    if (skipWrapper) skipWrapper.style.display = 'block';
    if (container) container.classList.remove('matching-options');
    if (pageAction) pageAction.classList.remove('matching-mode');

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

    if (item.type === 'video_interactive' || categoriaCorrente === 'video_interactive') {
        await gestisciVideoSequence(indiceDomanda);
        return;
    }

    // --- GENERE ---
    if (categoriaCorrente === 'genere') {
        titolo.innerText = "Lo conosci?"; 
        display.innerText = item.Frase;
        
        skipWrapper.style.display = "none";

        container.innerHTML = `
            <button class="btn-option primary" onclick="rispondiGenereConosco('${item.Frase.replace(/'/g, "\\'")}', '${item.Spiegazione.replace(/'/g, "\\'")}', 'SI_LO_CONOSCO_E_USATO')">
                SÌ, LO CONOSCO E<br>L'HO USATO
            </button>
            <button class="btn-option primary" onclick="rispondiGenereConosco('${item.Frase.replace(/'/g, "\\'")}', '${item.Spiegazione.replace(/'/g, "\\'")}', 'SI_GIA_SENTITO')">
                L'HO SENTITO
            </button>
            <button class="btn-option primary" onclick="rispondiGenereNonConosco('${item.Frase.replace(/'/g, "\\'")}', '${item.Spiegazione.replace(/'/g, "\\'")}')">
                NON LO CONOSCO
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
        if (item.tipo === 'matching') {
            // Modalità MATCHING
            titolo.innerText = "Conosci i Termini LGBT+?";
            skipWrapper.style.display = "none";
            display.innerHTML = `<p style="font-size:0.9rem; font-weight:800; margin-bottom:10px; color: #666;">Collega ogni termine alla sua descrizione</p>`;
            
            // Mescola le descrizioni
            const descrizioniMescolate = [...item.descrizioni].sort(() => Math.random() - 0.5);
            
            avviaGiocoMatching(item.termini, descrizioniMescolate, item.descrizioni, { isRetryMode: false, resetProgress: true });
        } else {
            // Modalità CLASSICA (backup)
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
    }

}

function avviaGiocoDislessia(testoOriginale, tempo) {
    const display = document.getElementById('main-content');
    const container = document.getElementById('options-grid');
    testoNeuroCorrente = testoOriginale;
    
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
    // Normalizza sia la risposta che la corretta per evitare problemi Unicode su iOS
    const rispostaNormalizzata = document.getElementById('risposta-neuro').value.trim().normalize('NFC').replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
    const rispostaUtente = rispostaNormalizzata.toLowerCase();
    const correttaLimpa = corretta.normalize('NFC').replace(/[\u200B\u200C\u200D\uFEFF]/g, '').toLowerCase().trim();
    const rispostaOriginale = document.getElementById('risposta-neuro').value.trim();
    const isCorretta = (rispostaUtente === correttaLimpa && rispostaUtente !== "");

    registraRispostaMinigioco('neuro', {
        tipo: 'input-libero',
        fraseMostrata: testoNeuroCorrente,
        rispostaUtente: rispostaOriginale,
        rispostaCorretta: corretta,
        corretta: isCorretta,
        timestamp: new Date().toISOString()
    });
    
    // Controlliamo se questa è l'ultima domanda del set
    const isUltimaDomanda = (indiceDomanda === domandeCorrenti.length - 1);

    if (isCorretta) {
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
    // Normalizza la stringa per rimuovere caratteri invisibili e combinar diacritici
    const testoNormalizzato = testo.normalize('NFC').trim();
    // Rimuovi zero-width characters e altri caratteri invisibili
    const testoLimpo = testoNormalizzato.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
    
    return testoLimpo.split('').map(l => {
        if (l === ' ') return ' ';
        const anim = Math.floor(Math.random() * 3) + 1;
        return `<span class="lettera-danzante anim-${anim}">${l}</span>`;
    }).join('');
}

function avviaGiocoMatching(termini, descrizioniMescolate, descrizioniOriginali, opzioni = {}) {
    const display = document.getElementById('main-content');
    const container = document.getElementById('options-grid');
    const pageAction = document.getElementById('page-action');
    const splitIndex1 = Math.ceil(descrizioniMescolate.length / 3);
    const splitIndex2 = Math.ceil((descrizioniMescolate.length * 2) / 3);
    const descrizioniColonnaSinistra = descrizioniMescolate.slice(0, splitIndex1);
    const descrizioniColonnaCentro = descrizioniMescolate.slice(splitIndex1, splitIndex2);
    const descrizioniColonnaDestra = descrizioniMescolate.slice(splitIndex2);
    
    // Inizializzazione dello stato di gioco
    window.matchingState = {
        termini: termini,
        descrizioniMescolate: descrizioniMescolate,
        descrizioniOriginali: descrizioniOriginali,
        matches: {}, // { terminId: descrizioneId }
        selectedTermino: null,
        selectedDescrizione: null,
        isRetryMode: !!opzioni.isRetryMode
    };

    if (opzioni.resetProgress) {
        window.matchingProgress = {
            allIds: termini.map(t => t.id),
            correctById: {}
        };
    }

    container.innerHTML = `
        <div class="matching-container">
            <div class="matching-column">
                <div class="matching-header">Termini</div>
                <div id="termini-list" class="matching-list"></div>
            </div>
            <div class="matching-descriptions-group">
                <div class="matching-header">Descrizioni</div>
                <div class="matching-descriptions-columns">
                    <div id="descrizioni-list-left" class="matching-list"></div>
                    <div id="descrizioni-list-center" class="matching-list"></div>
                    <div id="descrizioni-list-right" class="matching-list"></div>
                </div>
            </div>
        </div>
        <div id="matching-actions" style="display: flex; gap: 15px; justify-content: center; align-items: center; margin-top: 20px; flex-wrap: wrap;">
            <button class="btn-option primary" onclick="verificaMatchingLGBT()">VERIFICA ABBINAMENTI</button>
            <button class="btn-skip" onclick="prossimaDomanda()">SALTA</button>
        </div>
    `;

    container.classList.add('matching-options');
    if (pageAction) pageAction.classList.add('matching-mode');

    // Renderizza i termini
    const terminiHtml = termini.map(t => `
        <div class="matching-item termine-item" data-termine-id="${t.id}" onclick="selezioneMatching(this, 'termine', ${t.id})">
            ${t.nome}
        </div>
    `).join('');
    
    document.getElementById('termini-list').innerHTML = terminiHtml;

    // Renderizza le descrizioni mescolate
    const descrizioniHtmlSinistra = descrizioniColonnaSinistra.map(d => `
        <div class="matching-item descrizione-item" data-descrizione-id="${d.id}" onclick="selezioneMatching(this, 'descrizione', ${d.id})">
            ${d.testo}
        </div>
    `).join('');

    const descrizioniHtmlCentro = descrizioniColonnaCentro.map(d => `
        <div class="matching-item descrizione-item" data-descrizione-id="${d.id}" onclick="selezioneMatching(this, 'descrizione', ${d.id})">
            ${d.testo}
        </div>
    `).join('');

    const descrizioniHtmlDestra = descrizioniColonnaDestra.map(d => `
        <div class="matching-item descrizione-item" data-descrizione-id="${d.id}" onclick="selezioneMatching(this, 'descrizione', ${d.id})">
            ${d.testo}
        </div>
    `).join('');
    
    document.getElementById('descrizioni-list-left').innerHTML = descrizioniHtmlSinistra;
    document.getElementById('descrizioni-list-center').innerHTML = descrizioniHtmlCentro;
    document.getElementById('descrizioni-list-right').innerHTML = descrizioniHtmlDestra;
}

function selezioneMatching(element, tipo, id) {
    if (element.classList.contains('matched')) return;

    if (tipo === 'termine') {
        // Deseleziona il termine precedente
        const prevTermine = document.querySelector('.matching-item.termine-item.selected');
        if (prevTermine) prevTermine.classList.remove('selected');
        
        element.classList.add('selected');
        window.matchingState.selectedTermino = id;
        
        // Se abbiamo sia termine che descrizione, crea il matching
        if (window.matchingState.selectedDescrizione) {
            creaMatching();
        }
    } else {
        // Deseleziona la descrizione precedente
        const prevDescrizione = document.querySelector('.matching-item.descrizione-item.selected');
        if (prevDescrizione) prevDescrizione.classList.remove('selected');
        
        element.classList.add('selected');
        window.matchingState.selectedDescrizione = id;
        
        // Se abbiamo sia termine che descrizione, crea il matching
        if (window.matchingState.selectedTermino) {
            creaMatching();
        }
    }
}

function creaMatching() {
    const terminoId = window.matchingState.selectedTermino;
    const descrizioneId = window.matchingState.selectedDescrizione;
    
    // Aggiungi al matching
    window.matchingState.matches[terminoId] = descrizioneId;
    
    // Applica stile visivo
    const terminoEl = document.querySelector(`[data-termine-id="${terminoId}"]`);
    const descrizioneEl = document.querySelector(`[data-descrizione-id="${descrizioneId}"]`);
    
    terminoEl.classList.add('matched');
    descrizioneEl.classList.add('matched');
    
    // Resetta la selezione
    terminoEl.classList.remove('selected');
    descrizioneEl.classList.remove('selected');
    window.matchingState.selectedTermino = null;
    window.matchingState.selectedDescrizione = null;
}

function verificaMatchingLGBT() {
    const matchesEsatti = Object.keys(window.matchingState.matches).reduce((count, terminoId) => {
        return count + (window.matchingState.matches[terminoId] == terminoId ? 1 : 0);
    }, 0);

    if (!window.matchingProgress || !window.matchingProgress.allIds) {
        window.matchingProgress = {
            allIds: window.matchingState.termini.map(t => t.id),
            correctById: {}
        };
    }

    const descrizioniById = Object.fromEntries(window.matchingState.descrizioniOriginali.map(descrizione => [descrizione.id, descrizione]));

    window.matchingState.termini.forEach(termine => {
        const scelta = window.matchingState.matches[termine.id];
        window.matchingProgress.correctById[termine.id] = (scelta == termine.id);
    });

    const matchesTotaliCorretti = window.matchingProgress.allIds.filter(id => window.matchingProgress.correctById[id]).length;
    const idsErrore = window.matchingProgress.allIds.filter(id => !window.matchingProgress.correctById[id]);
    const percentualeMatching = Math.round((matchesTotaliCorretti / window.matchingProgress.allIds.length) * 100);

    const righeRiepilogo = window.matchingState.termini.map(termine => {
        const descrizioneSceltaId = window.matchingState.matches[termine.id];
        const descrizioneScelta = descrizioneSceltaId ? descrizioniById[descrizioneSceltaId] : null;
        const descrizioneCorretta = descrizioniById[termine.id];
        const corretta = descrizioneSceltaId == termine.id;
        const testoScelto = descrizioneScelta ? descrizioneScelta.testo : 'NON ABBINATO';

        return `
            <div class="matching-review-item ${corretta ? 'correct' : 'wrong'}">
                <div class="matching-review-termine">${termine.nome}</div>
                <div class="matching-review-pair">
                    <div><strong>La tua scelta:</strong><br>${testoScelto}</div>
                    <div><strong>Corretto:</strong><br>${descrizioneCorretta.testo}</div>
                </div>
            </div>
        `;
    }).filter(riga => riga.includes('wrong')).join('');

    registraRispostaMinigioco('lgbt', {
        tipo: window.matchingState.isRetryMode ? 'matching-riprova' : 'matching-verifica',
        terminiMostrati: window.matchingState.termini.map(t => t.nome),
        abbinamentiUtente: window.matchingState.matches,
        correttiNelTentativo: matchesEsatti,
        correttiTotali: matchesTotaliCorretti,
        rimanenti: idsErrore.length,
        percentualeTotale: percentualeMatching,
        timestamp: new Date().toISOString()
    });

    window.matchingState.risultatoFinale = {
        punti: matchesTotaliCorretti,
        totali: window.matchingProgress.allIds.length,
        percentuale: percentualeMatching
    };

    statisticheGlobali[categoriaCorrente] = {
        punti: matchesTotaliCorretti,
        totali: window.matchingProgress.allIds.length
    };

    const messaggioEsito = matchesTotaliCorretti === window.matchingProgress.allIds.length
        ? `Hai abbinato correttamente tutti i ${window.matchingProgress.allIds.length} termini LGBT+! (${percentualeMatching}%)`
        : `Hai abbinato correttamente ${matchesTotaliCorretti} su ${window.matchingProgress.allIds.length} termini. (${percentualeMatching}%)`;

    const titoloEsito = matchesTotaliCorretti === window.matchingProgress.allIds.length ? "Perfetto! 🎉" : (percentualeMatching >= 50 ? "Buona prova!" : "Continua a imparare");

    punteggioTotale = matchesTotaliCorretti;

    const bottoneAzione = idsErrore.length > 0
        ? `<button class="btn-option primary" style="margin-top:16px; width:100%;" onclick="riprovaErroriMatching()">RIPROVA ERRORI (${idsErrore.length})</button>`
        : `<button class="btn-option primary" style="margin-top:16px; width:100%;" onclick="fineGioco()">CONCLUDI GIOCO</button>`;

    apriModale(titoloEsito, `
        <div class="matching-review-summary">
            <p><strong>${messaggioEsito}</strong></p>
            <p>Qui sotto vedi solo gli abbinamenti sbagliati, con la soluzione corretta accanto.</p>
        </div>
        ${righeRiepilogo ? `<div class="matching-review-list">${righeRiepilogo}</div>` : '<p style="font-weight:800; color:#2ecc71; text-align:center;">Nessun errore: abbinamenti perfetti!</p>'}
        ${bottoneAzione}
        <p style="margin-top:16px; color:#666;">Il linguaggio LGBT+ è importante per l'inclusione!</p>
    `);
}

function riprovaErroriMatching() {
    if (!window.matchingProgress || !window.matchingProgress.allIds) return;

    const idsErrore = window.matchingProgress.allIds.filter(id => !window.matchingProgress.correctById[id]);
    if (idsErrore.length === 0) {
        fineGioco();
        return;
    }

    const itemLgbt = domandeCorrenti[indiceDomanda];
    const terminiErrore = itemLgbt.termini.filter(t => idsErrore.includes(t.id));
    const descrizioniErrore = itemLgbt.descrizioni.filter(d => idsErrore.includes(d.id));
    const descrizioniMescolate = [...descrizioniErrore].sort(() => Math.random() - 0.5);

    document.getElementById('modal-spiegazione').style.display = 'none';
    avviaGiocoMatching(terminiErrore, descrizioniMescolate, itemLgbt.descrizioni, { isRetryMode: true, resetProgress: false });
}

function rispondiGenereConosco(termine, spiegazione, tipoRisposta) {
    registraRispostaMinigioco('genere', {
        tipo: 'riconoscimento-termine',
        termine,
        azione: tipoRisposta,
        corretto: true,
        timestamp: new Date().toISOString()
    });
    aggiungiPuntoEApri(termine, spiegazione);
}

function rispondiGenereNonConosco(termine, spiegazione) {
    registraRispostaMinigioco('genere', {
        tipo: 'riconoscimento-termine',
        termine,
        azione: 'NON_LO_CONOSCO',
        corretto: false,
        timestamp: new Date().toISOString()
    });
    apriModale(termine, spiegazione);
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
    // Controlliamo se tutte le 4 categorie hanno un punteggio (totali > 0)
    const categorieGiocate = Object.values(statisticheGlobali).filter(s => s.totali > 0).length;
    
    // Completamento percorso: tutte le 4 categorie disponibili devono essere completate
    // 1. genere, 2. neuro, 3. lgbt, 4. video_interactive (etnie)
    if (categorieGiocate === 4) {
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

    if (sessioneReportCorrente) {
        sessioneReportCorrente.completato = true;
        sessioneReportCorrente.completatoAt = new Date().toISOString();
        salvaSessioneReport();
    }

    // Mostriamo la pagina finale
    showPage('page-profile');
}

function fineGioco() {
    const isMatchingLGBT = categoriaCorrente === 'lgbt' && window.matchingState && window.matchingState.risultatoFinale;
    const puntiFinali = isMatchingLGBT ? window.matchingState.risultatoFinale.punti : punteggioTotale;
    const totaliFinali = isMatchingLGBT ? window.matchingState.risultatoFinale.totali : domandeCorrenti.length;

    statisticheGlobali[categoriaCorrente] = {
        punti: puntiFinali,
        totali: totaliFinali
    };

    if (sessioneReportCorrente && sessioneReportCorrente.minigiochi[categoriaCorrente]) {
        sessioneReportCorrente.minigiochi[categoriaCorrente].punti = puntiFinali;
        sessioneReportCorrente.minigiochi[categoriaCorrente].totali = totaliFinali;
        sessioneReportCorrente.minigiochi[categoriaCorrente].chiusoAt = new Date().toISOString();
        salvaSessioneReport();
    }

    const percentualePercorso = Math.round((puntiFinali / totaliFinali) * 100);
    
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
            <p style="color: #666;">Risposte corrette: ${puntiFinali} su ${totaliFinali}</p>
            
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
    }

    controllaSeTuttiCompletati();
}

// per DEBUG
function debugSimulaTutto(punteggioPercentuale) {
    // Simuliamo 5 domande per ogni categoria
    const categorie = ['genere', 'neuro', 'lgbt', 'video_interactive'];
    
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

function calcolaProfilo(percentuale) {
    let profilo = {
        emoji: "",
        nome: "",
        descrizione: ""
    };

    if (percentuale >= 90) {
        profilo.emoji = "👑";
        profilo.nome = "L'AMBASCIATORE";
        profilo.descrizione = "Incredibile! Sei un punto di riferimento. Promuovi l'equità e il rispetto in ogni tuo gesto quotidiano.";
    } else if (percentuale >= 70) {
        profilo.emoji = "🤝";
        profilo.nome = "L'ALLEATO";
        profilo.descrizione = "Ottimo! Sei una persona molto sensibile e sai come supportare attivamente le diversità intorno a te.";
    } else if (percentuale >= 50) {
        profilo.emoji = "🔍";
        profilo.nome = "L'ESPLORATORE";
        profilo.descrizione = "Sei sulla strada giusta! La tua curiosità e voglia di imparare ti renderanno un cittadino più consapevole.";
    } else {
        profilo.emoji = "✨";
        profilo.nome = "IL CURIOSO";
        profilo.descrizione = "Hai appena iniziato il tuo viaggio nell'inclusione. Continua a esplorare per abbattere ogni barriera!";
    }

    return profilo;
}

function scaricaReportCompleto() {
    const lista = JSON.parse(localStorage.getItem(REPORT_STORAGE_KEY) || '[]');
    const records = lista.filter(r => r.completato);

    if (records.length === 0) {
        alert('Nessun record completato disponibile al momento.');
        return;
    }

    // Crea workbook Excel
    const wb = XLSX.utils.book_new();

    // ===== FOGLIO 1: RIEPILOGO COMPLETO =====
    const datiRiepilogo = records.map(r => {
        const g = r.minigiochi.genere || { punti: 0, totali: 0 };
        const n = r.minigiochi.neuro || { punti: 0, totali: 0 };
        const l = r.minigiochi.lgbt || { punti: 0, totali: 0 };
        const e = r.minigiochi.video_interactive || { punti: 0, totali: 0 };

        const totaliPunti = g.punti + n.punti + l.punti + e.punti;
        const totaliDomande = g.totali + n.totali + l.totali + e.totali;
        const percentuale = totaliDomande > 0 ? Math.round((totaliPunti / totaliDomande) * 100) : 0;
        const profilo = calcolaProfilo(percentuale);

        return {
            'Nome Utente': r.nome,
            'Fascia Età': r.etaRange,
            'Data/Ora': new Date(r.timestamp).toLocaleString('it-IT'),
            'GENERE (Punti/Totali)': `${g.punti}/${g.totali}`,
            'LGBTQ+ (Punti/Totali)': `${l.punti}/${l.totali}`,
            'ETNIE (Punti/Totali)': `${e.punti}/${e.totali}`,
            'NEURODIVERSITÀ (Punti/Totali)': `${n.punti}/${n.totali}`,
            'Punteggio Totale': `${totaliPunti}/${totaliDomande}`,
            'Inclusività (%)': percentuale + '%',
            'Profilo': profilo.emoji + ' ' + profilo.nome,
            'Descrizione Profilo': profilo.descrizione,
            'ID Sessione': r.sessionId
        };
    });

    const wsRiepilogo = XLSX.utils.json_to_sheet(datiRiepilogo);
    XLSX.utils.book_append_sheet(wb, wsRiepilogo, 'Riepilogo Utenti');

    // Stili per il foglio riepilogo
    const range = XLSX.utils.decode_range(wsRiepilogo['!ref']);
    for (let row = range.s.row; row <= range.e.row; row++) {
        for (let col = range.s.col; col <= range.e.col; col++) {
            const cellAddress = XLSX.utils.encode_col(col) + XLSX.utils.encode_row(row);
            const cell = wsRiepilogo[cellAddress];
            if (cell) {
                if (row === 0) {
                    // Intestazione
                    cell.fill = { fgColor: { rgb: 'FFE74C3C' } };
                    cell.font = { bold: true, color: { rgb: 'FFFFFFFF' } };
                    cell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
                } else {
                    cell.alignment = { horizontal: 'center', vertical: 'center' };
                }
            }
        }
    }

    // Larghezze colonne
    wsRiepilogo['!cols'] = [
        { wch: 18 },  // Nome Utente
        { wch: 12 },  // Fascia Età
        { wch: 20 },  // Data/Ora
        { wch: 15 },  // GENERE
        { wch: 15 },  // LGBTQ+
        { wch: 15 },  // ETNIE
        { wch: 18 },  // NEURODIVERSITÀ
        { wch: 18 },  // Punteggio Totale
        { wch: 15 },  // Inclusività (%)
        { wch: 20 },  // Profilo
        { wch: 45 },  // Descrizione Profilo
        { wch: 20 }   // ID Sessione
    ];

    // ===== FOGLIO 2: STATISTICHE GENERALI =====
    const stats = calcolaStatistiche(records);
    const datiStats = [
        { Metrica: 'Numero Utenti Completi', Valore: records.length },
        { Metrica: 'Percentuale Media Inclusività', Valore: stats.percentualMedia + '%' },
        { Metrica: 'Punteggio Medio GENERE', Valore: stats.genereMedia + '%' },
        { Metrica: 'Punteggio Medio LGBTQ+', Valore: stats.lgbtMedia + '%' },
        { Metrica: 'Punteggio Medio ETNIE', Valore: stats.etnieMedia + '%' },
        { Metrica: 'Punteggio Medio NEURODIVERSITÀ', Valore: stats.neuroMedia + '%' },
        { Metrica: '', Valore: '' },
        { Metrica: 'Distribuzione per Fascia Età', Valore: '' },
        ...Object.entries(stats.distribuzioneFascie).map(([fascia, count]) => ({
            Metrica: `  - ${fascia}`,
            Valore: count
        }))
    ];

    const wsStats = XLSX.utils.json_to_sheet(datiStats);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiche');

    for (let row = 0; row < datiStats.length; row++) {
        const cellMetrica = wsStats[XLSX.utils.encode_col(0) + XLSX.utils.encode_row(row)];
        if (cellMetrica) {
            if (row === 0) {
                cellMetrica.fill = { fgColor: { rgb: 'FF3498DB' } };
                cellMetrica.font = { bold: true, color: { rgb: 'FFFFFFFF' } };
            }
        }
    }
    wsStats['!cols'] = [{ wch: 35 }, { wch: 20 }];

    // Scarica il file
    XLSX.writeFile(wb, `report_includiamo_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function calcolaStatistiche(records) {
    let totGenere = 0, corretteGenere = 0;
    let totLgbt = 0, corretteLgbt = 0;
    let totEtnie = 0, corretteEtnie = 0;
    let totNeuro = 0, corretteNeuro = 0;
    const distribuzioneFascie = {};

    records.forEach(r => {
        const g = r.minigiochi.genere || { punti: 0, totali: 0 };
        const l = r.minigiochi.lgbt || { punti: 0, totali: 0 };
        const e = r.minigiochi.video_interactive || { punti: 0, totali: 0 };
        const n = r.minigiochi.neuro || { punti: 0, totali: 0 };

        corretteGenere += g.punti;
        totGenere += g.totali;
        corretteLgbt += l.punti;
        totLgbt += l.totali;
        corretteEtnie += e.punti;
        totEtnie += e.totali;
        corretteNeuro += n.punti;
        totNeuro += n.totali;

        distribuzioneFascie[r.etaRange] = (distribuzioneFascie[r.etaRange] || 0) + 1;
    });

    const totalePunti = corretteGenere + corretteLgbt + corretteEtnie + corretteNeuro;
    const totaleDomande = totGenere + totLgbt + totEtnie + totNeuro;

    return {
        percentualMedia: totaleDomande > 0 ? Math.round((totalePunti / totaleDomande) * 100) : 0,
        genereMedia: totGenere > 0 ? Math.round((corretteGenere / totGenere) * 100) : 0,
        lgbtMedia: totLgbt > 0 ? Math.round((corretteLgbt / totLgbt) * 100) : 0,
        etnieMedia: totEtnie > 0 ? Math.round((corretteEtnie / totEtnie) * 100) : 0,
        neuroMedia: totNeuro > 0 ? Math.round((corretteNeuro / totNeuro) * 100) : 0,
        distribuzioneFascie
    };
}

// Inizializza e avvia un quiz per la categoria selezionata
async function startQuiz(categoria) {
    try {
        categoriaCorrente = categoria;
        indiceDomanda = 0;
        punteggioTotale = 0;

        // Mostra la pagina del quiz (area di gioco)
        if (typeof showPage === 'function') showPage('page-action');

        // Carica le domande (usa api-handler.js)
        if (typeof fetchQuizDati === 'function') {
            domandeCorrenti = await fetchQuizDati(categoria);
        } else {
            domandeCorrenti = [];
        }

        // Se non ci sono domande, mostra avviso e torna alla home
        if (!domandeCorrenti || domandeCorrenti.length === 0) {
            alert('Nessuna domanda disponibile per questa categoria.');
            showPage('page-quiz');
            return;
        }

        // Aggiorna UI titolo
        const titolo = document.getElementById('game-title');
        if (titolo) {
            titolo.innerText = categoria === 'video_interactive' ? 'MULTICULTURALITÀ' : 'Quiz';
        }

        // Avvia la prima domanda
        mostraDomanda();
    } catch (err) {
        console.error('Errore avviando il quiz:', err);
        alert('Si è verificato un errore nell\'avvio del quiz. Controlla la console.');
    }
}

// Esponi funzioni chiave globalmente per gli onclick inline
try {
    Object.assign(window, {
        startQuiz,
        scaricaReportCompleto,
        debugSimulaTutto,
        mostraDomanda,
        entraFullscreenDaModal,
        chiudiModale,
        prossimaDomanda,
        tornaAllaHome,
        selezioneMatching,
        verificaMatchingLGBT,
        riprovaErroriMatching,
        fineGioco,
        avviaGiocoDislessia,
        mostraInputVerifica,
        controllaRispostaNeuro,
        rispondiGenereConosco,
        rispondiGenereNonConosco,
        gestisciRispostaLGBT,
        aggiungiPuntoEApri
    });
} catch (err) {
    // ambiente non-browser o scope limitato
}