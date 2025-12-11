require('dotenv').config();

const port = process.env.PORT || 3000;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// ==============================
// Debugging: Show loaded env vars
// ==============================
console.log("DEBUG → Loaded MONGO_URI:", process.env.MONGO_URI ? "OK (not empty)" : "❌ EMPTY or UNDEFINED");
console.log("DEBUG → Running on PORT:", port);

// ==============================
// Vercel-safe MongoDB connection
// ==============================
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("DEBUG → Mongo already connected. Skipping new connection.");
    return;
  }

  try {
    console.log("DEBUG → Connecting to MongoDB...");
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = db.connections[0].readyState === 1;

    console.log("DEBUG → MongoDB Connected:", isConnected);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

// Connect at startup
connectDB();


// ==============================
// Schema & Model
// ==============================
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


// ==============================
// Routes
// ==============================
app.get('/', (req, res) => {
  res.send('MovieMaster Pro Server Running');
});

app.get('/movies/top-rated', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Fetching top rated movies...");

    const movies = await Movie.find().sort({ rating: -1 }).limit(5);
    res.send(movies);
  } catch (error) {
    console.error("❌ Error fetching top rated movies:", error);
    res.status(500).send({ message: 'Error fetching top rated movies', error: error.message });
  }
});

app.get('/movies/recent', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Fetching recent movies...");

    const movies = await Movie.find().sort({ createdAt: -1 }).limit(6);
    res.send(movies);
  } catch (error) {
    console.error("❌ Error fetching recent movies:", error);
    res.status(500).send({ message: 'Error fetching recent movies', error: error.message });
  }
});

app.get('/movies/user/:email', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Fetching movies by user:", req.params.email);

    const movies = await Movie.find({ addedBy: req.params.email });
    res.send(movies);
  } catch (error) {
    console.error("❌ Error fetching user movies:", error);
    res.status(500).send({ message: 'Error fetching user movies', error: error.message });
  }
});

app.get('/movies/:id', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Fetching movie ID:", req.params.id);

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }
    res.send(movie);
  } catch (error) {
    console.error("❌ Error fetching movie:", error);
    res.status(500).send({ message: 'Error fetching movie', error: error.message });
  }
});

app.get('/movies', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Fetching all movies...");

    const movies = await Movie.find();
    res.send(movies);
  } catch (error) {
    console.error("❌ Error fetching movies:", error);
    res.status(500).send({ message: 'Error fetching movies', error: error.message });
  }
});

app.post('/movies', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Adding new movie:", req.body.title);

    const movie = new Movie(req.body);
    const result = await movie.save();
    res.send(result);
  } catch (error) {
    console.error("❌ Error adding movie:", error);
    res.status(500).send({ message: 'Error adding movie', error: error.message });
  }
});

app.put('/movies/:id', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Updating movie ID:", req.params.id);

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
    console.error("❌ Error updating movie:", error);
    res.status(500).send({ message: 'Error updating movie', error: error.message });
  }
});

app.delete('/movies/:id', async (req, res) => {
  try {
    await connectDB();
    console.log("DEBUG → Deleting movie ID:", req.params.id);

    const result = await Movie.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send({ message: 'Movie not found' });
    }
    res.send({ message: 'Movie deleted successfully', deletedMovie: result });
  } catch (error) {
    console.error("❌ Error deleting movie:", error);
    res.status(500).send({ message: 'Error deleting movie', error: error.message });
  }
});


// ==============================
// Start Server
// ==============================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
