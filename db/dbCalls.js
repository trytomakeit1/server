var mongodb = require("mongodb").MongoClient;

var jwt = require("jsonwebtoken");
var url =  "mongodb://localhost:27017";
var dbName = "gdb";
var userCollection = "users";

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
                cb(jwtRes);
            }

        });
    }
}

module.exports = dbCalls;
