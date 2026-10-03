const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

// Mappa temporanea in memoria per le sessioni attive
const activeSessions = {};

// 1. Endpoint che avvia la sessione proxy e restituisce l'URL di login INPS
app.post('/api/start-proxy', async (req, res) => {
  try {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
    
    // Avvia il browser headless
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1");

    // Naviga alla pagina di accesso ADI INPS
    await page.goto("https://www.inps.it/it/it/dettaglio-scheda.schede-paese-servizi.assegno-di-inclusione-adi.html", { waitUntil: 'networkidle2' });

    // Salva il riferimento al browser e alla pagina per questa sessione
    activeSessions[sessionId] = { browser, page, status: 'pending', data: null };

    // Restituisce l'ID sessione e l'URL di login all'app
    res.json({
      sessionId: sessionId,
      loginUrl: page.url()
    });

  } catch (error) {
    res.status(500).json({ error: "Errore nell'avvio del proxy: " + error.message });
  }
});

// 2. Endpoint polling: controlla se l'utente ha completato SPID e recupera i dati
app.get('/api/check-status/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions[sessionId];

  if (!session) {
    return res.status(404).json({ error: "Sessione non trovata" });
  }

  try {
    const cookies = await session.page.cookies();
    const inpsCookieStr = cookies.map(c => `\({c.name}=\){c.value}`).join('; ');

    // Verifica se tra i cookie è presente il token di sessione autenticata INPS
    if (inpsCookieStr.includes('INPS_SESSIONID') || session.page.url().includes('EsitoDomandeADI')) {
      
      // Chiamata interna alle API ADI tramite i cookie catturati
      const responseData = await session.page.evaluate(async () => {
        const res = await fetch("https://serviziweb2.inps.it/EsitoDomandeADI/api/getDettaglioPagamenti");
        return await res.json();
      });

      // Mappatura dati per l'app
      const result = {
        stato_domanda: responseData.stato || "Accolta",
        importo: responseData.importoDisposto ? `${responseData.importoDisposto} €` : "-- €",
        prossimo_pagamento: responseData.dataDisposizione || "--/--/----",
        mensilita: responseData.mensilitaRiferimento || "Mese Corrente"
      };

      // Chiudi il browser e pulisci la sessione
      await session.browser.close();
      delete activeSessions[sessionId];

      return res.json({ status: 'completed', data: result });
    }

    res.json({ status: 'pending' });

  } catch (error) {
    res.json({ status: 'pending' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server in ascolto sulla porta ${PORT}`));
