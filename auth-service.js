var mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": { 
        type: String,
        unique: true
    } ,
    "password": String,
    "email": String,
    "loginHistory": [{ 
        dateTime: Date, 
        userAgent: String  
    }]    
  });

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://harsh7049:Harsh7049@senecaweb.oofkw1o.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function(userData){ 
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password");
                    }
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code === 11000) {
                                    reject("User Name already taken");
                                }
                                else {
                                    reject("There was an error creating the user: " + err);
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
};

module.exports.checkUser = function(userData){
    return new Promise(function(resolve, reject){
        User.find({ userName: userData.userName })
        .exec()
        .then((user)=>{
            if(userData.userName.length == 0){
                reject("Unable to find user: "  + user);
            }else{
                bcrypt.compare(userData.password, user[0].password)
                .then((res)=>{
                    if(res == true){
                    user[0].loginHistory.push({dataTime: (new Date()).toString(), userAgent: userData.userAgent});

                    User.updateOne({userName: users[0].userName},
                         {$set:{loginHistory: user[0].loginHistory}})
                         .exec()
                         .then(()=>{
                            resolve(user[0]);
                         })
                }else{
                    reject("There was an error verifying the user: " + err);
                }
                })
            }
        }).catch(()=>{
            reject("Unable to find user: " + userData.userName);
        })
    });
};
