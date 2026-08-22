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

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

const User = require('./models/User');
app.post('/api/users/login', async (req, res) => {
  try {
    const { username } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({ 
        username, 
        avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random` 
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple health check route
app.get('/', (req, res) => {
  res.send('Mini Slack API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
