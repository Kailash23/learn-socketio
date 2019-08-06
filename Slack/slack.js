const express = require("express");
const app = express();
const socketio = require("socket.io");

let namespaces = require("./data/namespaces");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

io.on("connection", socket => {
  // Build an array to send back with the img and endpoint for each NS
  let nsData = namespaces.map(ns => {
    return {
      img: ns.img,
      endpoint: ns.endpoint
    };
  });

  // Send the nsData back to the client, we need to use socket, NOT io, because we want it to
  // go to just this client.
  socket.emit("nsList", nsData);
  // io.emit("nsList", nsData);
  // This will send to everybody connected to main namespace.
  // Which means as soon as somebody joins the server everybody will get updated namespace list.
});

namespaces.forEach(namespace => {
  io.of(namespace.endpoint).on("connection", nsSocket => {
    console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);
    // A socket has connected to one of our chatgroup namespace.
    // send that ns group info back
    nsSocket.emit("nsRoomLoad", namespaces[0].rooms);
  });
});

// aNamespace.to(aRoom) : comes to everybody including the socket whose sending
// socket.to(aRoom) : comes to everybody excepts whose sending
