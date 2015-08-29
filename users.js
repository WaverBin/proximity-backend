exports = module.exports = function(io, _, usersBySocket, socketsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
    socket.on('login', function(user){
        console.log('=> LOG IN  => ' + user.name);
        // TODO : Store user in MongoDB
        // TODO : Filter out users depending on GPS value
        io.to(socket.id).emit('update:users', _.map(usersBySocket, function(u){ return u; }));
        socket.broadcast.emit('add:user', user);
        usersBySocket[socket.id] = user;
        socketsByUserId[user.id] = socket;
    });
    
    socket.on('update:user', function(user){
        console.log(user.name + ' updated');
        usersBySocket[socket.id] = user;
        socketsByUserId[user.id] = socket;
        // TODO : Update user in MongoDB
        // TODO : Filter out users depending on GPS value
        // -> if out of reach, send remove, else send update
        // TODO : Implement update:user, delete:user in client
    });
    
    socket.on('disconnect', function() {
        if (usersBySocket[socket.id] != null){
            console.log('=> LOG OUT => ' + usersBySocket[socket.id].name);
            socket.broadcast.emit('remove:user', usersBySocket[socket.id].id);
            delete socketsByUserId[usersBySocket[socket.id].id];
            delete usersBySocket[socket.id];
        } else {
            // TODO : Cover all edge cases so that this never happens
            console.log('ERROR : User logged out but wasnt registered');
        }
    });
    
  });
};

