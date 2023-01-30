const express = require('express');
const app = express();

//Create server used for socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);

// To create random id
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs');
app.use(express.static('public'));

// This route redirect to a random created uuid
app.get('/', (req, res) => {
    res.redirect(`${uuidV4()}`);
})

// This route help to join the room by roomId
app.get('/:room', (req, res) => {
    //Get room from room Parameter
    res.render('room', { roomId: req.params.room })
})

//runs when someone onnects to our webpage
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        //new user connected
        socket.join(roomId);
        //When user connected
        socket.broadcast.to(roomId).emit("user-connected", userId);

        //When user is leaving or disconnecting
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        })
    })
})

server.listen(7070);