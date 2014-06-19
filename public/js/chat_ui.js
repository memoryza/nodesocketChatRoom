
var socket  = io.connect();
;$(function() {
	var chatAPP =  new Chat(socket);
	function util() {

	}
	function divEscapedContentElement(message) {
		return  $('<div></div>').text(message);
	}

	function systemContentElement(message) {
		return  $('<div></div>').html(message);
	}
	function processUserInput() {		
		var content = $.trim($('.send_content').val());
		var message;
		if(content.charAt(0) == '/') {
			message = chatAPP.processCommond(content);
			if(message) {
				$('#messageList').append(systemContentElement(message));
			}
		} else {
			chatAPP.sendMessage($('#room').text(), content);
			$('#messageList').append(divEscapedContentElement(content));
			$('#messageList').scrollTop($('#messageList').scrollTop());
		}
		$('.send_content').val('');
	}
	socket.on('nameResult', function(data) {
		var message;
		if(data.success) {
			message = '您已经更名为:' + data.name;
		} else {
			message = data.message;
		}
		$('#messageList').append(systemContentElement(message));		
	});
	socket.on('message', function(msg) {	
		$('#messageList').append(systemContentElement(msg.text));		
	});
	socket.on('joinResult', function(rs) {		 
		$('#messageList').append(systemContentElement('room changed!' + rs.room));		
	});
$(document)
	.on('click', '.send_btn', processUserInput);
});

