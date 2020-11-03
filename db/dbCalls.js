var mongodb = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

var jwt = require("jsonwebtoken");
var url =  "mongodb://localhost:27017";
var dbName = "gdb";
var userCollection = "users";
var rentCollection = "rent";
var movieCollection = "movies";

var secretCode = "newserver1*";
var expiresIn = 3600;

class dbCalls {

    /*
    params: username, password
    */
    static verifyUser(params, cb){

        mongodb.connect(url, function(err, mongoClient) {

            if(err) {
                
                console.log("Error-verifyUser: Problem mongodb connect", err);
                cb("There is a problem connecting the database. Try again later.");
            } else{
                var db = mongoClient.db(dbName);

                console.log("params before findone", params);
                var payload = {username:params.username, password:params.password};
                db.collection(userCollection).findOne( payload, function (err, res) {
                    if (err) {
                        console.error("Error occured in finding user");
                        cb(err);

                    } else if (res) {
                        // the user has been found

                        // create Token (jwt)
                        jwt.sign(payload, secretCode, function (err, jwtRes) {
                            if (err) {
                                cb("There was an error in jwt sign", err);
                                console.log("jwtSign Error", err);
                            } else{
                                cb(null, {
                                    token: jwtRes
                                });
                            }
                        });
                    } else {
                        // res is null if findOne doesn't return data
                        cb("The user doesn't exist in our database.");
                    }
                }); //findOne
            }
        });
        
    }

    /*
    params: name, email, password
    */
    static addUser(params, cb){

        mongodb.connect(url, function(err, mongoClient) {
            if(err) {
                console.log("Error-addUser: Problem mongodb connect", err);
                cb("There is a problem connecting the database. Try again later.");
            } else{

                var db = mongoClient.db(dbName);

                //check if this username exists
                db.collection(userCollection).findOne( {username:params.username}, function(err, res) {
                    if (err) {
                        console.error("Error occured in finding user", err);
                        cb("A problem occured. contact the administrator or try again later.");
                    } else if (!res || res == null) {

                        //call to insert data
                        var payload = {name: params.name, username:params.username, password:params.password};
                        db.collection(userCollection).insert(payload, function (err, insertRes) {

                            if (err) {
                                console.error("Error occured in inserting user", err);
                                cb("A problem occured. contact the administrator or try again later.");
                            } else{

                                console.log("user inserted successfully", insertRes);

                                // create Token (jwt)
                                jwt.sign({username:params.username, password:params.password},
                                     secretCode, {expiresIn: expiresIn}, function(err, jwtRes) {

                                        if(!err){
                                        console.log(jwtRes);
                                        cb(null, {
                                            token: jwtRes
                                        });
                                    } else{
                                        console.log("in jwt sign - There was a problem signing the token.", err);
                                        cb("A problem occured. contact the administrator or try again later.");
                                    }

                                });
                            }
                        });

                    } else {
                        //send error cause the user already exists
                        //res is NOT null if findOne returns data
                        cb("The user already exists");
                    }

                });

            }
        });

    }




    static verifyToken(token, cb) {

        jwt.verify(token, secretCode, function(err, jwtRes){
            if(err){
                console.log("Error - verifyToken", err);
                cb("An error occured in verifying the token");
            }
            if(jwtRes){
                console.log("token validity result", jwtRes);
                cb(null, jwtRes);
            }

        });
    }

    
    static rentMovie(params, cb){

        mongodb.connect(url, function(err, mongoClient){

            if(err){
                console.log("Error-rentMovie: Problem mongodb connect", err);
                cb("There is a problem connecting the database. Try again later.");

            } else{

                var db = mongoClient.db(dbName);
                db.collection(userCollection)
                .findOne({username:params.username}, function(err, res){

                    if (err) {
                        console.error("Error occured in finding user", err);
                        cb("A problem occured. contact the administrator or try again later.");
                    
                    } else if(!res || res === null){
                        cb("The user doesn't exist");
                    } else {
                        console.log(res);

                        // the user exists, now add it to the movie collection
                        db.collection(rentCollection).update({userId: new ObjectId(res._id)},
                            {$push:{movies:{movieId: params.movieId, rentDate:new Date()}}}, {upsert: true}, 
                            function(err, res){

                                if (err) {
                                    console.error("Error occured in adding movie", err);
                                    cb("A problem occured. contact the administrator or try again later.");

                                } else {
                                    console.log("Movie added successfully" + res);
                                    cb(null, "Successfully rented the movie");
                                }
                            });
                    }
                });
            }

        });
    }



    static moviesRented(params, cb){

        console.log("params in movieRented dbcall", params);
        mongodb.connect(url, function(err, mongoClient){

            if(err){
                console.log("Error-moviesRented: Problem mongodb connect", err);
                cb("There is a problem connecting the database. Try again later.");

            } else{

                var db = mongoClient.db(dbName);

                // get only movies rented
                db.collection(userCollection).aggregate([
                    {$lookup:{from: rentCollection, localField: "_id", foreignField: "userId", as: "moviesRented"}},
                    {$match:{username: params.username}},
                    {$project: {_id: 0, moviesRented: 1} }])
                    .next(function(err, res){
                    
                        if (err) {
                            console.error("Error occured in retrieving movies", err);
                            cb("A problem occured. contact the administrator or try again later.");

                        } else {
                            console.log("Movies retrieved successfully", res);
                            cb(null, res.moviesRented[0].movies);
                        }

                });
              
            }
        });

    }



    static insertMovie(params, cb){

        mongodb.connect(url, function(err, mongoClient){

            if(err){
                console.log("Error-insertMovie: Problem mongodb connect", err);
                cb("There is a problem connecting the database. Try again later.");
            } else{
                var db = mongoClient.db(dbName);
                db.collection(movieCollection).insertOne(params, function(err, res){

                   if(err){
                        console.error("Error occured in inserting movies", err);
                        cb("A problem occured. contact the administrator or try again later.");
                   }
                   else {
                        console.log("Movies inserted successfully" + res);
                        cb(null, res);
                   }
                });
            }

        });
        
    }
}

module.exports = dbCalls;
