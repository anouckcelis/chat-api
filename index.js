const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Fake database
let messages = [
  { id: '1', user: 'John', text: 'Hello', createdAt: new Date().toISOString() },
  { id: '2', user: 'Jane', text: 'Hi', createdAt: new Date().toISOString() }
];

// Root route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// GET alle berichten
// Optioneel gefilterd op user: GET /api/v1/messages?user=username
app.get('/api/v1/messages', (req, res) => {
  const user = req.query.user;

  // ----- FILTER BERICHETEN OP USER -----
  if (user) {
    const filtered = messages.filter(m => m.user.toLowerCase() === user.toLowerCase());
    return res.status(200).json({
      status: 'success',
      message: `Berichten van gebruiker ${user}`,
      data: { messages: filtered }
    });
  }
  // -----------------------------------

  // Als er geen filter is, geef alle berichten terug
  res.status(200).json({
    status: 'success',
    message: 'Alle berichten',
    data: { messages }
  });
});

// GET één bericht op ID
app.get('/api/v1/messages/:id', (req, res) => {
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ status: 'fail', message: 'Bericht niet gevonden' });

  res.status(200).json({
    status: 'success',
    message: 'Bericht opgehaald',
    data: { message: msg }
  });
});

// POST: nieuw bericht toevoegen
app.post('/api/v1/messages', (req, res) => {
  const { message } = req.body;
  if (!message || !message.user || !message.text) {
    return res.status(400).json({ status: 'fail', message: '`user` en `text` zijn verplicht' });
  }

  const newMessage = { id: uuidv4(), ...message, createdAt: new Date().toISOString() };
  messages.push(newMessage);

  res.status(201).json({
    status: 'success',
    message: 'Bericht aangemaakt',
    data: { message: newMessage }
  });
});

// PUT: bestaand bericht updaten
app.put('/api/v1/messages/:id', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const index = messages.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ status: 'fail', message: 'Bericht niet gevonden' });

  if (message.text !== undefined) messages[index].text = message.text;
  if (message.user !== undefined) messages[index].user = message.user;
  messages[index].editedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    message: 'Bericht bijgewerkt',
    data: { message: messages[index] }
  });
});

// DELETE: bestaand bericht verwijderen
app.delete('/api/v1/messages/:id', (req, res) => {
  const index = messages.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ status: 'fail', message: 'Bericht niet gevonden' });

  messages.splice(index, 1);
  res.status(200).json({
    status: 'success',
    message: 'Bericht verwijderd'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
