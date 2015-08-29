var cc   = require('config-multipaas');
var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var _    = require('underscore');


var config = cc();
var usersBySocket = {};     // Used to get users with socket Ids
var socketIdsByUserId = {}; // Used to get sockets with user Ids
var conversations = {};     // Used to store conversations in RAM, eventually, 
                            // this should be stored in MongoDB and loaded on demand
                            
var users = require('./users')(io, _, usersBySocket, socketIdsByUserId, conversations), 
    messages = require('./messages')(io, _, usersBySocket, socketIdsByUserId, conversations), 
    convers = require('./conversations')(io, _, usersBySocket, socketIdsByUserId, conversations);

// WARNING : If the user quits page on mobile and gets back on, 
// it reconnects to the server, but doesnt register back with 
// 'login' so the user is not in the usersBySocket object.

http.listen(config.get('PORT'), config.get('IP'), function () {
    console.log( "Listening on " + config.get('IP') + ", port " + config.get('PORT') )
});