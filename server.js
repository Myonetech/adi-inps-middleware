const express = require('express');
const cors = require('cors');

const app = express();

// Abilita CORS per permettere le chiamate da GoodBarber
app.use(cors());
app.use(express.json());

// Endpoint POST per ricevere la sessione ed interrogare l'INPS
app.post('/api/fetch-adi', async (req, res) => {
  const { cookies } = req.body;

  // Controllo se il client ha inviato la stringa di sessione
  if (!cookies) {
    return res.status(400).json({ error: "Cookie di sessione mancanti" });
  }

  try {
    // Chiamata HTTP diretta verso le API INPS inoltrando i cookie dell'utente
    const inpsResponse = await fetch("https://serviziweb2.inps.it/EsitoDomandeADI/api/getDettaglioPagamenti", {
      headers: {
        "Cookie": cookies,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        "Accept": "application/json, text/plain, */*"
      }
    });

    if (!inpsResponse.ok) {
      throw new Error("Sessione INPS non valida o scaduta");
    }

    const rawData = await inpsResponse.json();

    // Formattazione pulita dei dati inviati a GoodBarber
    const rispostaFormattata = {
      stato_domanda: rawData.stato || "Accolta",
      importo: rawData.importoDisposto ? `${rawData.importoDisposto} €` : "-- €",
      prossimo_pagamento: rawData.dataDisposizione || "--/--/----",
      mensilita: rawData.mensilitaRiferimento || "Mese Corrente"
    };

    res.json(rispostaFormattata);

  } catch (error) {
    res.status(500).json({ error: "Impossibile recuperare i dati INPS. Verifica che la sessione sia attiva." });
  }
});

// Impostazione porta dinamica per Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
