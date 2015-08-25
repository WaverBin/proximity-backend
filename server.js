var cc   = require('config-multipaas');
var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var _    = require('underscore');

var config = cc()

var usersBySocket = {};     // Used to get users with socket Ids
var socketIdsByUserId = {}; // Used to get sockets with user Ids

var conversations = {};     // Used to store conversations in RAM, eventually, 
                            // this should be stored in MongoDB and loaded on demand

app.get('/', function(req, res){
    res.sendFile('index.html', { root: __dirname });
});

// WARNING : If the user quits page on mobile and gets back on, 
// it reconnects to the server, but doesnt register back with 
// 'login' so the user is not in the usersBySocket object.

io.on('connection', function(socket){
    console.log('NEW CONNECTION => Socket ID : ' + socket.id);
    
    // TODO : still need some code to work as intended (handle rooms with conversations)
    // I think this will be used for group discussions, but maybe not for 1 to 1 conversations ?
    // We have to talk about this :P 
    socket.on('join:conversation', function (data) {
        console.log('user ' + data.from + ' wants to join conversation ' + data.conversationId);
        socket.join(data.conversationId);
        slog('user ' + data.from + ' joined conversation ' + data.conversationId);
    });
    
    socket.on('get:conversationId', function(conversation){
        console.log('New conversation created');
        conversation.id = guid();
        conversations[conversation.id] = conversation;
        // TODO : filter user ids instead of using the default 0 array index
        io.to(socket.id).emit('set:conversationId', { id: conversation.id, userId: conversation.users[0].id });
    });
    
    socket.on('get:conversations', function(){
        if (usersBySocket[socket.id] != null){
            // TODO : Return only conversations where the user is part of.
            // Maybe use rooms for this ? We have to make sure MongoDB can store the rooms 
            // as conversations and have them restorable to their original state after load
            io.to(socket.id).emit('get:conversations', conversations);
        }
    });
    
    socket.on('login', function(user){
        console.log('=> LOG IN  => ' + user.name);
        
        // Used to keep a record of the user and its socket ID
        usersBySocket[socket.id] = user;
        socketIdsByUserId[user.id] = socket.id;
        
        // TODO : Will have to filter out depending on GPS value
        socket.broadcast.emit('add:user', user);
        
        // Send the connected users to the actual user
        io.to(socket.id).emit('update:users', _.reject(_.map(usersBySocket, function(u){ return u; }), function(u){ return u.id == user.id }));
    });
    
    // TODO : Implement in client
    socket.on('update:user', function(user){
        console.log(user.name + ' updated');
        usersBySocket[socket.id] = user;
        socketIdsByUserId[user.id] = socket.id;
        // TODO : Will have to filter out depending on GPS value
        // -> if out of reach, send remove, else send update
        // TODO : Implement update:user in client
        socket.broadcast.emit('user:user', user);
    });
    
    // broadcast a user's message to other users
    socket.on('send:message', function (message) {
        if (conversations[message.conversationId] != null){
            conversations[message.conversationId].messages.push(message);
            
            var conversation = conversations[message.conversationId];
            var senderId = usersBySocket[socket.id].id;
            
            if (conversation.messages.length == 1){
                _.each(_.reject(conversation.users, function(u){ 
                        return u.id == senderId; 
                    }), function(user) { 
                        io.to(socketIdsByUserId[user.id]).emit('create:conversation', conversation);
                });
            } else {
                _.each(_.reject(conversation.users, function(u){ 
                        return u.id == senderId; 
                    }), function(user) { 
                        socket.broadcast.emit('send:message', message);
                });
            }
            
            // Send message to sender
            socket.emit('send:message:isSuccess', true);
        }
    })
    
    socket.on('disconnect', function() {
        if (usersBySocket[socket.id] != null){
            console.log('=> LOG OUT => ' + usersBySocket[socket.id].name);
            socket.broadcast.emit('remove:user', usersBySocket[socket.id].id);
            delete socketIdsByUserId[usersBySocket[socket.id].id];
            delete usersBySocket[socket.id];
        } else {
            // TODO : Make sure this is never logged ! :P
            console.log('ERROR : User logged out but wasnt registered');
        }
    }) ;

    socket.on('isTyping', function (response) {
        socket.broadcast.emit('isTyping', response);
    });

    function slog(msg) {
        console.log(msg);
        socket.emit('log', msg);
    }
});

http.listen(config.get('PORT'), config.get('IP'), function () {
    console.log( "Listening on " + config.get('IP') + ", port " + config.get('PORT') )
});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}