
var express = require('express');

var api = require('./api/api');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

app.get("/", function(req, res){
    res.send("Hello world");
});

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//* using cors module, can use same origin (localhost) requests.
app.use("/api",cors(), api);

app.listen(8080, function(){console.log("listening to port 8080");});