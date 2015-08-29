exports = module.exports = function(io, _, usersBySocket, socketIdsByUserId, conversations){
  io.sockets.on('connection', function (socket) {
    
    socket.on('login', function(user){
        console.log('=> LOG IN  => ' + user.name);
        
        // Used to keep a record of the user and its socket ID
        usersBySocket[socket.id] = user;
        socketIdsByUserId[user.id] = socket.id;
        
        // TODO : Will have to filter out depending on GPS value
        socket.broadcast.emit('add:user', user);
        
        // Send the connected users to the actual user
        io.to(socket.id).emit('update:users', _.reject(_.map(usersBySocket, function(u){ return u; }), function(u){ return u.id == user.id; }));
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
    });
    
  });
};

