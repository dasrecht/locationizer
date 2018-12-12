var express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser');
var geoip = require('geoip-lite');

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  console.log(req);
  res.send(getip(req).city);
});

app.get('/set/:id', function (req, res) {
    console.log('ID: ' + req.params.id);
    res.send(getip(req).city);
    Webtask.context.storage.set(req.params.id);
});
sfadf

module.exports = Webtask.fromExpress(app);

// get ip from req object
function getip(req) {
    //from http://stackoverflow.com/questions/29496257/knowing-request-ip-in-hapi-js-restful-api
    const xFF = req.headers['x-forwarded-for'];
    const ip = xFF ? xFF.split(',')[0] : req.info.remoteAddress;
    console.log('IP: ' + ip);
    var geo = geoip.lookup(ip);
    return (geo)
}

