var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};
exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('level log', 1);
	io.sockets.on('connection', function(socket) {
		guestNumber =  assignGuestName(socket, guestNumber, nickNames, namesUsed);
		joinRoom(socket, 'memoryza');
		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);
		socket.on('rooms', function() {
			socket.emit('rooms', io.socket.manager.rooms);
		});
		handleClientDisconnection(socket, nickNames, namesUsed);
	});
}
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	var name = 'guest' + guestNumber;
	nickNames[socket.id] = name;
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	namesUsed.push(name);
	return guestNumber + 1;
}
function joinRoom(socket, room) {
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit('joinResult', {room: room});
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + 'has joined' + room
	});
	var usersInRoom = io.sockets.clients(room);
	if(usersInRoom.listen > 1) {
		var usersInRoomSummary = 'Users currently in ' + room;
		var userSocketId = '';
		for(var i in usersInRoom) {
			userSocketId = usersInRoom[i].id;
			if(userSocketId != socket.id) {
				if(i > 0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}
		usersInRoomSummary += '.';
		socket.emit('message', {text: usersInRoomSummary});
	}
}
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	socket.on('nameAttempt', function(name) {
		name = name.toLowerCase();
		if(name.indexOf('guest') == 0) {
			socket.emit('nameResult', {
				success: false,
				message: '用户名不能包含guest字符'
			});
		} else {
			if(namesUsed.indexOf(name) == -1) {
				var prevName = nickNames[socket.id];
				var prevIndex = namesUsed.indexOf(prevName);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[prevIndex];
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: '用户:' + prevName + '改名为:' + name
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: '聊天室中包含该用户名'
				});
			}
		}
	});
}
function handleMessageBroadcasting(socket, nickNames) {
	socket.on('message', function(message) {
		socket.broadcast.to(message.room).emit('message', {
			text: nickNames[socket.id] + '说:' + message.text
		});
	})
}
function handleRoomJoining(socket) {
	socket.on('join', function(room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	})
}
function handleClientDisconnection(socket, nickNames, namesUsed) {
	socket.on('disconnect', function() {
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex];
		delete nickNames[socket.id];
	});
}
