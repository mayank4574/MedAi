require('dotenv').config();

// Warn if Cloudinary credentials are missing, but don't crash the server so other APIs (like Gemini) can still work
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('\n======================================================');
  console.warn('[WARNING] Cloudinary is not configured properly.');
  console.warn('Missing one or more required environment variables:');
  console.warn('- CLOUDINARY_CLOUD_NAME');
  console.warn('- CLOUDINARY_API_KEY');
  console.warn('- CLOUDINARY_API_SECRET');
  console.warn('Profile picture uploads will fail. Other features will work normally.');
  console.warn('======================================================\n');
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ 
  origin: function(origin, callback) {
    if(!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy violation'), false);
  }, 
  credentials: true 
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MedScanAI API is running', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MedScanAI Server running on port ${PORT}`));
