const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Fake database
let messages = [
  { id: '1', user: 'John', text: 'Hello'},
  { id: '2', user: 'Jane', text: 'Hi'}
];

// Root route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// GET alle berichten
app.get('/api/v1/messages', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GETTING messages',
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
    message: 'Message saved',
    data: { message: newMessage }
  });
});

// PUT: bestaand bericht updaten
app.put('/api/v1/messages/:id', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const index = messages.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ status: 'fail', message: 'Message not found' });

  if (message.text !== undefined) messages[index].text = message.text;
  if (message.user !== undefined) messages[index].user = message.user;
  messages[index].editedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    message: 'Message updated',
    data: { message: messages[index] }
  });
});

// DELETE: bestaand bericht verwijderen
app.delete('/api/v1/messages/:id', (req, res) => {
  const index = messages.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ status: 'fail', message: 'Message not found' });

  messages.splice(index, 1);
  res.status(200).json({
    status: 'success',
    message: 'Message deleted'
  });
});

app.get('/api/v1/messages', (req, res) => {
  const user = req.query.user;

  // Als er een user-parameter is → filter op user
  if (user) {
    const filtered = messages.filter(
      m => m.user.toLowerCase() === user.toLowerCase()
    );

    // Als geen berichten gevonden zijn, stuur lege lijst terug (geen fout)
    return res.status(200).json({
      status: 'success',
      message: `Messages from user ${user}`,
      data: { messages: filtered }
    });
  }

  // Anders: geef gewoon alle berichten terug
  res.status(200).json({
    status: 'success',
    message: 'GETTING messages',
    data: { messages }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
