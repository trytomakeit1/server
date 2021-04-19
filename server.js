var express = require("express");

var api = require("./api/api");
var bodyParser = require("body-parser");
var cors = require("cors");
var http = require("http");
//to add https
var https = require("https");

var fs = require("fs");

var app = express();

app.get("/", function (req, res) {
  res.send("Hello world");
});

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//* using cors module, can use same origin (localhost) requests.
app.use("/api", cors(), api);

app.use(express.static("public"));
/* var key = fs.readFileSync('./bin/2179541_localhost.key');
var cert = fs.readFileSync('./bin/2179541_localhost.cert');

var options = {
    key: key,
    cert: cert
}; */

//var server = http.createServer(app);
app.listen(8080, function () {
  console.log("listening to port 8080");
});

//https.createServer(options, app).listen(4433, function(){console.log("listening to port 4433")});
