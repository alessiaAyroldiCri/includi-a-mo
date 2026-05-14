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
                tipo: "matching",
                termini: [
                    { id: 1, nome: "ASESSUALE" },
                    { id: 2, nome: "BISESSUALE" },
                    { id: 3, nome: "CISGENDER" },
                    { id: 4, nome: "ETEROSEXUALE" },
                    { id: 5, nome: "NON BINARIO" },
                    { id: 6, nome: "PANSESSUALE" },
                    { id: 7, nome: "QUEER" },
                    { id: 8, nome: "TRANSGENDER" },
                    { id: 9, nome: "GRIGIO-SESSUALE" },
                    { id: 10, nome: "GAY" }
                ],
                descrizioni: [
                    { id: 1, testo: "PERSONA CHE NON PROVA ATTRAZIONE SESSUALE" },
                    { id: 2, testo: "PERSONA CHE PROVA UN ORIENTAMENTO ROMANTICO E/O SESSUALE VERSO PIÙ DI UN GENERE" },
                    { id: 3, testo: "PERSONA LA CUI IDENTITÀ DI GENERE CORRISPONDE AL SESSO ASSEGNATO ALLA NASCITA" },
                    { id: 4, testo: "UN UOMO CHE PROVA ATTRAZIONE VERSO LE DONNE, O UNA DONNA CHE PROVA ATTRAZIONE ROMANTICA VERSO UOMINI" },
                    { id: 5, testo: "PERSONE CHE SI IDENTIFICANO NON SOLO COME MASCHI O FEMMINE E NON VOGLIORNO COLLOCARSI TRA MASCHI E FEMMINE" },
                    { id: 6, testo: "PERSONA LA CUI ATTRAZIONE NON È LIMITATA DAL SESSO O DAL GENERE" },
                    { id: 7, testo: "ETICHETTA USATA A CHI VUOLE RIFIUTARE L'ETICHETTATURA DELL'ORIENTAMENTO SESSUALE E/O DELL'IDENTITÀ DI GENERE" },
                    { id: 8, testo: "PERSONA LA CUI IDENTITÀ DI GENERE O ESPRESSIONE DI GENERE NON CORRISPONDE AL SESSO ASSEGNATO ALLA NASCITA" },
                    { id: 9, testo: "PERSONE CHE PROVANO ATTRAZIONE OCCASIONALMENTE, RARAMENTE O SOLO IN DETERMINATE CONDIZIONI" },
                    { id: 10, testo: "UOMO CHE PROVA ATTRAZIONE VERSO GLI UOMINI" }
                ]
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