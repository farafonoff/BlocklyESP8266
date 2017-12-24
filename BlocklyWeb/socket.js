var net = require('net');

var sockets = []

let serial = 0;

let port = 11337;

function sockText(socket) {
	return `${socket.remoteAddress}:${socket.remotePort}`;
}
server = net.createServer(socket => {
	console.log('incoming connection')
	console.log(sockText(socket), ' connected')
	sockets.push(socket);
	socket.on('close', () => {
		sockets = sockets.filter(s => s!==socket);
		console.log(sockText(socket), ' disconnected')
	})
});
server.on('listening', () => {
	console.log('socket server listening ', port);
})
server.listen(port, '0.0.0.0');

function getDevices() {
	sockets = sockets.filter(s => !s.destroyed);
	return Promise.resolve(sockets.map(socket => {
		return {
			id: sockText(socket),
			provider: 'socket',
			description: 'net connection'
		}
	}));
}

function exec(conn, script) {
	let connection = sockets.find(sock => sockText(sock) === conn)
	return new Promise((resolve, reject) => {
		let data = script+'==END==';
		console.log(data);
		connection.write(data, (err) => {
			resolve();
			console.log(err);
		})	
	})
}

module.exports.exec = exec;
module.exports.getDevices = getDevices;
