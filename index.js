
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

let messages = [
  { id: '1', from: 'John', text: 'Hello', createdAt: new Date().toISOString() },
  { id: '2', from: 'Jane', text: 'hi', createdAt: new Date().toISOString() }
];

app.get('/', (req, res) => {
  res.send('Chat API is running!');
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

  // Als er geen filter is, geef alle berichten terug
  res.status(200).json({
    status: 'success',
    message: 'Alle berichten',
    data: { messages }
  });
});

// GET message by ID
app.get('/api/v1/messages/:id', (req, res) => {
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  res.status(200).json(msg);
});

// POST create message
app.post('/api/v1/messages', (req, res) => {
  const { from, text } = req.body;
  if (!from || !text) return res.status(400).json({ error: '`from` and `text` are required' });

  const newMessage = { id: uuidv4(), from, text, createdAt: new Date().toISOString() };
  messages.push(newMessage);
  res.status(201).json(newMessage);
});

// PUT update message
app.put('/api/v1/messages/:id', (req, res) => {
  const { id } = req.params;
  const { text, from } = req.body;
  const index = messages.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Message not found' });

  if (text !== undefined) messages[index].text = text;
  if (from !== undefined) messages[index].from = from;
  messages[index].editedAt = new Date().toISOString();

  res.status(200).json(messages[index]);
});


// DELETE message
app.delete('/api/v1/messages/:id', (req, res) => {
  const index = messages.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Message not found' });

  messages.splice(index, 1);
  res.status(204).send();
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));