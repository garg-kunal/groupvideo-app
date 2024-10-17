require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const { v4: uuidv4 } = require('uuid');
const io = socket(server);
var bodyParser = require('body-parser');
var cors = require('cors')


var port = process.env.PORT || 4000;

const users = {};
const roomData = {};
const socketToRoom = {};
const roomAdmin = {};
const userWaits = [];
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.post('/create-room', (req, res) => {
    const roomID = uuidv4().substring(0, 7);
    res.json({
        roomID
    })
})

app.get('/', (req, res) => res.status(200).send('Server is up and running'))

io.on('connection', socket => {
    socket.on("join room", (roomID, name, video, audio) => {

        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 8) {
                socket.emit("room full");
                return;
            }

            userWaits.push({
                "socket": socket,
                "socketId": socket.id
            });

            io.sockets.in(roomAdmin[roomID]).emit('newUser', { name: name, socketId: socket.id },);

        } else {
            users[roomID] = [socket.id];
            roomAdmin[roomID] = socket.id;
            socketToRoom[socket.id] = roomID;
            socket.join(roomID);
            var user = {
                "id": socket.id,
                "name": name,
                "video": video,
                "audio": audio
            };
            roomData[roomID] = [user];

            const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
            socket.emit("all users", { users: usersInThisRoom, allowed: true, usersData: roomData[roomID], admin: true });
        }
    });

    socket.on('changeControls', (roomID, name, video, audio) => {
        console.log("90", roomID, name, socket.id)
        console.log(roomData[roomID]);
        const users = roomData[roomID].filter(id => id.name !== name);
        var newUser = {
            "id": socket.id,
            "name": name,
            "video": video,
            "audio": audio
        };
        console.log(users);
        roomData[roomID] = users;
        roomData[roomID].push(newUser);
        console.log(roomData[roomID]);
        io.sockets.in(roomID).emit('changeControl', { data: roomData[roomID] })
    })

    socket.on('newMessage', (data) => {
        console.log(data)
        let currentDate = new Date();
        let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
        io.sockets.in(data.roomID).emit('message', {
            message: data.message,
            name: data.name,
            time: time
        })
    })
    socket.on('confirm', (roomID, socketId, name, video, audio) => {
        console.log(roomID, socketId)
        users[roomID].push(socketId);
        socketToRoom[socketId] = roomID;
        var user = {
            "id": socketId,
            "name": name,
            "video": video,
            "audio": audio
        };
        roomData[roomID].push(user);
        let i = userWaits.findIndex(user => user.socketId === socketId);
        const socketB = userWaits[i].socket;
        socketB.join(roomID);
        delete userWaits[i];
        const usersInThisRoom = users[roomID].filter(id => id !== socketId);
        io.sockets.in(roomID).emit('changeControl', { data: roomData[roomID] })
        io.sockets.in(socketId).emit("all users", { users: usersInThisRoom, allowed: true, usersData: roomData[roomID], admin: false });
    })
    socket.on('remove', (id) => {
        const roomID = socketToRoom[id];
        let room = users[roomID];
        let room1 = roomData[roomID];
        if (room) {
            room = room.filter(ids => ids.id !== id);
            users[roomID] = room;
        }
        if (room1) {
            room1 = room1.filter(ids => ids.id !== id);
            roomData[roomID] = room1;
        }

        io.sockets.in(roomID).emit('changeControl', { data: roomData[roomID] });
        io.sockets.in(id).emit('removed');
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        let room1 = roomData[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
        if (room1) {
            room = room1.filter(id => id.id !== socket.id);
            roomData[roomID] = room;
        }
        socket.leave(roomID);

        io.sockets.in(roomID).emit('changeControl', { data: roomData[roomID] })

    });

});

server.listen(port, () => console.log('server is running on port ' + port));


