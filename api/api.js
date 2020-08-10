var express = require("express");
var router = express.Router();


router.get("/index", function(req, res){

    res.send("in api");

});

router.post("/login", function(req,res){

    var body = req.body;
    console.log(body);
    // res.setHeader("Access-Control-Allow-Origin", "*");

    res.send("sending you response of login")

});

module.exports = router;