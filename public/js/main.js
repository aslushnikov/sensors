var evtSource = new EventSource("./events", { withCredentials: false });

evtSource.onmessage = function(e) {
    var newElement = document.createElement("div");
    newElement.textContent = "message: " + e.data;
    document.body.appendChild(newElement);
}
