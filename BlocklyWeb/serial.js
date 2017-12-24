const SerialPort = require('serialport');

let serialPorts = {};

let baud = 115200;

function getDevices() {
    return SerialPort.list().then((list) => {
        return list.map(dev => {
            return {
                provider: 'serial',
                id: dev.comName,
                description: dev.manufacturer
            }
        })
    });
}

function exec(comName, code) {
    let lines = code.split('\n');
    console.log(lines);
    let port = getPort(comName);
    return lines.reduce((promise, line) => {
        return promise.then(() => {
            return port.write(line+'\n');
        }).then(() => timeout_promise(100))
    }, Promise.resolve())
}

function timeout_promise(interval) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), interval)
    })
}

function getPort(comName) {
    if (!serialPorts[comName]) {
        let port = new SerialPort(comName, {
            baudRate: baud
          });
          port.on('data', buf => console.log(buf.toString('ascii')));
        serialPorts[comName] = port;

    }
    return serialPorts[comName];
}

module.exports.exec = exec;
module.exports.getDevices = getDevices;

module.exports.getDevices().then(console.log)