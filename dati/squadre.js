// ============================================================================
//  DATABASE STORICO — SERIE A
// ----------------------------------------------------------------------------
//  Ogni voce è una "squadra-stagione" iconica.
//  Per ogni giocatore: nome, cognome, ruolo e overall (valutazione).
//
//  RUOLI:
//    P = Portiere
//    D = Difensore
//    C = Centrocampista
//    A = Attaccante
//
//  Gli overall sono calibrati sul valore del giocatore IN QUELLA stagione
//  (es. Del Piero 1994-95 è una giovane promessa, non ancora un top).
//  Scala: ~70 (riserva) → ~97 (fuoriclasse assoluto).
//
//  NB: questo è un dataset iniziale, accurato ma non esaustivo. È pensato
//  per essere ampliato facilmente aggiungendo altre squadre a questo array.
// ============================================================================

export const SQUADRE = [
  // --------------------------------------------------------------------------
  {
    id: "milan-2006-07",
    squadra: "Milan",
    anno: "2006-07",
    colore: "#fb0a18",
    giocatori: [
      { nome: "Dida", cognome: "", ruolo: "P", overall: 84 },
      { nome: "Zeljko", cognome: "Kalac", ruolo: "P", overall: 73 },
      { nome: "Paolo", cognome: "Maldini", ruolo: "D", overall: 85 },
      { nome: "Alessandro", cognome: "Nesta", ruolo: "D", overall: 88 },
      { nome: "Cafu", cognome: "", ruolo: "D", overall: 83 },
      { nome: "Marek", cognome: "Jankulovski", ruolo: "D", overall: 80 },
      { nome: "Massimo", cognome: "Oddo", ruolo: "D", overall: 80 },
      { nome: "Kakha", cognome: "Kaladze", ruolo: "D", overall: 79 },
      { nome: "Andrea", cognome: "Pirlo", ruolo: "C", overall: 89 },
      { nome: "Kaká", cognome: "", ruolo: "C", overall: 92 },
      { nome: "Clarence", cognome: "Seedorf", ruolo: "C", overall: 87 },
      { nome: "Gennaro", cognome: "Gattuso", ruolo: "C", overall: 84 },
      { nome: "Massimo", cognome: "Ambrosini", ruolo: "C", overall: 81 },
      { nome: "Filippo", cognome: "Inzaghi", ruolo: "A", overall: 84 },
      { nome: "Alberto", cognome: "Gilardino", ruolo: "A", overall: 82 },
      { nome: "Ricardo", cognome: "Oliveira", ruolo: "A", overall: 78 },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "juventus-2017-18",
    squadra: "Juventus",
    anno: "2017-18",
    colore: "#111111",
    giocatori: [
      { nome: "Gianluigi", cognome: "Buffon", ruolo: "P", overall: 89 },
      { nome: "Wojciech", cognome: "Szczęsny", ruolo: "P", overall: 84 },
      { nome: "Giorgio", cognome: "Chiellini", ruolo: "D", overall: 89 },
      { nome: "Andrea", cognome: "Barzagli", ruolo: "D", overall: 84 },
      { nome: "Medhi", cognome: "Benatia", ruolo: "D", overall: 84 },
      { nome: "Alex", cognome: "Sandro", ruolo: "D", overall: 84 },
      { nome: "Mattia", cognome: "De Sciglio", ruolo: "D", overall: 80 },
      { nome: "Stephan", cognome: "Lichtsteiner", ruolo: "D", overall: 80 },
      { nome: "Miralem", cognome: "Pjanić", ruolo: "C", overall: 85 },
      { nome: "Sami", cognome: "Khedira", ruolo: "C", overall: 84 },
      { nome: "Blaise", cognome: "Matuidi", ruolo: "C", overall: 83 },
      { nome: "Claudio", cognome: "Marchisio", ruolo: "C", overall: 81 },
      { nome: "Rodrigo", cognome: "Bentancur", ruolo: "C", overall: 76 },
      { nome: "Paulo", cognome: "Dybala", ruolo: "A", overall: 88 },
      { nome: "Gonzalo", cognome: "Higuaín", ruolo: "A", overall: 88 },
      { nome: "Mario", cognome: "Mandžukić", ruolo: "A", overall: 84 },
      { nome: "Douglas", cognome: "Costa", ruolo: "A", overall: 84 },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "inter-2009-10",
    squadra: "Inter",
    anno: "2009-10",
    colore: "#0b1f8f",
    giocatori: [
      { nome: "Júlio", cognome: "César", ruolo: "P", overall: 88 },
      { nome: "Francesco", cognome: "Toldo", ruolo: "P", overall: 78 },
      { nome: "Maicon", cognome: "", ruolo: "D", overall: 87 },
      { nome: "Lúcio", cognome: "", ruolo: "D", overall: 85 },
      { nome: "Walter", cognome: "Samuel", ruolo: "D", overall: 84 },
      { nome: "Javier", cognome: "Zanetti", ruolo: "D", overall: 86 },
      { nome: "Cristian", cognome: "Chivu", ruolo: "D", overall: 80 },
      { nome: "Marco", cognome: "Materazzi", ruolo: "D", overall: 79 },
      { nome: "Wesley", cognome: "Sneijder", ruolo: "C", overall: 88 },
      { nome: "Esteban", cognome: "Cambiasso", ruolo: "C", overall: 85 },
      { nome: "Thiago", cognome: "Motta", ruolo: "C", overall: 82 },
      { nome: "Dejan", cognome: "Stanković", ruolo: "C", overall: 82 },
      { nome: "McDonald", cognome: "Mariga", ruolo: "C", overall: 74 },
      { nome: "Samuel", cognome: "Eto'o", ruolo: "A", overall: 90 },
      { nome: "Diego", cognome: "Milito", ruolo: "A", overall: 87 },
      { nome: "Goran", cognome: "Pandev", ruolo: "A", overall: 80 },
      { nome: "Mario", cognome: "Balotelli", ruolo: "A", overall: 79 },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "inter-2020-21",
    squadra: "Inter",
    anno: "2020-21",
    colore: "#0b1f8f",
    giocatori: [
      { nome: "Samir", cognome: "Handanović", ruolo: "P", overall: 83 },
      { nome: "Ionuț", cognome: "Radu", ruolo: "P", overall: 71 },
      { nome: "Stefan", cognome: "de Vrij", ruolo: "D", overall: 85 },
      { nome: "Milan", cognome: "Škriniar", ruolo: "D", overall: 84 },
      { nome: "Alessandro", cognome: "Bastoni", ruolo: "D", overall: 83 },
      { nome: "Achraf", cognome: "Hakimi", ruolo: "D", overall: 84 },
      { nome: "Aleksandar", cognome: "Kolarov", ruolo: "D", overall: 78 },
      { nome: "Danilo", cognome: "D'Ambrosio", ruolo: "D", overall: 78 },
      { nome: "Nicolò", cognome: "Barella", ruolo: "C", overall: 85 },
      { nome: "Marcelo", cognome: "Brozović", ruolo: "C", overall: 84 },
      { nome: "Ivan", cognome: "Perišić", ruolo: "C", overall: 82 },
      { nome: "Christian", cognome: "Eriksen", ruolo: "C", overall: 83 },
      { nome: "Arturo", cognome: "Vidal", ruolo: "C", overall: 80 },
      { nome: "Romelu", cognome: "Lukaku", ruolo: "A", overall: 88 },
      { nome: "Lautaro", cognome: "Martínez", ruolo: "A", overall: 85 },
      { nome: "Alexis", cognome: "Sánchez", ruolo: "A", overall: 81 },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "napoli-2022-23",
    squadra: "Napoli",
    anno: "2022-23",
    colore: "#12a0d7",
    giocatori: [
      { nome: "Alex", cognome: "Meret", ruolo: "P", overall: 82 },
      { nome: "Pierluigi", cognome: "Gollini", ruolo: "P", overall: 73 },
      { nome: "Kim", cognome: "Min-jae", ruolo: "D", overall: 85 },
      { nome: "Giovanni", cognome: "Di Lorenzo", ruolo: "D", overall: 83 },
      { nome: "Amir", cognome: "Rrahmani", ruolo: "D", overall: 81 },
      { nome: "Mário", cognome: "Rui", ruolo: "D", overall: 79 },
      { nome: "Mathías", cognome: "Olivera", ruolo: "D", overall: 79 },
      { nome: "Juan", cognome: "Jesus", ruolo: "D", overall: 76 },
      { nome: "Stanislav", cognome: "Lobotka", ruolo: "C", overall: 84 },
      { nome: "Frank", cognome: "Anguissa", ruolo: "C", overall: 84 },
      { nome: "Piotr", cognome: "Zieliński", ruolo: "C", overall: 83 },
      { nome: "Eljif", cognome: "Elmas", ruolo: "C", overall: 78 },
      { nome: "Victor", cognome: "Osimhen", ruolo: "A", overall: 88 },
      { nome: "Khvicha", cognome: "Kvaratskhelia", ruolo: "A", overall: 87 },
      { nome: "Hirving", cognome: "Lozano", ruolo: "A", overall: 81 },
      { nome: "Matteo", cognome: "Politano", ruolo: "A", overall: 80 },
      { nome: "Giacomo", cognome: "Raspadori", ruolo: "A", overall: 79 },
    ],
  },
];
