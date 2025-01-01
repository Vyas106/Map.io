import { Server } from 'socket.io';
import { getUsers, setUser, removeUser, getAllUsers } from '../utils/userStore';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('login', (username) => {
        setUser(socket.id, { username, location: null });
        io.emit('users', getAllUsers());
      });

      socket.on('updateLocation', (userData) => {
        const user = getUsers().get(socket.id);
        if (user) {
          user.location = userData.location;
          setUser(socket.id, user);
          io.emit('users', getAllUsers());
        }
      });

      socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('users', getAllUsers());
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server already running');
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false
  }
};

export default ioHandler;