// require sse
var fs = require("fs")
  , express = require('express')
  , cors = require("cors")
  , sse = require('connect-sse')()
  , http = require("http")
  , WebSocketServer = require("ws").Server

var app = express();
var server = http.createServer(app);

app.use(cors());

var clients = new Set();
app.get('/events', sse, function(req, res) {
    console.log("Client connected.");
    clients.add(res);
    res.json(wss.clients.length, "deviceCount");
    res.on("close", function() {
        console.log("Client gone.");
        clients.delete(res);
    });
});

var wss = new WebSocketServer({server: server});

wss.on("connection", function(ws){
    console.log("Device connected.");
    pushDataToClients(wss.clients.length, "deviceCount");
    ws.on('message', function(msg) {
        var obj = JSON.parse(msg);
        pushDataToClients(obj);
    });
    ws.on('error', function(error) {
        pushDataToClients(wss.clients.length, "deviceCount");
        console.log("Device gone.");
    });
    ws.on('close', function() {
        pushDataToClients(wss.clients.length, "deviceCount");
        console.log("Device gone.");
    });
});

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 4000;
server.listen(port);
console.log("Server is running at http://localhost:%d", port);

function pushDataToClients(data, type) {
    for (var client of clients)
        client.json(data, type);
}

function sendConnectedDevices() {
    var amount = wss.clients.length;
    for (var client of clients)
        client.json(amount, "deviceCount");
}

