# Modello concettuale Vins Care

## Unità di lavoro

L’unità di lavoro è il percorso del singolo paziente seguito da un’équipe. La home riassume ciò che è successo e ciò che richiede attenzione. La cartella aggrega una cronologia filtrabile; il diario resta il luogo dell’osservazione, mentre documenti, misurazioni e consensi mantengono il proprio ciclo di vita. La prenotazione organizza l’incontro e rimane una destinazione secondaria stabile.

## Provenienza e revisione

Il dato riferito dal paziente o dal caregiver è distinguibile dall’annotazione professionale. Autore, data dell’evento, data d’inserimento, setting ambulatoriale/domiciliare e stato sono conservati. Integrazioni e revisioni aggiungono informazioni senza riscrivere l’originale. Le bozze del team non sono mostrate al paziente finché l’autore non le condivide.

I documenti originali mantengono metadati e impronta SHA-256. Una revisione clinica è un elemento aggiuntivo: non modifica il file e non rende automaticamente attendibile un referto caricato dal paziente. L’impronta locale è dimostrativa e non sostituisce conservazione e integrità garantite dal server.

## Autorizzazioni

Il livello non è una gerarchia che attribuisce accesso illimitato. Il sistema combina:

1. Identità e ruolo.
2. Relazione di cura attiva con quel paziente e durata dell’incarico.
3. Funzione richiesta: consultazione, annotazione, deposito, revisione, decisione o coordinamento.
4. Visibilità del singolo documento: paziente/referente oppure team, con ulteriore delega al caregiver.

Paziente: propria cartella e decisioni. Caregiver delegato: contenuti condivisi, osservazioni e misurazioni, senza consenso per conto del paziente. Infermiere/fisioterapista: pazienti assegnati, note professionali e contributi al monitoraggio. Medico: revisione clinica e verifica del consenso sui pazienti assegnati. Referente: coordinamento e gestione delle assegnazioni. Amministrazione/segreteria: organizzazione degli incontri senza cartella clinica. Disattivazione o scadenza dell’assegnazione rimuovono i diritti del workspace.

Il prototipo è locale: questo modello va applicato sul server prima di un uso sanitario reale. L’audit della demo è mutabile dal browser e non è un registro probatorio.

## Consenso come processo

Il professionista prepara una scheda specifica e versionata con informazione, benefici, rischi e alternative. Il paziente può porre domande. L’accettazione richiede una dichiarazione di comprensione e risposta alle domande aperte; il rifiuto rimane disponibile senza imporre quelle conferme. La decisione viene documentata per iscritto o in video. L’accettazione passa in attesa di verifica del medico, che documenta il controllo dell’identità e del colloquio. Una successiva revoca è registrata senza cancellare il percorso precedente.

Consenso al trattamento, scelte di condivisione e autorizzazione alla registrazione sono distinti. La demo rappresenta un paziente adulto che decide per sé: rappresentanza legale, minori, DAT e situazioni speciali richiedono processi dedicati. Nome digitato, video e checklist dimostrativa non certificano da soli la validità giuridica del consenso.

## Monitoraggio e autocura

Il paziente inserisce manualmente data, ora, unità e contesto per pressione, frequenza cardiaca, saturazione, temperatura, peso e glicemia. Il grafico rispetta i tempi effettivi. I controlli d’inserimento intercettano formati o valori incompatibili con il campo; non diagnosticano. Nessuna soglia terapeutica è preimpostata: il medico configura limiti individuali e, per la pressione, i limiti di questa demo riguardano solo la sistolica. Una preoccupazione dichiarata o un valore fuori dai limiti configurati crea una nota da valutare nel diario. Non invia allarmi a professionisti reali.

Le schede di autocura appartengono al percorso e riportano autore, versione e fonte quando presente. Il medico prepara e pubblica le istruzioni; il paziente può registrare la presa visione. La pubblicazione non comporta diagnosi automatica o modifica autonoma delle terapie.

## Dalla dimostrazione al servizio

Architettura da completare: account individuali verificati, archivio condiviso remoto, autorizzazione sul server per ogni operazione, allegati privati, audit protetto, conservazione e gestione del consenso, contenuti approvati dal team, assegnazioni e deleghe verificate, tempi di risposta concordati. Valutare con responsabili clinici e privacy gli adempimenti applicabili prima di usare dati reali. FSE, dispositivi e comunicazioni esterne non sono connessi nel prototipo.
