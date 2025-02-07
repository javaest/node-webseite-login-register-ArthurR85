const express = require('express');
const session = require('express-session');
const req = require('express/lib/request');
const res = require('express/lib/response');
const app = express();
const path = require('path');

let users = [
  { id: 1, name: 'Alice',password:'test' },
  { id: 2, name: 'admin',password:'password' }
];
// Middleware für JSON Parsing (falls du POST-Daten benötigst)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: 'mein-geheimer-schluessel',  // Geheimen Schlüssel für das Signieren der Session-ID
  resave: false,                      // Verhindert, dass die Session bei jeder Anfrage zurückgesetzt wird
  saveUninitialized: true,            // Speichert die Session auch ohne Veränderungen
  cookie: { secure: false }           // Secure setzen, wenn du HTTPS verwendest
}));


//-----------------------------------
//Ergänzung von Arthur R.
//-----------------------------------

// index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Registrierung
app.post ('/register', (req, res) => {
  const {username, password} = req.body;

// Benutzer vorh.
if (users.find(u => u.username === username)){
    return res.status(400).send('Benutzer vergeben');
}

// Benutzer hinz.
const newUser = {id: users.length +1, username, password};
users.push(newUser);

//zur Login-Seite weiterleiten
res.redirect('/login');

//-----------------------------------

// Route für die Login-Seite
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));  // Senden der login.html-Seite
});

// Endpoint 
app.get('/get-username', (req, res) => {
    if (req.session.user) {
      res.json({ username: req.session.user });  // Sendet den Benutzernamen an den Client
    } else {
      res.status(401).json({ error: 'Nicht angemeldet' });
    }
  });
  
// Endpoint zum prüfen des Creadentials
app.post('/login', (req, res) => {
  const { username, password } = req.body;
    if(password=="test" && username=="admin"){
      req.session.user = username; 
      return res.redirect('/content');
    }
    
  return res.status(401).send('Benutzername oder Passwort falsch');

});
// Route für die "Context"-Seite nach dem Login
app.get('/content', (req, res) => {
  if (!req.session.user) {
    return res.status(403).send('Zugriff verweigert. Bitte anmelden.');  // Zugriff verweigern, wenn der Benutzer nicht eingeloggt ist
  }

  // Nach erfolgreichem Login: Anzeige der "Context"-Seite
  res.sendFile(path.join(__dirname, 'views', 'content.html'));
});

// Logout-Route zum Abmelden
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Fehler beim Abmelden');
    }
    res.status(200).send('Erfolgreich abgemeldet');
  });
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
