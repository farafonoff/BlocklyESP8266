var net = require('net');
let linebyline = require('./linebyline');
var sockets = []

let serial = 0;

let port = 11337;

function sockText(socket) {
	return `${socket.remoteAddress}:${socket.remotePort}`;
}
server = net.createServer(socket => {
	console.log('incoming connection')
	console.log(sockText(socket), ' connected')
	//sockets.push(socket);
	let linereader = linebyline.linebyline();
	socket.on('close', () => {
		sockets = sockets.filter(s => s!==socket);
		console.log(sockText(socket), ' disconnected')
	})
	linereader.on('line', line=>processInput(socket, line));
	socket.pipe(linereader);
});
server.on('listening', () => {
	console.log('socket server listening ', port);
})
server.listen(port, '0.0.0.0');

function processInput(socket, line) {
	let eq = line.indexOf('=');
	let first = line.substr(0, eq);
	let last = line.substr(eq+1);
	switch(first) {
		case 'mac': {
			socket.mac = last;
			console.log(last, ' connected')
			let found = sockets.findIndex(sock => sock.mac === socket.mac);
			if (found === -1) {
				sockets.push(socket);
			} else {
				sockets[found].close();
				sockets[found] = socket;
			}
		}
	}
}

function getDevices() {
	sockets = sockets.filter(s => !s.destroyed);
	return Promise.resolve(sockets.map(socket => {
		return {
			id: socket.mac,
			provider: 'socket',
			description: sockText(socket)
		}
	}));
}

function exec(conn, script) {
	let connection = sockets.find(sock => sock.mac === conn)
	return new Promise((resolve, reject) => {
		let data = script+'==END==';
		console.log(data);
		connection.write(data, (err) => {
			resolve();
		})	
	})
}

module.exports.exec = exec;
module.exports.getDevices = getDevices;
