// Join the main namespace
// Client connect her to the main namespace
const socket = io("http://localhost:9000"); 

let nsSocket = "";
// Listen for nsList, which is a list of all the namespaces
socket.on("nsList", nsData => {
  // Update the DOM
  let namespacesDiv = document.querySelector(".namespaces");
  namespacesDiv.innerHTML = "";
  nsData.forEach(ns => {
    const element = `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}"/></div>`;
    namespacesDiv.innerHTML += element;
  });
  // Add the click listeners for each namespaces
  Array.from(document.getElementsByClassName("namespace")).forEach(element => {
    element.addEventListener("click", () => {
      const nsEndPoint = element.getAttribute("ns");
      // console.log(`${nsEndPoint} I should go to now`);
      joinNs(nsEndPoint)
    });
  });
  joinNs('/wiki')
});

