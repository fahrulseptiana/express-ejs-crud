const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Pass message to all renders
app.use((req, res, next) => {
  res.locals.message = req.query.message || null;
  next();
});

// Routes
const contactRoutes = require('./routes/contactRoutes');
app.use('/', contactRoutes);

// Error handler
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Initialize database and start server
const { initDatabase } = require('./config/database');

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Contact Manager running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
