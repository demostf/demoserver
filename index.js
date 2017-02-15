var DemoParser = require('tf2-demo');
var express = require('express');
var app = express();
var url = require('url');
var https = require('https');
var http = require('http');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
	response.send('Hello World!');
});

function handleDataStream (stream, cb) {
	var buffers = [];
	stream.on('data', function (buffer) {
		buffers.push(buffer);
	});
	stream.on('end', function () {
		var buffer = Buffer.concat(buffers);
		var demo = DemoParser.fromNodeBuffer(buffer);
		var parser = demo.getParser();
		var header = parser.readHeader();
		var match = parser.parseBody();
		var body = match.getState();
		body.header = header;
		cb(body);
	});
}

app.post('/parse', function (req, res) {
	handleDataStream(req, function (body) {
		res.set('Content-Type', 'application/json');
		res.write(JSON.stringify(body));
		res.end();
	})
});

app.post('/url', function (req, res) {
	var reqUrl = '';
	req.on('data', function (buffer) {
		reqUrl += buffer;
	});
	req.on('end', function () {
		var options = url.parse(reqUrl);
		if (options.protocol === 'https:') {
			var handler = https;
		} else {
			handler = http;
		}
		handler.request(options, function (response) {
			handleDataStream(response, function (body) {
				res.set('Content-Type', 'application/json');
				res.write(JSON.stringify(body));
				res.end();
			})
		}).end();
	});
});

app.listen(app.get('port'), function () {
	console.log("Node app is running at localhost:" + app.get('port'));
});
