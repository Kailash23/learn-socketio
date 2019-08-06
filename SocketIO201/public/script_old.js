const socket = io("http://localhost:9000"); //the / namespace or endpoint
const socket1 = io("http://localhost:9000/admin");

socket.on("connect", () => {
  console.log(socket.id);
});

socket1.on("connect", () => {
  console.log(socket1.id);
});

socket1.on("welcome", msg => {
  console.log(msg);
});

// MCzMtqTGqmDo5FSSAAAB
// script.js:9 /admin#MCzMtqTGqmDo5FSSAAAB

socket.on("messageFromServer", dataFromServer => {
  console.log(dataFromServer);
  socket.emit("messageToServer", { data: "Data from the client!" });
});

document.querySelector("#message-form").addEventListener("submit", event => {
  event.preventDefault();
  const newMessage = document.querySelector("#user-message").value;
  socket.emit("newMessageToServer", { text: newMessage });
});

socket.on("messageToClients", msg => {
  console.log(msg);
  document.querySelector("#messages").innerHTML += `<li>${msg.text}</li>`;
});
