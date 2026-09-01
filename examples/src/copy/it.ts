import type { Copy } from './shape'

export const it: Copy = {
  nav: { overview: 'Panoramica', examples: 'Esempi', api: 'API' },
  hero: {
    eyebrow: 'React 19 · 8 kB compressi · nessuna dipendenza',
    title: ['Il telaio', 'sotto', 'il tuo strumento.'],
    lead: 'Barre di icone sui bordi, zone ridimensionabili attorno a un centro che è tuo, e una disposizione che sopravvive a un ricaricamento. Senza rendering sotto, ridipingibile sopra.',
    copy: 'Copia',
    copied: 'Copiato',
    seeExamples: 'Guarda gli esempi',
    caption:
      'È dal vivo. Trascina gli spazi tra le superfici, premi un’icona della barra, ridimensiona la finestra.',
  },
  demo: {
    centre: 'Il tuo centro',
    centreHint: 'un outlet del router · un canvas · una mappa · schede di documenti',
    panels: {
      files: 'File',
      search: 'Cerca',
      outline: 'Struttura',
      notes: 'Note',
      console: 'Console',
    },
    said: {
      share: 'Due pannelli condividono questa metà. La barra passa dall’uno all’altro.',
      second: 'La seconda metà della stessa colonna, con la propria maniglia.',
      opens: 'Questo chiede di aprirsi più largo della sua colonna.',
      band: 'La fascia corre sotto la colonna che è aperta.',
    },
  },
  examples: {
    title: 'Quattro modi per cominciare',
    lead: 'Ognuno gira nel tuo browser e tutto il suo codice è sullo schermo. Parti dal più vicino a ciò che ti serve.',
    tip: 'Consiglio.',
    open: name => `Apri ${name}`,
  },
  api: {
    title: 'Tutta la superficie',
    lead: 'Non è molta, ed è proprio questo il punto. Cinque cose da sapere.',
  },
  foot: {
    docs: 'Documentazione',
    architecture: 'Architettura',
    source: 'Sorgenti',
    note: 'MIT · di alban.pasquelin · il telaio di questa pagina è la libreria stessa',
  },
  langLabel: 'Lingua',
  cards: [
    {
      title: 'Minimo',
      what: 'Il telaio più piccolo che funzioni. Due colonne, una fascia, un centro — e un’intestazione tua che lo governa.',
      tip: 'I pannelli che condividono zona e metà si alternano; la barra passa dall’uno all’altro. Dai al secondo la metà secondary e si sistemerà sotto il primo.',
    },
    {
      title: 'React Router',
      what: 'Il centro è un outlet. Navigare cambia solo la parte centrale: le colonne mantengono la larghezza e i pannelli aperti restano aperti.',
      tip: 'Dichiara i pannelli nella rotta di layout, sopra l’outlet. Dichiarati per pagina verrebbero smontati a ogni navigazione, perdendo quello che tenevano.',
    },
    {
      title: 'Schede di documenti',
      what: 'Il centro porta i documenti su Dockview — schede che si trascinano e si dividono — mentre i pannelli restano sui bordi.',
      tip: 'Importalo dal punto d’ingresso dockview: così il suo peso ricade solo sui progetti che vogliono le schede. Un pannello non entra mai nel centro: un documento ha un nome, un pannello un’icona.',
    },
    {
      title: 'Ridipinto',
      what: 'Lo stesso telaio sotto quattro tavolozze. Colori, raggio, larghezza della barra, altezza dell’intestazione — tutte proprietà personalizzate.',
      tip: 'Imposta il token d’accento su un antenato qualsiasi e il telaio erediterà la tua identità invece di imporre la sua. Vuoi andare oltre? Ogni pezzo è esportato e sostituibile da solo.',
    },
  ],
  api5: [
    {
      name: 'Dichiarare',
      body: 'Un pannello è un descrittore: dove si aggancia, come si chiama, cosa disegna.',
    },
    {
      name: 'Governare',
      body: 'Un solo hook per ogni intestazione, scorciatoia o menu che debba agire sui pannelli.',
    },
    {
      name: 'Governare da fuori React',
      body: 'Crea tu lo store e un socket, un menu nativo o un worker potranno aprire un pannello.',
    },
    {
      name: 'Ridipingere',
      body: 'Ogni valore è una proprietà personalizzata. Imposta l’accento e le barre seguiranno la tua identità.',
    },
    {
      name: 'Oppure prendere solo la logica',
      body: 'I componenti poggiano su hook che non disegnano nulla. Disegnaci sopra il tuo telaio.',
    },
  ],
}
