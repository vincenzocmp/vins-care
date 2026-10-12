# Vins Care — consegna dei sorgenti

Questa cartella contiene il codice dell’ultima versione pubblicata di Vins Care, comprese le correzioni per l’avvio con archivio browser bloccato e per la navigazione. Puoi modificarla con un editor, versionarla su GitHub e usarla come base per lavorare con Gemini.

## 1. Partire dal progetto esistente

- Leggi `README.md` per le funzioni implementate e `docs/care-model.md` per la logica clinica.
- Leggi `PROMPT_PER_GEMINI.md` prima di far modificare il progetto a un assistente.
- Il codice delle aree cliniche è soprattutto in `components/CareHub.tsx`.
- Flussi e autorizzazioni dimostrative: `lib/care-domain.mjs`.
- API locali e prenotazioni: `lib/demo-api.mjs`.
- Archivio compatibile con browser restrittivi: `lib/demo-storage.mjs`.
- Documenti e video locali: `lib/care-assets.ts` e `components/VideoConsent.tsx`.
- Navigazione: `components/NavLink.tsx` e `lib/demo-navigation.ts`.
- Grafica: `app/globals.css` e `app/care.css`.

## 2. Avviare sul computer

Il progetto usa React/TypeScript, pagine con struttura Next, Vinext/Vite e un adattatore Cloudflare. I dati della demo sono nel browser: nessun database remoto è necessario per provarla.

Installa Node.js compatibile con `package.json` (almeno 22.13.0) e pnpm nella versione dichiarata dal progetto. Poi apri un terminale dentro questa cartella ed esegui:

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Apri l’indirizzo indicato dal terminale. La configurazione portabile usa normalmente la porta 5173. La directory locale `.sites-runtime` dell’ambiente ChatGPT non è inclusa: il codice seleziona automaticamente il profilo portabile.

Per verificare il progetto:

```sh
node --test scripts/care-workflows.test.mjs scripts/demo-browser-contracts.test.mjs
pnpm exec tsc --noEmit
pnpm build
```

I 24 test e la compilazione erano passati nella versione di origine. La registrazione video e i clic devono essere verificati sul browser e sui dispositivi effettivamente usati. L’installazione pulita su un altro computer e l’importazione in AI Studio non sono state eseguite in questa consegna.

## 3. Passarlo a GitHub

1. Estrai il file ZIP.
2. Crea una repository GitHub dedicata, per esempio `vins-care`.
3. Carica **il contenuto** della cartella `Vins-Care-Sorgenti`, così `package.json` si trova nella radice della repository.
4. Condividi la repository con il destinatario come collaboratore se deve modificarla, oppure falla creare direttamente sul suo account.
5. Conserva anche i file nascosti, come `.gitignore` e `.openai/hosting.json`; non caricare soltanto il file ZIP nella repository.

Non è necessario rendere pubblico il codice per collaborare: una repository privata può essere condivisa con gli account autorizzati.

## 4. Lavorarci con Gemini

Usa Google AI Studio: https://aistudio.google.com/

In Build, il menu Add files (+) offre Import from GitHub. Autorizza l’accesso alla repository e importala. Inserisci poi il testo di `PROMPT_PER_GEMINI.md`.

Documentazione ufficiale verificata il 12 ottobre 2026:
https://ai.google.dev/gemini-api/docs/aistudio-build-mode

Questo progetto è costruito per Vinext/Cloudflare, mentre AI Studio presenta un ambiente Node.js. L’importazione è un punto di partenza: Gemini potrebbe dover adattare la configurazione di avvio o il framework. Chiedigli prima di spiegare l’adattamento e preservare interfaccia, flussi, permessi e test. Non considerare il progetto automaticamente compatibile con l’anteprima di AI Studio senza provarlo.

Per camera e microfono, l’ambiente AI Studio può richiedere anche `metadata.json` con `requestFramePermissions`: consulta la documentazione ufficiale e abilita soltanto le funzioni necessarie alla demo.

## 5. Codice, hosting e dati sono distinti

La consegna comprende i sorgenti e la documentazione. Non trasferisce l’account ChatGPT, i permessi del sito online, il dominio, le credenziali di pubblicazione o i dati salvati in un browser. Le modifiche di questa copia non vengono pubblicate automaticamente sull’indirizzo originale.

L’identificativo della pubblicazione originale è stato rimosso da `.openai/hosting.json`. Per pubblicare con Sites va creato un proprio sito e assegnato il suo identificativo; per un altro hosting va adattata la configurazione di deployment. Non riutilizzare l’associazione al sito originale.

Non sono inclusi `.git`, dipendenze installate, build generate, segreti, allegati degli utenti o dati clinici reali. Sono esclusi anche un vecchio PDF descrittivo e il cache TypeScript; la logica corrente è documentata in `docs/care-model.md`.

Il selettore dei profili e le autorizzazioni sono dimostrativi. Questa versione non è pronta per assistenza sanitaria reale: autenticazione, archivio condiviso, controlli sul server e processi professionali rimangono da sviluppare.
