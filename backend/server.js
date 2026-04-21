require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5176',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://geovisioncrm.geovisionservices.com',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' })); // Allow large payloads (base64 photos)
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── MongoDB connection ────────────────────────────────────────────────────────
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
    } catch (err) {
        console.error('❌  MongoDB connection error:', err.message);
        console.error('👉  Check your MONGODB_URI in backend/.env');
        process.exit(1);
    }
};

connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
});
