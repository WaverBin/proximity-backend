exports = module.exports = function(io, _, usersBySocket, socketsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
    // Broadcast a user's message to other users
    socket.on('send:message', function (message) {
        if (conversations[message.conversationId] != null){
            conversations[message.conversationId].messages.push(message);
            socket.broadcast.to(message.conversationId).emit('send:message', message);
            message.status = 'sent';
            io.to(socket.id).emit('update:message', message);
            // TODO : Update conversation in MongoDB
        }
    });
    
    socket.on('update:message', function (message) {
        if (conversations[message.conversationId] != null){

            _.each(conversations[message.conversationId].messages, function(mess, index){
               if (message.id == mess.id){
                   conversations[message.conversationId].messages[index] = message;
                   socket.broadcast.to(message.conversationId).emit('update:message', message);
               }
            });
            
            // TODO : Update conversation in MongoDB
            // TODO : Update message's status to the sender
            // TODO : Implement in UI to update message on read
        }
    });
    
    socket.on('isTyping', function (response) {
        socket.broadcast.to(response.conversationId).emit('isTyping', response);
    });
    
  });
};