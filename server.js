const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the "mychat" directory
app.use('/static', express.static(path.join(__dirname, 'mychat')));

// Handle root route
app.get('/', (req, res) => {
  res.send('hi');
});

// Handle /json route
app.get('/json', (req, res) => {
  res.json({ text: 'hi', numbers: [1, 2, 3] });
});

// Handle /echo route
app.get('/echo', (req, res) => {
  const input = req.query.input || '';
  const normal = input;
  const shouty = input.toUpperCase();
  const characterCount = input.length;
  const backwards = input.split('').reverse().join('');

  res.json({ normal, shouty, characterCount, backwards });
});

// Handle /chat route
app.get('/chat', (req, res) => {
  const message = req.query.message || '';
  io.emit('message', message);
  res.send('Message sent to all clients');
});

// Handle /sse route
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send a welcome message when a client connects
  sendEvent({ message: 'Welcome to the chat!' });

  // Handle client disconnect
  req.socket.on('close', () => {
    // Perform cleanup or additional actions when a client disconnects
    console.log('Client disconnected');
    res.end(); // End the response when the client disconnects
  });

  // Listen for messages from the client
  io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });
});


app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'mychat', 'chat.html'));
});

// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
