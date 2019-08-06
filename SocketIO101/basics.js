// we need http beacuse we don't have express
const http = require("http");
const socketio = require("socket.io");

// we make a http server with node!
const server = http.createServer((req, res) => {
  res.end("I am connected!");
});

// our socketio server is piggy backing on a http server
const io = socketio(server);

io.on("connection", (socket, req) => {
  //ws.send beacuse socket.emit
  socket.emit("welcome", "Welcome to the websocket server!!");
  // no change here
  socket.on("message", msg => {
    console.log(msg);
  });
});

server.listen(8000);
