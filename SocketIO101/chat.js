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
});
