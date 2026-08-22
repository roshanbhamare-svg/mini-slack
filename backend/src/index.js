require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./db');
const setupSocket = require('./utils/socket');

const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST']
  }
});
setupSocket(io);

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middlewares/authMiddleware');

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Must be exact for credentials
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', protect, channelRoutes);
app.use('/api/messages', protect, messageRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('Mini Slack API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
