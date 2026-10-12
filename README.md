# Vins Care — spazio condiviso di cura

Prototipo interattivo derivato da App Vins 1.1.0. Il centro della navigazione è la relazione continuativa tra paziente e team: cartella, diario, esami, consensi, monitoraggio, messaggi e autocura. Le prenotazioni sono un servizio secondario sempre accessibile.

Tutti i dati sono fittizi. `lib/demo-api.mjs` e `lib/care-domain.mjs` modellano i percorsi nel browser e non sono un backend sanitario. Metadati tramite `lib/demo-storage.mjs`: archivio locale, fallback alla sessione o memoria della pagina quando il browser lo impedisce. File e video in IndexedDB tramite `lib/care-assets.ts`. Nessuna sincronizzazione remota. Il selettore dei profili è una funzione di presentazione, non un’autenticazione reale.

La navigazione usa collegamenti HTML nativi tramite `components/NavLink.tsx`, evitando di dipendere dalle richieste RSC intermedie per cambiare pagina. Quando l’archivio è disponibile soltanto in memoria, resta nel router client per non perdere la prova. Cambio profilo e login usano lo stesso criterio. La toolbar indica quando la conservazione è limitata.

## Percorsi implementati

- Diario ambulatoriale/domiciliare con provenienza, data, criticità, revisioni aggiunte e bozze professionali.
- Documenti PDF/JPG/PNG fino a 10 MB, controllo del formato effettivo, impronta SHA-256, originale conservato, consultazione e revisione separate, visibilità team/referente e caregiver.
- Informazione clinica versionata, chiarimenti, decisione/rifiuto, dichiarazione scritta o video, verifica del medico, revoca e storia degli eventi. MediaRecorder quando disponibile; allegato MP4/WebM fino a 25 MB. Non firma digitale qualificata o identificazione legale.
- Sei parametri con unità esplicite, andamento su tempi effettivi, revisione del team e limiti personalizzati dal medico. Nessuna soglia clinica universale, diagnosi o sorveglianza continua.
- Messaggi paziente-team e canale professionale separato; indicazioni di autocura preparate e pubblicate dal medico.
- Permessi per ruolo, assegnazione attiva al paziente e scadenza, con restrizioni per documento. Amministrazione e segreteria non ricevono payload clinici dal workspace.
- Ricerca, appuntamenti e agenda precedenti conservati in `/prenotazioni`, `/portal` e `/agenda`.

La documentazione concettuale è in `docs/care-model.md` e nella pagina `/progetto`. La scheda `/informativa` chiarisce le capacità e i limiti della demo. In produzione tutti i controlli devono essere applicati sul server con identità verificate, storage sanitario privato, audit protetto, processi di consenso e responsabilità cliniche definiti. Integrazioni FSE, dispositivi, SMS/email, pagamenti e videochiamate non attive.

## Verifiche

`node --test scripts/care-workflows.test.mjs scripts/demo-browser-contracts.test.mjs`

`node node_modules/typescript/bin/tsc --noEmit`

Build e pubblicazione tramite il workflow Sites. Il pacchetto include i sorgenti e i test. La registrazione da fotocamera e la resa sui dispositivi richiedono verifica con browser; non sono coperte dai test del dominio.
