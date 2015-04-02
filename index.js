var DemoParser = require('tf2-demo');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
	response.send('Hello World!');
});

app.post('/parse', function (req, res) {
	var buffers = [];
	req.on('data', function (buffer) {
		buffers.push(buffer);
	});
	req.on('end', function () {
		var buffer = Buffer.concat(buffers);
		var demo = DemoParser.fromNodeBuffer(buffer);
		var parser = demo.getParser();
		var header = parser.readHeader();
		var body = parser.parseBody();
		body.header = header;
		res.set('Content-Type', 'application/json');
		res.write(JSON.stringify(body));
		res.end();
	});
	// do something with req.rawBody
	// use req.body for the parsed body
});

app.listen(app.get('port'), function () {
	console.log("Node app is running at localhost:" + app.get('port'));
});
