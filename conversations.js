exports = module.exports = function(io, _, usersBySocket, socketIdsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
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
	