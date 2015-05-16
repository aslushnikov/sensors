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
    // res.json({here: "is", another: "event"});
    console.log("Client connected.");
    clients.add(res);
    // readStream(res);
    res.on("close", function() {
        console.log("Client gone.");
        clients.delete(res);
    });
});

var wss = new WebSocketServer({server: server});

wss.on("connection", function(ws){
    console.log("iPhone connected.");
    ws.on('message', function(msg) {
        var obj = JSON.parse(msg);
        pushDataToClients(obj);
    });
    ws.on('close', function() {
        console.log("iPhone gone.");
    });
});

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 4000;
server.listen(port);
console.log("Server is running at http://localhost:%d", port);

function pushDataToClients(data) {
    for (var client of clients)
        client.json(data);
}

