exports = module.exports = function(io, _, usersBySocket, socketIdsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
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
    });
    
    socket.on('isTyping', function (response) {
        socket.broadcast.emit('isTyping', response);
    });
    
  });
};