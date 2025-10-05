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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
