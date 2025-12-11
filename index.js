require('dotenv').config();

const port = process.env.PORT || 3000;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();


app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const movieSchema = new mongoose.Schema({
  title: String,
  genre: String,
  releaseYear: Number,
  director: String,
  cast: String,
  rating: Number,
  duration: Number,
  plotSummary: String,
  posterUrl: String,
  language: String,
  country: String,
  addedBy: String
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

app.get('/', (req, res) => {
  res.send('MovieMaster Pro Server Running');
});

app.get('/movies/top-rated', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ rating: -1 }).limit(5);
    res.send(movies);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching top rated movies', error: error.message });
  }
});

app.get('/movies/recent', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).limit(6);
    res.send(movies);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching recent movies', error: error.message });
  }
});

app.get('/movies/user/:email', async (req, res) => {
  try {
    const movies = await Movie.find({ addedBy: req.params.email });
    res.send(movies);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching user movies', error: error.message });
  }
});

app.get('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }
    res.send(movie);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching movie', error: error.message });
  }
});

app.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.send(movies);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching movies', error: error.message });
  }
});

app.post('/movies', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const result = await movie.save();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error adding movie', error: error.message });
  }
});

app.put('/movies/:id', async (req, res) => {
  try {
    const result = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!result) {
      return res.status(404).send({ message: 'Movie not found' });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error updating movie', error: error.message });
  }
});

app.delete('/movies/:id', async (req, res) => {
  try {
    const result = await Movie.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send({ message: 'Movie not found' });
    }
    res.send({ message: 'Movie deleted successfully', deletedMovie: result });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting movie', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});