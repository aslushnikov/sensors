// require sse
var fs = require("fs")
  , csv = require("fast-csv")
  , express = require('express')
  , cors = require("cors")
  , sse = require('connect-sse')()
var app = express();
var expressWs = require('express-ws')(app); //app = express app

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
app.ws('/ws', function(ws, req) {
    console.log("Sensor connected");
    ws.on('message', function(msg) {
        var obj = JSON.parse(msg);
        pushDataToClients(obj);
    });
});

app.use(express.static(__dirname + '/public'));

app.listen(4000);
console.log("Server is running at http://localhost:4000");

function readStream(client) {
    var stream = fs.createReadStream("assets/dump.csv");
    csv
        .fromStream(stream, {headers : true})
        .on("data", function(data){
            client.json(data);
        })
        .on("end", function(){
            console.log("done");
        });
}

function pushDataToClients(data) {
    for (var client of clients)
        client.json(data);
}

