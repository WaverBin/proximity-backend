exports = module.exports = function(io, _, usersBySocket, socketsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
    socket.on('get:conversationId', function(conversation){
        conversation.id = guid();
        conversations[conversation.id] = conversation;
        _.each(conversation.users, function(user){ socketsByUserId[user.id].join(conversation.id); });
        
        // TODO : Save conversation in MongoDB
        
        io.to(socket.id).emit('set:conversationId', 
            { 
                id: conversation.id, 
                userId: _.find(conversation.users, function(u){ 
                    return u.id != usersBySocket[socket.id].id; 
                }).id 
           });
        socket.broadcast.to(conversation.id).emit('create:conversation', conversation);
    });
    
    socket.on('get:conversations', function(){
        var user = usersBySocket[socket.id];
        if (user != null){
            
            // TODO : Fetch MongoDB for conversations related to the user
            
            var userConvs = _.filter(conversations, function(conv){ 
                return _.find(conv.users, function(u){
                    return u.id == user.id; 
                }) != undefined; 
            });
            console.log(JSON.stringify(userConvs));
            _.each(userConvs, function(conversation){ socket.join(conversation.id); });
            io.to(socket.id).emit('get:conversations', userConvs);
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
	