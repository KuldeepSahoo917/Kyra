const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const connectDB = require('./config/db');
const setupSocket = require('./socket/socketHandler');

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');

dotenv.config();
connectDB();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Set to false if you have trouble with cross-origin resources in dev/prod
}));
app.use(compression());
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (attachments)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../frontend', 'dist', 'index.html'));
    });
} else {
    // 404 handler for development
    app.use((req, res) => {
        res.status(404).json({ message: `Route ${req.originalUrl} not found` });
    });
}

// Global error handler
app.use((err, req, res, next) => {
    console.error(process.env.NODE_ENV === 'production' ? err.message : err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Setup Socket.io
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server };
