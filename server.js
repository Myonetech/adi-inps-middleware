const express = require('express');
const cors = require('cors');

const app = express();

// Abilita CORS per permettere a GoodBarber di fare chiamate verso questo server
app.use(cors());
app.use(express.json());

// Rotta di prova principale
app.get('/', (req, res) => {
  res.send('Middleware INPS ADI attivo!');
});

// Endpoint API richiamato da GoodBarber
app.get('/api/pagamenti-adi', (req, res) => {
  // Risposta simulata (qui inserirai la logica di estrazione/scraping INPS)
  const datiADI = {
    stato_domanda: "Accolta",
    importo: "500,00 €",
    prossimo_pagamento: "27/10/2026",
    mensilita: "Ottobre 2026"
  };

  res.json(datiADI);
});

// Gestione porta dinamica richiesta da Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
