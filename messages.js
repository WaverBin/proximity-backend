exports = module.exports = function(io, _, usersBySocket, socketsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
    // Broadcast a user's message to other users
    socket.on('send:message', function (message) {
        if (conversations[message.conversationId] != null){
            conversations[message.conversationId].messages.push(message);
            socket.broadcast.to(message.conversationId).emit('send:message', message);
            // TODO : Update conversation in MongoDB
            // TODO : Update message's status to the sender
        }
    });
    
    socket.on('isTyping', function (response) {
        // TODO : Only send to the concerned room with socket.broadcast.to(conversation.id).emit()
        socket.broadcast.emit('isTyping', response);
    });
    
  });
};