// server.js
const express = require('express');
const net = require('net');
const path = require('path');
const bodyParser = require('express').json();

const app = express();
const PORT = 3000;

// Middleware zum Parsen von JSON und URL-encoded Daten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setze EJS als Template-Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Statische Dateien bereitstellen (CSS, JS, Bilder)
app.use(express.static(path.join(__dirname, 'public')));

// Route für die Startseite
app.get('/', (req, res) => {
  res.render('index', { response: null });
});

// Route zum Senden des AMCP-Befehls
app.post('/send-command', async (req, res) => {
  const command = req.body.command;
  try {
    const response = await sendAMCPCommand(command);
    res.render('index', { response });
  } catch (error) {
    res.render('index', { response: `Fehler: ${error.message}` });
  }
});

// Funktion zum Senden des AMCP-Befehls an den CasparCG-Server
function sendAMCPCommand(command) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const CASPARCG_HOST = 'localhost'; // IP-Adresse deines CasparCG-Servers
    const CASPARCG_PORT = 5250; // Standard-Port für CasparCG

    client.connect(CASPARCG_PORT, CASPARCG_HOST, () => {
      console.log('Verbunden mit CasparCG-Server');
      client.write(`${command}\r\n`);
    });

    client.on('data', (data) => {
      resolve(data.toString());
      client.destroy(); // Verbindung schließen nach Empfang der Antwort
    });

    client.on('error', (err) => {
      reject(err);
    });

    client.on('close', () => {
      console.log('Verbindung geschlossen');
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
