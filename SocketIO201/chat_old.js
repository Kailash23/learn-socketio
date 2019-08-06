const express = require("express");
const app = express();
const socketio = require("socket.io");

// express middleware to serve files in public
app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000); // express server running in 9000 port
const io = socketio(expressServer); // Our socket server is listening to http server
// Means any socket connects to the socket io server then this callback will run
io.on("connection", socket => {
  // specific socket.io keyword
  socket.emit("messageFromServer", { data: "Welcome to the socket io server" });
  socket.on("messageToServer", dataFromClient => {
    console.log(dataFromClient);
  });
  socket.on("newMessageToServer", msg => {
    console.log(msg);
    io.emit("messageToClients", { text: msg.text });
  });

  // The server can still communicate across namespaces
  // But on the clientInformation, the socket needs to be in that 
  // namespaces in order to get the EventSource.
  
  // setTimeout used to fix asynchronous problem.
  setTimeout(() => {
    io.of('/admin').emit('welcome', "welcome to the admin channel, from the main channel!")
  }, 2000)

});

io.of("/admin").on("connection", socket => {
  console.log("someone connected to admin namespace!");
  io.of("/admin").emit("welcome", "Welcome to the admin channel!");
});

// javascript is asynchronous


// io.of(aNamespace).to(roomName).emit()
// io.of('/admin').emit()