const SCRIPT_URL = "TEST_MODE"; 

async function fetchQuizDati(categoria) {
    console.log("MODALITÀ TEST: Caricamento dati per " + categoria);
    
    // Simuliamo un ritardo di caricamento di mezzo secondo
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dati di esempio per il GENERE
    if (categoria === 'genere') {
    return [
        { 
            Frase: "MANSPLAINING", 
            Spiegazione: "Quando un uomo spiega qualcosa a una donna in modo condiscendente, dando per scontato che lei non sappia nulla del tema." 
        },
        { 
            Frase: "MASCOLINITÀ TOSSICA", 
            Spiegazione: "Insieme di comportamenti che impongono agli uomini di non mostrare emozioni, essere sempre dominanti o aggressivi per essere considerati 'veri uomini'." 
        },
        { 
            Frase: "GENDER PAY GAP", 
            Spiegazione: "La differenza salariale tra uomini e donne a parità di mansione e ore lavorate." 
        },
        { 
            Frase: "PINK TAX", 
            Spiegazione: "Il prezzo più alto applicato a prodotti venduti alle donne (es. rasoi rosa) rispetto a versioni identiche destinate agli uomini." 
        },
        { 
            Frase: "STEREOTIPO DI GENERE", 
            Spiegazione: "Idea preconcetta che attribuisce caratteristiche fisse a uomini e donne (es. 'le donne sono emotive', 'gli uomini sono portati per la forza')." 
        }
    ];
}
    if (categoria === 'lgbt') {
        return [
            { 
                Frase: "Marco è un 'ex donna'.", 
                Corretta: "Marco è un uomo trans.",
                Sbagliata: "Marco è una donna biologica.",
                Sbagliata2: "Marco era una femmina.",
                Spiegazione: "L'identità di genere attuale è l'unica che conta. 'Ex donna', 'biologica' o riferimenti al sesso assegnato alla nascita invalidano il percorso di affermazione della persona."
            },
            { 
                Frase: "Qual è il tuo 'vero' nome?", 
                Corretta: "Qual è il tuo nome elettivo?",
                Sbagliata: "Come ti chiamavi da piccola?",
                Sbagliata2: "Qual è il tuo nome all'anagrafe?",
                Spiegazione: "Chiedere il nome di nascita (deadname) o quello anagrafico è un'intrusione dolorosa. Il nome 'vero' è quello in cui la persona si riconosce."
            },
            { 
                Frase: "Invitiamo i soci con le loro 'mogli'.", 
                Corretta: "Invitiamo i soci con i loro partner.",
                Sbagliata: "Invitiamo i soci con le consorti.",
                Sbagliata2: "Invitiamo i soci e le signore.",
                Spiegazione: "Termini come 'mogli', 'consorti' o 'signore' assumono che la coppia sia eterosessuale. 'Partner' è universale e non esclude nessuno."
            }
        ];
    }
    
    // Dati di esempio per la NEURODIVERSITÀ
    if (categoria === 'neuro') {
        return [
            { 
                Frase: "IL VOLONTARIO SOCCORRE CHIUNQUE SENZA DISTINZIONE" 
            },
            { 
                Frase: "L'INCLUSIONE RENDE LA NOSTRA COMUNITÀ PIÙ FORTE" 
            }
        ];
    }
    
    // Dati di esempio per la MULTICULTURALITÀ (placeholder)
    if (categoria === 'multi') {
        return [{}]; // Elemento dummy per attivare il quiz
    }
    
    return [];
}

async function inviaReport(categoria, punteggio) {
    console.log("TEST: Report inviato!", {categoria, punteggio});
}