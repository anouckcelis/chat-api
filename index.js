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

// GET all messages
app.get('/api/v1/messages', (req, res) => {
  const user = req.query.user;
  if (user) {
    const filtered = messages.filter(m => m.from.toLowerCase() === user.toLowerCase());
    return res.status(200).json(filtered);
  }
  res.status(200).json(messages);
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



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

