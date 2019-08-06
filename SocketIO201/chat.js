const express = require("express");
const app = express();
const socketio = require("socket.io");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

io.on("connection", socket => {
  socket.emit("messageFromServer", { data: "Welcome to the socket io server" });
  socket.on("messageToServer", dataFromClient => {
    console.log(dataFromClient);
  });
  socket.join("level1");
  io.of('/')
    .to("level1")
    .emit("joined", `${socket.id} says I have joined the level 1 room!`);
});

io.of("/admin").on("connection", socket => {
  console.log("someone connected to admin namespace!");
  io.of("/admin").emit("welcome", "Welcome to the admin channel!");
});

// aNamespace.to(aRoom) : comes to everybody including the socket whose sending
// socket.to(aRoom) : comes to everybody excepts whose sending 
