var express = require("express");
var router = express.Router();
var dbCalls = require("../db/dbCalls");
var fs = require('fs');
var path = require('path');
var multer = require('multer');


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



var multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let title = req.body.title.replace(/\s/g, "_");
        const dir = path.dirname(__dirname) + '\\public\\' + file.fieldname + "\\" + title;

        if(!fs.existsSync(dir)){
            fs.mkdir(dir, function(err, directory){
                if(err) {
                    cb("Error creating the folder");
                } else {
                    cb(null, dir);
                }
            });
        } else {
            cb(null, dir);
        }

    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});



router.post('/addMovie', function(req, res){

    // upload files
    //Error for uploading more than one file for poster
    var upload = multer({
        storage: multerStorage
    }).fields([ {name: "images"}, {name: "poster", maxCount: 1}]);

    upload(req, res, function(err){

        console.log(req.body);
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            //fs.unlinkSync(path.dirname(__dirname) + '\\public\\images\\');

            console.log("Multer Error:", err);

            var result = {
                error: "A problem occured while uploading files",
                result: null
            };
            res.send(result);

        } else if (err) {
            // An unknown error occurred when uploading.
            //fs.unlinkSync(path.dirname(__dirname) + '\\public\\images\\');
            console.log("Error", err);

            var result = {
                error: "A problem occured while uploading files",
                result: null
            };
            res.send(result);
        } else{

            var params = req.body;
            var error = '';

            if( !params.title || params.title === '') {
                console.log("title of movie missing");
                error= "Movie title is missing";
            }
            if( !params.year || params.year === '') {
                console.log("year of movie missing");
                error= "Movie year is missing";
            }
            if( !params.country || params.country === '') {
                console.log("country of movie missing");
                error= "Movie country is missing";
            }
            if( !params.genres || params.genres.length <= 0) {
                console.log("genres of movie missing");
                error= "Movie genres is missing";

            }
            if(error.length > 0) {
                //fs.unlinkSync(path.dirname(__dirname) + '\\public\\images\\');

                var result = {
                    error: error,
                    result: null
                }
                res.send(result);

            } else {
                // call DB to save movie info
                dbCalls.insertMovie(params, function(err, dbCallsRes){
                    if(err) {
                        console.log("inserting movie error", err);
                        // delete files if can not save to DB.
                        //fs.unlinkSync(path.dirname(__dirname) + '\\public\\images\\');

                        var result = {
                            error: "Error Could not insert the movie",
                            result: null
                        };
                        res.send(result);
                    } else {
                        var result = {
                            error: null,
                            result: dbCallsRes
                        };
                        res.send(result);
                    }

                });
            }

        }

    });

});



router.get('/movies', function(req, res){

    dbCalls.moviesList(function(err, dbCallsRes){

        var result = {
            error: err,
            result: dbCallsRes
        }
        res.send(result);
    });
});



module.exports = router;