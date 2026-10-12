# Prompt iniziale per Gemini

Sto continuando lo sviluppo di Vins Care, un prototipo già esistente di relazione diretta medico–paziente e coordinamento del team. Parti dai file presenti e leggi prima LEGGIMI_CONSEGNA.md, README.md e docs/care-model.md.

Il centro dell’interfaccia è il percorso di cura: cartella condivisa, diario e criticità in ambulatorio/domicilio, esami con provenienza e condivisione selettiva, consensi scritti o video con chiarimenti/verifica/rifiuto/revoca, monitoraggio manuale, autocura e comunicazione con il team. Le prenotazioni sono disponibili come funzione secondaria.

1. Esamina il progetto e spiegami stack, componenti e flussi attuali.
2. Verifica l’avvio nel tuo ambiente. Il progetto usa Vinext/Vite con adattatore Cloudflare; se non è compatibile con l’anteprima di AI Studio, proponi il minimo adattamento necessario. Preserva grafica, flussi, autorizzazioni e test. Non ricreare il sito da zero senza una necessità esplicita.
3. Controlla nel browser la navigazione, il cambio profilo, i pulsanti e il salvataggio. È già presente un fallback quando localStorage non è disponibile: mantienilo e rendi espliciti eventuali limiti.
4. Esegui i test presenti e il controllo TypeScript; aggiungi verifiche soltanto per errori reali o nuove funzioni.
5. Distingui sempre funzioni dimostrative e backend reale. Non descrivere il video o il nome digitato come una firma digitale qualificata. Non aggiungere diagnosi automatiche o soglie cliniche universali.
6. Prima di sviluppare archivio remoto o identità reali, spiegami le scelte tecniche e le responsabilità da definire con il team clinico. Usa dati fittizi durante lo sviluppo.

Per ora voglio una versione che si avvii nel tuo ambiente e mantenga le funzioni presenti. Mostrami le modifiche, le verifiche effettuate e ciò che resta da collegare.
