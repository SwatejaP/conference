const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: true, // Allow any origin in lab environment
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Prometheus Metrics
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get('/metrics', async (req, res) => {
    try {
        res.setHeader('Content-Type', client.register.contentType);
        const metrics = await client.register.metrics();
        res.send(metrics);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Routes
// Microservice Role Configuration
const ROLE = process.env.MICROSERVICE_ROLE; // 'AUTH', 'ROOMS', 'BOOKINGS', or undefined (Monolith)

console.log(`Starting Server in Role: ${ROLE || 'MONOLITH'}`);

// Conditionally mount routes
if (!ROLE || ROLE === 'AUTH') {
    app.use('/api/auth', require('./src/routes/auth'));
}

if (!ROLE || ROLE === 'ROOMS') {
    app.use('/api/rooms', require('./src/routes/rooms'));
}

if (!ROLE || ROLE === 'BOOKINGS') {
    app.use('/api/bookings', require('./src/routes/bookings'));
}

// Global Error Handler
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const prisma = require('./src/lib/prisma');

async function startServer() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to MongoDB Atlas');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
