exports = module.exports = function(io, _, usersBySocket, socketsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
    socket.on('get:conversationId', function(conversation){
        conversation.id = guid();
        conversations[conversation.id] = conversation;
        _.each(conversation.users, function(user){ socketsByUserId[user.id].join(conversation.id); });
        // TODO : Save conversation in MongoDB
        // TODO : filter user ids instead of using the default 0 array index
        io.to(socket.id).emit('set:conversationId', { id: conversation.id, userId: conversation.users[0].id });
        socket.broadcast.to(conversation.id).emit('create:conversation', conversation);
    });
    
    socket.on('get:conversations', function(){
        var user = usersBySocket[socket.id];
        if (user != null){
            // TODO : Fetch MongoDB for conversations related to the user
            // TODO : Join all fetched conversations
            io.to(socket.id).emit('get:conversations', conversations);
        }
    });
    
    function slog(msg) {
        console.log(msg);
        socket.emit('log', msg);
    }
    
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    
  });
};
	