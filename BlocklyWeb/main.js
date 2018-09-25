let sockserv = require('./socket')

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')
var colors = require('./colours.json').map(c=>({...c, сname: prepstr(c.name)}));
var fetch = require('node-fetch')
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

function prepstr(s) {
	return s.toLowerCase().replace(/ё/g,'е');
}

app.post('/api/alice', function(req, res) {
	let { request,session,version } = req.body;
	if (!request.command && !request.payload) {
		res.send(JSON.stringify({ response: { text: 'Назови цвет, например Красный' } , session, version }));
		return;
	}
	if (request.fake) {
		res.send(JSON.stringify({ response: { text: 'OK' } , session, version }));
		return;
	}
	let query = request.command || request.payload.choice;
	query = prepstr(query);
	let matches = colors.filter((color) => color.сname.indexOf(query)>-1)
	.map(match => ({...match, relevance: query.length/match.name.length}));
	matches.sort((m1,m2) => m2.relevance - m1.relevance);
	let match = matches[0];
	let ans;
	if (match) {
	let mname = match.name;
	ans = {
		response: {
			text: mname,
			buttons: matches.slice(0,3).map(match => ({
				title: match.name, 
				payload: { choice: match.name },
				hide: false,
				//url: `http://getcolor.ru/#${match.value}`
			})),
			end_session: false
		},
		session, version
	} 
	sockserv.setColorAll('#'+match.value);
	}
	else { 
		ans = { response: { text: 'Я не знаю этот цвет' } , session, version }; 
	}
	res.send(JSON.stringify(ans));
})

app.post('/api/exec/socket/:id', function (req, res) {
    let script = req.body.script;
    sockserv.exec(req.params.id, script).then(() => {
        res.sendStatus(200);
    });
});
let portnumber = 3000;
app.listen(portnumber, function () {
  console.log(`Example app listening on port ${portnumber}!`);
});

let testreq = {
  "meta": {
    "client_id": "Developer Console/7.16 (apple iphone; iphone 11.4.1)",
    "locale": "ru-RU",
    "timezone": "UTC"
  },
  "request": {
	"fake": true,
    "command": "синий",
    "original_utterance": "синий",
    "type": "SimpleUtterance"
  },
  "session": {
    "message_id": 2,
    "new": false,
    "session_id": "64a88bbc-e768e452-2ab083a6-70c5a",
    "skill_id": "36db8b40-6530-493b-b981-87e9700b7399",
    "user_id": "029A5FA69FFDCE62BEC76E0608FC443202B0BBB9B6E6ACA4AF946934F890CCB8"
  },
  "version": "1.0"
}
let aliceKeepAlive = setInterval(() => {
	fetch(`http://localhost:${portnumber}/api/alice`, {
		method: 'POST',
		headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		},
		body: JSON.stringify(testreq)
	}).then(resp => resp.json())
	.then(json => console.log(json.response.text))
},10000);
