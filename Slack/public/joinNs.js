function joinNs(endpoint) {
  const nsSocket = io(`http://localhost:9000${endpoint}`);

  nsSocket.on("nsRoomLoad", nsRooms => {
    // console.log(nsRooms);
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
        console.log("Someone clicked on", e.target.innerText);
      });
    });
    
    // Add room automatically... first time here
    const topRoom = document.querySelector('.room');
    const topRoomName = topRoom.innerText;
    console.log(topRoomName)
  });

  nsSocket.on("messageToClients", msg => {
    document.querySelector("#messages").innerHTML += `<li>${msg.text}</li>`;
  });

  document.querySelector(".message-form").addEventListener("submit", event => {
    event.preventDefault();
    const newMessage = document.querySelector("#user-message").value;
    socket.emit("newMesssageToServer", { text: newMessage });
  });

}
