const username = prompt("What is your username?")
// Client connect here to the main namespace
// ? (5): We used option to send over the username that the user provides
// ?    Join the main namespace
const socket = io("http://localhost:9000", {
  query: {
    username: username
  }
}); 
// ? (6) : setup initial global called nsSocket
let nsSocket = "";
// Listen for nsList, which is a list of all the namespaces
// ? (7): Main namespace listen to the nsList event
socket.on("nsList", nsData => {
  // Update the DOM
  let namespacesDiv = document.querySelector(".namespaces");
  namespacesDiv.innerHTML = "";
  nsData.forEach(ns => {
    const element = `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}"/></div>`;
    namespacesDiv.innerHTML += element;
  });
  // Add the click listeners (event listener) for each namespaces
  // HTMlCollection or node list to array  
  Array.from(document.getElementsByClassName("namespace")).forEach(element => {
    element.addEventListener("click", () => {
      // ? (8): grab ns attribute and join and pass it to joinNs
      const nsEndPoint = element.getAttribute("ns");
      joinNs(nsEndPoint)
    });
  });
  // Defautlt
  joinNs('/wiki')
});

