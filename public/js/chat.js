function Chat(socket) {
	this.socket = socket;
}
Chat.prototype.sendMessage = function(room, message) {
	this.socket.emit('message', {room: room, text: message});
}
Chat.prototype.changeRoom = function(room) {
	this.socket.emit('join', {newRoom: room})
}
Chat.prototype.processCommond = function(cmd) {
	var words = cmd.toLowerCase().split(' ');
	var message = false;
	if(words.length) {

		var shell = words[0].substr(1);

		switch(shell) {
			case 'join':
				words.shift();
				console.log(words)
				var room = words.join(' ');
				this.changeRoom(room);
				break;
			case 'nick':
				words.shift();
				var name = words.join(' ');
				this.socket.emit('nameAttempt', name);
				break;
			default:
				message = '命令不存在';
		}
	}
	return message;
}