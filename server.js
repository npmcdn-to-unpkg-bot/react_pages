var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var PAGES_FILE = path.join(__dirname, 'pages.json');

app.set('port', (process.env.PORT || 8080));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest pages.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/pages', function(req, res) {
  fs.readFile(PAGES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/pages', function(req, res) {
  fs.readFile(PAGES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var pages = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.
    var newPage = {
      id: Date.now(),
      name: req.body.name,
      count: req.body.count,
	  text: req.body.text
    };
    pages.push(newPage);
    fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(pages);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});