require('dotenv').config({ debug: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/influencer-profile', require('./routes/influencerProfile'));
app.use('/api/brand-profile', require('./routes/brandProfile'));

// Test route
app.get('/', (req, res) => {
  res.send('TrendMatch API is running');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
