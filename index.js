const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ----- MONGODB CONNECTIE -----
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ----- SCHEMA -----
const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  editedAt: Date
});

const Message = mongoose.model('Message', messageSchema);

// ----- ROUTES -----
app.get('/', (req, res) => {
  res.send('Chat API is running!');
});

// GET alle berichten (optioneel filter op user)
app.get('/api/v1/messages', async (req, res) => {
  try {
    const user = req.query.user;
    const query = user ? { from: user } : {};
    const messages = await Message.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      message: user ? `Berichten van gebruiker ${user}` : 'Alle berichten',
      data: { messages }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET message by ID
app.get('/api/v1/messages/:id', async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.status(200).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create message
app.post('/api/v1/messages', async (req, res) => {
  try {
    const { from, text } = req.body;
    if (!from || !text) return res.status(400).json({ error: '`from` and `text` are required' });

    const newMessage = new Message({ from, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update message
app.put('/api/v1/messages/:id', async (req, res) => {
  try {
    const { text, from } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (text !== undefined) msg.text = text;
    if (from !== undefined) msg.from = from;
    msg.editedAt = new Date();

    await msg.save();
    res.status(200).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE message
app.delete('/api/v1/messages/:id', async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- START SERVER -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
