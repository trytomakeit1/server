var express = require("express");
var router = express.Router();
var dbCalls = require("../db/dbCalls");

router.get("/index", function(req, res){
    res.send("in api");

});

router.post("/login", function(req,res){

    //** input: username (email), pass */
    //** output: token */

    // 1) check with DB if the user and pass exist in DB,
    // 2) then, sign a token and send it back
    // res.setHeader("Access-Control-Allow-Origin", "*");

    var validityCheck = true;
    if(!req.body.email || req.body.email === "") {
        console.log("email missing");
        validityCheck = false;
    }
    if(!req.body.password || req.body.password === "") {
        console.log("password missing");
        validityCheck = false;
    }
    if (validityCheck === true) {
        dbCalls.verifyUser({username:req.body.email, password:req.body.password}, 
            function(err, dbCallsRes) {

            var result = {
                error: err,
                result: dbCallsRes
            };
            res.send(result);
        });
    } else {
        var result = {
            error: "parameters missing",
            result: null
        };

        res.send(result);
    }

});

router.post("/signup", function (req, res) {
    //** input: name, email, password */
    //** output: token */

    // 1) check DB if a user with this username exists.
    // 2) if no user in DB, then insert the user.(//hash the password)
    // 3) then create a token

    var validityCheck = true;
    if(!req.body.name || req.body.name === "") {
        console.log("name missing");
        validityCheck = false;
    }
    if(!req.body.email || req.body.email === "") {
        console.log("email missing");
        validityCheck = false;
    }
    if(!req.body.password || req.body.password === "") {
        console.log("password missing");
        validityCheck = false;
    }
    if (validityCheck === true) {
        dbCalls.addUser({name: req.body.name, 
            username: req.body.email,
            password: req.body.password}, function(err, dbCallsRes) {

                var result = {
                    error: err,
                    result: dbCallsRes
                };

                res.send(result);
        });
    } else {
        var result = {
            error: "parameters missing",
            result: null
        };

        res.send(result);

   }



});



router.post('/verifyToken', function(req, res){

    if(req.body.token && req.body.token !== ''){
        dbCalls.verifyToken(req.body.token, function(err, dbCallsRes){

            var result = {
                error: err,
                result: dbCallsRes
            }
            res.send(result);
        });
        
    } else {
        var result = {
            error: "Token is empty or undefined",
            result: null
        };

        res.send(result);
    }

});


router.post('/rentMovie', function(req, res){
    var request = req.body;

    var validityCheck = true;
    if(!request.username || request.username === '') {
        console.log("username is missing");
        validityCheck = false;
    }if(!request.movieId || request.movieId === '') {
        console.log("movie ID is missing");
        validityCheck = false;
    }
    if(validityCheck === true) {

        dbCalls.rentMovie({username: request.username, movieId: request.movieId}, function(err, dbCallsRes){

            var result = {
                error: err,
                result: dbCallsRes
            };

            res.send(result);
        });

    } else {
        var result = {
            error: "parameters missing",
            result: null
        };

        res.send(result);
   }
});



router.get('/rentedMovies/:username', function(req, res){

    if(!req.params.username || req.params.username === '') {

        var result = {
            error: "username missing",
            result: null
        };
        res.send(result);

    } else{

        dbCalls.moviesRented({username:req.params.username}, function(err, dbCallsRes){

            var result = {
                error: err,
                result: dbCallsRes
            };
            res.send(result);

        });
    }

});



router.post('/addMovie', function(req, res){

    var params = req.body;
    if( !params.title || params.title === '') {
        console.log("title of movie missing");
        
        var result = {
            error: "params missing",
            result: null
        }
        res.send(result);
    } else {
        var movie = {
            title: params.title,
            poster: params.poster || null,
            year: params.year || null,
            country: params.country || null,
            imdb_rating: params.imdb_rating || null,
            genres: params.genres || null,
            images: params.images || null,
        };
        console.log(movie);

        // call db to sava movie
        dbCalls.insertMovie(movie, function(err, dbCallsRes){
            var result = {
                error: err,
                result: dbCallsRes
            }
            res.send(result);
        });

    }
});



module.exports = router;