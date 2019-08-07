function joinRoom(roomName) {
  // Send this roomName to the server!
  // Not needed now
  nsSocket.emit("joinRoom", roomName, newNumOfMembers => {
    // (event ,data, callabck)
    // we have to update the room member total now that we have joined!
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${newNumOfMembers} <span class="glyphicon glyphicon-user"></span>`;
  });
  nsSocket.on("historyCatchUp", history => {
    // console.log('history', history)
    const messageUl = document.querySelector("#messages");
    messageUl.innerHTML = "";
    history.forEach(msg => {
      const newMsg = buildHTML(msg);
      const currentMessage = messageUl.innerHTML;
      messageUl.innerHTML = currentMessage + newMsg;
    });
    // We wants to show last element beacuse that will be the recent one
    messageUl.scrollTo(0, messageUl.scrollHeight);  
  });
  /**
   * This listener will update the number of clients connected.
   */
  nsSocket.on("updateMembers", numNumbers => {
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${numNumbers} <span class="glyphicon glyphicon-user"></span>`;

    document.querySelector(".curr-room-text").innerText = `${roomName}`;
  });

  let searchBox = document.querySelector('#search-box');
  searchBox.addEventListener('input',(e) => {
    let messages = Array.from(document.getElementsByClassName('message-text'));
    messages.forEach((msg) => {
      if(msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) {
        // the msg does not contain the user search term!
        msg.style.display = "none";
      } else{
        msg.style.display = "block";
      }
    })
  });
}
