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
	socket.on('error', (error) => {
		console.log(error);
		let found = sockets.findIndex(sock => sock.mac === socket.mac);
		if (found !== -1) {
			sockets.splice(found, 1)
		}
	})
	linereader.on('line', line=>processInput(socket, line));
	socket.pipe(linereader);
});
server.on('listening', () => {
	console.log('socket server listening ', port);
})
server.listen(port, '0.0.0.0');

function processInput(socket, line) {
	let json = JSON.parse(line);
	if (json.mac) {
		socket.mac = json.mac;
		console.log(json.mac, ' connected')
		let found = sockets.findIndex(sock => sock.mac === socket.mac);
		if (found === -1) {
			sockets.push(socket);
		} else {
			if (sockets[found].close) {
				sockets[found].close();
			}
			sockets[found] = socket;
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
		let data = script+'\n';
		console.log(data);
		connection.write(data, (err) => {
			resolve();
		})	
	})
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


function setColorAll(colorcode) {
	console.log(colorcode);
	var parts = hexToRgb(colorcode);
	getDevices().then(devs => {
		devs.forEach(dev => {
			exec(dev.id, JSON.stringify({ command:'setColor', arguments: [ parts.r, parts.g, parts.b ] }));
		});
	});	
}

module.exports.exec = exec;
module.exports.getDevices = getDevices;
module.exports.setColorAll = setColorAll;

