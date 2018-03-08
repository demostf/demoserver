var DemoParser = require('tf2-demo');
var express = require('express');
var app = express();
var url = require('url');
var https = require('https');
var http = require('http');

app.set('port', (process.env.PORT || 80));
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
	response.send('Hello World!');
});

function handleDataStream (stream, cb, slow) {
	var buffers = [];
	stream.on('data', function (buffer) {
		buffers.push(buffer);
	});
	stream.on('end', function () {
		try {
			var buffer = Buffer.concat(buffers);
			var demo = DemoParser.Demo.fromNodeBuffer(buffer);
			var parser = demo.getParser(!slow);
			var header = parser.readHeader();
			var match = parser.parseBody();
			var body = match.getState();
			body.header = header;
			cb(body);
		} catch (e) {
			cb(e);
		}
	});
}

app.post('/parse/slow', function (req, res) {
  handleDataStream(req, function (body) {
    res.set('Content-Type', 'application/json');
    res.write(JSON.stringify(body));
    res.end();
  }, true)
});
app.post('/parse', function (req, res) {
	handleDataStream(req, function (body) {
		res.set('Content-Type', 'application/json');
		res.write(JSON.stringify(body));
		res.end();
	}, false)
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

process.on('SIGINT', function () {
	process.exit();
});
process.on('SIGTERM', function () {
	process.exit();
});
