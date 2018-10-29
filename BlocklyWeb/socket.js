var net = require('net');
let linebyline = require('./linebyline');
var cp = require('child_process');

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
	//socket.pipe(process.stdout);
});
server.on('listening', () => {
	console.log('socket server listening ', port);
})
server.listen(port, '0.0.0.0');

function logCarbon(carbon, temp) {
	let cmd = `rrdtool update climate.rrd N:${carbon}:${temp}`;
	console.log(cmd)
	cp.exec(cmd);
}

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
	if (json.type==='carbon') {
		console.log(json);
		logCarbon(json.carbon, json.temp);
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

const gamma = [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,
    1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,
    2,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  5,  5,  5,
    5,  6,  6,  6,  6,  7,  7,  7,  7,  8,  8,  8,  9,  9,  9, 10,
   10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16,
   17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25,
   25, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36,
   37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50,
   51, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68,
   69, 70, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89,
   90, 92, 93, 95, 96, 98, 99,101,102,104,105,107,109,110,112,114,
  115,117,119,120,122,124,126,127,129,131,133,135,137,138,140,142,
  144,146,148,150,152,154,156,158,160,162,164,167,169,171,173,175,
  177,180,182,184,186,189,191,193,196,198,200,203,205,208,210,213,
  215,218,220,223,225,228,231,233,236,239,241,244,247,249,252,255 ];

function setColorAll(colorcode) {
	console.log(colorcode);
	var parts = hexToRgb(colorcode);
	getDevices().then(devs => {
		devs.forEach(dev => {
			exec(dev.id, JSON.stringify({ command:'setColor', arguments: [ gamma[parts.r], gamma[parts.g], gamma[parts.b] ] }));
		});
	});	
}

module.exports.exec = exec;
module.exports.getDevices = getDevices;
module.exports.setColorAll = setColorAll;

