// const express = require('express')
// const socketIO = require('socket.io')
// const http = require("http")

// //initialization
// const app = express()
// const server = http.createServer(app)
// const port = process.env.PORT || 3000
// const io = socketIO(server)

// //sockets
// require("./sockets")(io)


// // static files
// app.use(express.static('./src/public'))

// // middlewares

// // starting the server
// server.listen(port, () => {
//     console.log("server on!");
// })



// rarete no?

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
require("./sockets")(io)

// Array para almacenar las salas y sus participantes
let rooms = {};

// app.use(express.static(__dirname + '/public'));
app.use(express.static('./src/public'))

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    // Manejar la creación de una nueva sala
    socket.on('createRoom', ({ roomNumber, nickname }) => {
        if (!rooms[roomNumber]) {
            rooms[roomNumber] = [];
        }
        rooms[roomNumber].push({ id: socket.id, nickname });
        socket.join(roomNumber);
        io.to(roomNumber).emit('roomParticipants', rooms[roomNumber]);
    });

    // Manejar la unión a una sala existente
    socket.on('joinRoom', ({ roomNumber, nickname }) => {
        if (!rooms[roomNumber]) {
            return socket.emit('error', 'La sala especificada no existe');
        }
        rooms[roomNumber].push({ id: socket.id, nickname });
        socket.join(roomNumber);
        io.to(roomNumber).emit('roomParticipants', rooms[roomNumber]);
    });

    // Manejar el envío de mensajes
    socket.on('sendMessage', ({ roomNumber, message }) => {
        socket.to(roomNumber).emit('receiveMessage', {
            nickname: rooms[roomNumber].find(participant => participant.id === socket.id).nickname,
            message
        });
    });

    // Manejar la desconexión del usuario
    socket.on('disconnect', () => {
        for (let roomNumber in rooms) {
            rooms[roomNumber] = rooms[roomNumber].filter(participant => participant.id !== socket.id);
            io.to(roomNumber).emit('roomParticipants', rooms[roomNumber]);
        }
        console.log('Usuario desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
