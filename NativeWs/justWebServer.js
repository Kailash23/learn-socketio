const http = require("http");
// 3rd party module ws
const websocket = require("ws");

const server = http.createServer((req, res) => {
  res.end("Hi");
});

const webSocketServer = new websocket.Server({ server }); //specify object that we need to connect to
/**
 * Emitted before the response header are written to the socket as part of handshake
 * edit and inspect header before they send out.
 * Any time websocket server receives a header that is receives a request
 */
webSocketServer.on("headers", (headers, req) => {
  // header event, callback
  console.log(headers);
});

webSocketServer.on("connection", (ws, req) => {
  ws.send("Hi, client. Welcome to the web socket server!");
  ws.on("message", msg => {
    console.log(msg);
  });
});

server.listen(8000);
// if http traffic shows up in port 8000 - create a server

// HTTP Header

// [ 'HTTP/1.1 101 Switching Protocols',   <Requesting to  switch from http to websocket>
//   'Upgrade: websocket',
//   'Connection: Upgrade',
//   'Sec-WebSocket-Accept: F4Y0cjpCwNPMgvOT4EviaR2lKIs=' ]
