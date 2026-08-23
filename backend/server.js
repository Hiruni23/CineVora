require('dotenv').config();
const http = require('http');           
const { Server } = require("socket.io");
const app = require("./app");           
const { connectMongo } = require('./utils/mongo');

connectMongo()
  .then((uri) => console.log(`MongoDB connected using ${uri}`))
  .catch((err) => console.error(err.message));

// Create Server
const PORT = process.env.PORT || 5001;
const server = http.createServer(app); 

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Socket Logic
let onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    if (!userId) return;
    onlineUsers.set(String(userId), socket.id);
  });

  socket.on('disconnect', () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
  });
});

// Share Socket with App (Required for Controllers)
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});