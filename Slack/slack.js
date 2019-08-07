const express = require("express");
const app = express();
const socketio = require("socket.io");

// Namespace data
// ? (1): This is where we organise our namespace and rooms programmtically
// ?      Array of namespaces they have rooms objects inside their romm property
let namespaces = require("./data/namespaces");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000);
// ? (2): io is the socket server (server object in doc)
const io = socketio(expressServer);

// ? io.on = io.of('/').on = io.sockets.on
// ? io.emit = io.of('/').emit = io.sockets.emit
/**
 * On connection of the main namespace.
 * This send out the list of the namespaces
 */
io.on("connection", socket => {
  // ? (3): Build an array to send back with the img and endpoint for each NS
  console.log(socket.handshake)
  let nsData = namespaces.map(ns => {
    return {
      img: ns.img,
      endpoint: ns.endpoint
    };
  });

  // ? (4): Send the nsData back to the client, we need to use socket, NOT io, 
  // ?    because we want it to go to JUST THIS client.
  socket.emit("nsList", nsData);
  // io.emit("nsList", nsData);
  // This will send to everybody connected to main namespace.
  // Which means as soon as somebody joins the server everybody will get updated namespace list.
});

/**
 * ? (11): Loopin through the namespaces for adding event listener to the endpoint
 * ?       just to have a way to use them.
 */
namespaces.forEach(namespace => {
  /**
   * ? (12): Listen for conenction on endpoint (namespace) 
   */
  io.of(namespace.endpoint).on("connection", nsSocket => {
    /**
     * @nsSocket : The connection just made
     * ? (13) : Just like above socket at (3), its using the same underline connection 
     * ?      its the same thing
     */
    // console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);
    /**
     * ? (14): nsSocket.handshake : contains all the information about the transcation 
     * ?       and communication. check scripts.js (5) 
     */
    const username = nsSocket.handshake.query.username;
    // A socket has connected to one of our chatgroup namespace.
    // send that ns group info back
    /**
     * ? (15): emitted nsRoomLoad and sended array of rooms
     * ?       namespace has the room property which is array
     */
    nsSocket.emit("nsRoomLoad", namespace.rooms);
    /**
     * ? (19): Every time someone joins this event will happen.
     * ?       Setup listener for join room
     * ?       Will call in response to the emition of event at joinRoom.js (18)  
     */
    nsSocket.on("joinRoom", (roomToJoin , numberOfUsersCallback ) => {
      // Deal with history.. once we have it
      // We joined the socket to the room.
      // ? (20): We need to know what is the current room so that we leave it and join other
      // ?       for this we fetched the rooms property of this particular socket (nsScocket)
      // ?       Every socket automatically joins it own room and the key for that room is socket id
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      // ? (21) : we have to update the count of the client connected to that room since 
      // ?        we are leaving that room and joining other 
      updateUsersInRoom(namespace, roomToLeave)
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
      // We have full detail of the room that is joined by filtering from the namespace
      // ? (24): Emitting history catchup from the room to joined so that we can show previous chat 
      // ?       happened in that room.
      nsSocket.emit("historyCatchUp", nsRoom.history);
      // ? (26): Update the number of clients connected in the room that is recently joined 
      updateUsersInRoom(namespace, roomToJoin);
    });
    /**
     * ? (27): Listen for new message to serve
     * ?       This is called when we press submit button 
     * ?       Emitted on joinNs (10-2) 
     */
    nsSocket.on("newMessageToServer", msg => {
      // console.log(msg);
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
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
      // ? (28): We grab the current room name that we are in
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      // reason for using io.of because if we use nsSocket message will not come to the socket
      // who send it.

      // We need to find the room object for this room.
      // ? (29): We get the object from the array by comaparing name
      const nsRoom = namespace.rooms.find(room => {
        // Looked into this namespaces room list
        return room.roomTitle === roomTitle;
      });
      // Here nsRoom is the room object that we made matches in namespace room array.
      // ? (30): We add the message to the history array present in that object
      // ?       So that when someone other will join he will get previous messages
      // ?       that are stored in the history property of the room object.
      nsRoom.addMessage(fullMsg);
      // ? (31): Then we send the message back to client that are in that particular 
      // ?       end point (namespace.endpoint) and room name ie (roomtitle)
      // ?       emit -  messageToClient  
      io.of(namespace.endpoint)
        .to(roomTitle)
        .emit("messageToClients", fullMsg);
    });
  });
});
/**
 * 
 * @param {*} namespace : namespace object present in the namespaces array
 * @param {*} roomToUpdate : Room name to which we want to update count
 */
function updateUsersInRoom(namespace, roomToUpdate) {
  // Send back the number of users in this room to all sockets connected to this room
  // So that all the window will update on new user joining.
  // we are sending no of clients connected update to whole room here
  // after sending history update.
  // ? (22): Grabing this room (roomToUpdate) in namespace.endpoint and callback will present
  // ?       all of the clients as one of the parameter 
  io.of(namespace.endpoint)
    .in(roomToUpdate)
    .clients((error, clients) => {
      console.log(`There are ${clients.length} in this room`);
      // ? (23): And we emit to the same room with in the same namespace the updateMember event.
      // ?       Which means how many socket is connected to this room in this namespace
      io.of(namespace.endpoint)
        .in(roomToUpdate)
        .emit("updateMembers", clients.length);
    });
}

// aNamespace.to(aRoom) : comes to everybody including the socket whose sending
// socket.to(aRoom) : comes to everybody excepts whose sending
// namespace.to(room)  and namespace.in(room) is the same thing