import express from 'express';
import generator from './bubbleConnGen.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', express.static(__dirname + '/public'));

const server = app.listen(PORT, (err) => {
  err ? console.log(err) : console.log(`Successfully connected to port ${PORT}`);
});

const io = require('socket.io')(server);

var userQueue = [], rooms = {}, names = {}, allUsers = {};

var findConnection = (socket) => {
  if(userQueue.length >= 1) {
    var peer = userQueue.pop();
    console.log(`PEER ID: ${peer.id}, SOCKET ID: ${socket.id}`);
    var room = socket.id + "#" + peer.id;
    peer.join(room);
    socket.join(room);
    rooms[peer.id] = room;
    rooms[socket.id] = room;
    peer.emit('chat start', {'name': names[socket.id], 'room': room});
    socket.emit('chat start', {'name': names[peer.id], 'room': room});
  } else {
    userQueue.push(socket);
  }
  return;
}

io.on('connection', (socket) => {

  socket.on('newUser', (data) => {
    console.log(`User ${socket.id} connected!`);
    names[socket.id] = data.name;
    allUsers[socket.id] = socket;
    findConnection(socket);
  });

  socket.on('message', (data) => {
    var room = rooms[socket.id];
    socket.broadcast.to(room).emit('message', data);
  });

  socket.on('leave room', () => {
    console.log('left Room!');
    var room = rooms[socket.id];
    if(room) {
      socket.broadcast.to(room).emit('Chat End');
      socket.leave(room);
      var peerID = room.split('#');
      peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
      allUsers[peerID].leave(room);
      Promise.resolve(findConnection(socket)).then((res) => {
        findConnection(allUsers[peerID]);
      })
    } else {
      socket.emit('Chat End');
    }
  });

  socket.on('disconnect', () => {
    var room = rooms[socket.id];
    if(room) {
      socket.broadcast.to(room).emit('Chat End');
      socket.leave(room);
      var peerID = room.split("#");
      peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
      findConnection(allUsers[peerID]);
    }
    socket.emit('Chat End');
    for(var i = 0; i < userQueue.length; i++) {
      if(userQueue[i]['id'] === socket.id) {
        userQueue.splice(i, 1);
      }
    }
    console.log('user disconnect');
  });

});
