function joinNs(endpoint) {
  if(nsSocket) {
    // check to see if nsSocket is actually a socket
    nsSocket.close(); // This will disconnect the socket manually
    // remove the eventListerner before it's added again
    document.querySelector('#user-input').removeEventListener('submit', formSubmission);
  }
  // ? (9): Override nsSocket which is global var from scripts.js
  // ?      Initiated a new client connection to below url
  // ?      This will fire (12) ie listeners for end point connection (slack.js)
  nsSocket = io(`http://localhost:9000${endpoint}`);

  // ? (16): With this socket connection to the new namespace
  // ?       We listen to nsRoomLoad
  // ?       Emitted at slack.js (15)
  nsSocket.on("nsRoomLoad", nsRooms => {
    /**
     * @nsRooms : Array of room object
     */
    let roomList = document.querySelector(".room-list");
    roomList.innerHTML = "";
    nsRooms.forEach(room => {
      let glyph;
      if (room.privateRoom) {
        glyph = "lock";
      } else {
        glyph = "globe";
      }
      const element = `<li class="room"><span class="glyphicon glyphicon-${glyph}">${room.roomTitle}</span> </li>`;
      roomList.innerHTML += element;
    });

    // Add click listener to each room
    let roomNodes = document.getElementsByClassName("room");
    Array.from(roomNodes).forEach(element => {
      element.addEventListener("click", e => {
        // ? (17-1): when you will click on room this will happen
        joinRoom(e.target.innerText)
      });
    });

    // Add room automatically... first time here
    // ? (17-2): This is for handling initial load.
    // ?         Grab the top room and pass it to joinNs
    const topRoom = document.querySelector(".room");
    const topRoomName = topRoom.innerText;
    joinRoom(topRoomName);
  });

  // ? (32): We listen to message to clients
  // ?       Emitted at slack.js (31)
  // ? Whenever user writes a message that message is send to the server
  // ? and then message body is prepared there and then that body is send to 
  // ? the client within the same namespace as well as in same room.
  // ? This will render the same message

  nsSocket.on("messageToClients", msg => {
    // console.log(msg.text);
    const newMsg = buildHTML(msg);
    document.querySelector("#messages").innerHTML += newMsg;
  });

  // ? (10-1): We add submit listener (input box at the bottom)
  document.querySelector(".message-form").addEventListener("submit", formSubmission);
}

// ? (10-1): This method will call on form submission
function formSubmission(event){
  event.preventDefault();
  const newMessage = document.querySelector("#user-message").value;
  nsSocket.emit("newMessageToServer", { text: newMessage });
}

function buildHTML(msg) {
  const convertedDate = new Date(msg.time).toLocaleString();
  const newHtml = 
  `<li>
    <div class="user-image">
      <img src="${msg.avatar}" />
    </div>
    <div class="user-message">
    <div class="user-name-time">${msg.username}<span>${convertedDate}</span></div>
      <div class="message-text">${msg.text}</div>
    </div> 
  </li>`;
  
  return newHtml;
}
