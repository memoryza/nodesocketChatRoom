var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var route = require('./lib/route');
function send404(res) {
	res.writeHead(404, {'Content-Type':'text/plain'});
	res.write('请求无效');
	res.end();
}
function sendFile(res, filePath, fileContents) {
	res.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
	res.end(fileContents);
}
function serverStatic(res, cache, absPath) {
	if(cache[absPath]) {
		sendFile(res, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if(exists) {
				fs.readFile(absPath, function(err, data) {
					if(err) {
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			} else {
				send404(res)
			}
		})
	}
}
function serverStart(req, res) {
	var url =  req.url;
	if(route.route[url]) {
		var absPath = './' + route.route[url];
		serverStatic(res, cache, absPath);
	} else {
		send404(res);
	}
}
var server = http.createServer(serverStart);

var chat = require('./lib/chat');
chat.listen(server);
server.listen(8999);