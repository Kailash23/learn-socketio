const express = require("express");
const app = express();
const socketio = require("socket.io");

// Namespace data
let namespaces = require("./data/namespaces");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

/**
 * On connection of the main namespace.
 * This send out the list of the namespaces
 */
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

/**
 * Loopin through the namespaces for adding event listener to the endpoint 
 * just to have a way to use them. 
 */
namespaces.forEach(namespace => {
  io.of(namespace.endpoint).on("connection", nsSocket => {
    console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);
    // A socket has connected to one of our chatgroup namespace.
    // send that ns group info back
    nsSocket.emit("nsRoomLoad", namespace.rooms);
    /**
     * Every time someone joins this event will happen.
     */
    nsSocket.on("joinRoom", (roomToJoin /*, numberOfUsersCallback */) => {
      // Deal with history.. once we have it
      // We joined the socket to the room.
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomTitle);
      nsSocket.join(roomToJoin);
      // we send the no of clients connected update to that particular socket.
      // Not needed since we are sending to all the rooms.
      // io.of("/wiki")
      //   .in(roomToJoin)
      //   .clients((error, clients) => {
      //     numberOfUsersCallback(clients.length); // callback acknowledgement (promise time)
      //   });

      const nsRoom = namespace.rooms.find(room => {
        // Looked into this namespaces room list
        return room.roomTitle === roomToJoin;
      });
      // We have full detail of the room that is joined by filtering
      // Sending history update.
      nsSocket.emit("historyCatchUp", nsRoom.history);
      // Send back the number of users in this room to all sockets connected to this room
      // So that all the window will update on new user joining.
      // we are sending no of clients connected update to whole room here
      // after sending history update.
      io.of(namespace.endpoint)
        .in(roomToJoin)
        .clients((error, clients) => {
          console.log(`There are ${clients.length} in this room`);
          io.of(namespace.endpoint)
            .in(roomToJoin)
            .emit("updateMembers", clients.length);
        });
    });

    nsSocket.on("newMessageToServer", msg => {
      // console.log(msg);
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: "rbunch",
        avatar: "https://via.placeholder.com/30"
      };
      // Send this message to all the sockets that are in the room, that this socket is in.
      // How can we find out what room this socket is in?
      // socket.rooms : returns a hash of strings identifying the rooms this client is in
      // indexed by room name
      // Every sockets join its own room immediately opon connection to a name space
      // Second will always be the next room.
      // Eg: This is an object with key value pair
      //       { '/wiki#3akywZlnnUuLzVzMAAAf': '/wiki#3akywZlnnUuLzVzMAAAf',
      //         'New Articles': 'New Articles' }
      // the user will be in the 2nd room in the object list
      // this is because the socket will ALWAYS joins its own room on connection.

      // This will give the array of the keys
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      // reason for using io.of because if we use nsSocket message will not come to the socket
      // who send it.

      // We need to find the room object for this room.
      /**
       * Filter returns array and find returns object.
       */
      console.log(nsSocket.rooms)
      const nsRoom = namespace.rooms.find(room => {
        // Looked into this namespaces room list
        return room.roomTitle === roomTitle;
      });
      // Here nsRoom is the room object that we made matches in namespace room array.
      nsRoom.addMessage(fullMsg);
      io.of(namespace.endpoint)
        .to(roomTitle)
        .emit("messageToClients", fullMsg);
    });
  });
});

// aNamespace.to(aRoom) : comes to everybody including the socket whose sending
// socket.to(aRoom) : comes to everybody excepts whose sending
