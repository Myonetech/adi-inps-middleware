const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint di test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Middleware attivo' });
});

// Endpoint che restituisce il link diretto alla pagina SPID INPS ADI
app.post('/api/start-proxy', (req, res) => {
  const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
  
  res.json({
    sessionId: sessionId,
    loginUrl: "https://serviziweb2.inps.it/AS0207/PassiLogin/jsp/spid/loginSPID.jsp?uri=https%3A%2F%2Fserviziweb2.inps.it%2FAS0207%2FMisureInclusioneAttiva%2Fmain%3Fm%3Da&S=S"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server attivo sulla porta ${PORT}`));
