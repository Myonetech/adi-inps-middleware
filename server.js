const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint di test per verificare che il server risponda immediatamente
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Middleware attivo' });
});

// Endpoint di avvio login (reindirizza all'URL ufficiale INPS)
app.post('/api/start-proxy', (req, res) => {
  const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
  
  res.json({
    sessionId: sessionId,
    loginUrl: "https://www.inps.it/it/it/dettaglio-scheda.schede-paese-servizi.assegno-di-inclusione-adi.html"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server attivo sulla porta ${PORT}`));
