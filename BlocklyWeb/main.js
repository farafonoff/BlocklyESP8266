let sockserv = require('./socket')

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')
var app = express();

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('static'));

if (false) {
	var serial = require('./serial')
	var providers = [serial, sockserv]
} else {
	var providers = [sockserv]
}

function programize(script) {
    let prefix = ['file.open("input.lua", "w+");', 'w=file.writeline;', '\n=w\n'];
    let suffix = ['file.close();', 'retry_run(100);', '']
    let data = script.split('\n').map(l => `=w([==[${l}]==]);`)
    data = prefix.concat(data, suffix);
    //data = data.map(l => '='+l)
    return data.join('\n');
}
app.get('/api/devices', function (req, res) {
    let promises = providers.map(prov => prov.getDevices())
    Promise.all(promises).then(responses => {
        return responses.reduce((result, list) => {
            return result.concat(list);
        }, [])
    }).then(combined => {
        res.send(JSON.stringify(combined, null, 2));
    });
});

app.post('/api/exec/serial/:id', function (req, res) {
    let script = req.body.script;
    serial.exec(req.params.id, programize(script)).then(() => {
        res.sendStatus(200)
    })
    //serial.log(req.params.id).pipe(res);
});

app.post('/api/exec/socket/:id', function (req, res) {
    let script = req.body.script;
    sockserv.exec(req.params.id, script).then(() => {
        res.sendStatus(200);
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
