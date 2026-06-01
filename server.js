require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  status: { type: String, enum: ['Want to Read', 'Reading', 'Finished'], default: 'Want to Read' },
  genre: { type: String, enum: ['Self-Help', 'Fiction', 'Technology', 'Business', 'Psychology', 'Philosophy', 'Biography', 'Other'], default: 'Other' },
  imageUrl: { type: String, default: '' },
  notes: { type: String, default: '' }
});

const Book = mongoose.model('Book', bookSchema);

app.get('/api/books', async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

app.post('/api/books', async (req, res) => {
  const { title, author, status, genre, imageUrl, notes } = req.body;
  const book = await Book.create({ title, author, status, genre, imageUrl, notes });
  res.status(201).json(book);
});

app.patch('/api/books/:id', async (req, res) => {
  const allowed = {};
  if (req.body.status)            allowed.status   = req.body.status;
  if (req.body.notes !== undefined)  allowed.notes    = req.body.notes;
  if (req.body.genre !== undefined)    allowed.genre    = req.body.genre;
  if (req.body.imageUrl !== undefined) allowed.imageUrl = req.body.imageUrl;
  const book = await Book.findByIdAndUpdate(req.params.id, allowed, { new: true });
  res.json(book);
});

app.delete('/api/books/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ReadLog running on port ${PORT}`));
