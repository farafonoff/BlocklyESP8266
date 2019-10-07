const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
/*SerialPort.list().then(
    ports => ports.forEach(console.log),
    err => console.error(err)
)*/
console.log('opening')
const port = new SerialPort('COM3', {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    hupcl: false,
    parity: "none"
})

port.on('open', function () {
    console.log('port open')
    const parser = port.pipe(new Readline({ delimiter: '\n' }))
    parser.on('data', console.log)
});

// open errors will be emitted as an error event 
port.on('error', function (err) {
    console.log('Error: ', err);
})