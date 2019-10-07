const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
/*SerialPort.list().then(
    ports => ports.forEach(console.log),
    err => console.error(err)
)*/


const { ActivityHandler } = require('botbuilder');

class WeatherBot extends ActivityHandler {
    constructor() {
        super();
        console.log('opening')
        const port = new SerialPort('COM3', {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            hupcl: false,
            parity: "none"
        })

        port.on('open', () => {
            console.log('port open')
            const parser = port.pipe(new Readline({ delimiter: '\n' }))
            parser.on('data', (data) => 
                {
                    //console.log(data);
                    try {
                        this.lastData = JSON.parse(data)
                    } catch (ex) {
                        this.lastData = {}
                    }
                })
        });

        // open errors will be emitted as an error event 
        port.on('error', function (err) {
            console.log('Error: ', err);
        })
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            console.log(context.activity.text)
            let msg = `Температура ${ this.lastData.temp }C, влажность ${ this.lastData.hum }%, углекислый газ ${ this.lastData.co2 } ppm`;
            await context.sendActivity(msg);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.WeatherBot = WeatherBot;
