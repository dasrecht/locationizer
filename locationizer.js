var express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser');
var geoip = require('geoip-lite');
var GeoJSON = require('geojson');

var app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
    var html = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset=utf-8 />
        <title>Location</title>
        <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
        <script src='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js'></script>
        <link href='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css' rel='stylesheet' />
        <style>
        body { margin:0; padding:0; }
        #map { position:absolute; top:0; bottom:0; width:100%; }
        </style>
        </head>
        <body>
        <div id='map'></div>
        <script>
        L.mapbox.accessToken = 'pk.eyJ1IjoiZGFzcmVjaHQiLCJhIjoiY2pnODl4Z2FjM2t0ZDMzcXBobHZjYzc5NyJ9.Cm-Y58VBdOrKblwiGn28mg';
        var map = L.mapbox.map('map', 'mapbox.light')
            .setView([38, -102.0], 12);
        var featureLayer = L.mapbox.featureLayer()
            .loadURL('./locationizer/get')
            .addTo(map);
        featureLayer.on('ready', function() {
            map.fitBounds(featureLayer.getBounds());
        });
        </script>
        </body>
        </html>`
    res.send(html);
});

app.get('/get', function (req, res) {
    req.webtaskContext.storage.get(function(error, data) {
        var allUsers = [];
        for(var i in data)
        {
            var constructArray = {};
            var latlon = data[i][0];
            constructArray['name'] = i;
            constructArray['lat'] = latlon[0];
            constructArray['lon'] = latlon[1];
            //constructArray['city'] = data[i][1];
            //constructArray['country'] = data[i][2];
            constructArray['title'] = i;
            //constructArray['icon'] = 'monument';
            allUsers.push(constructArray);
        }
        result = GeoJSON.parse(allUsers, {Point: ['lat', 'lon'], include: ['name', 'title', 'icon']});
        if (error) return res(error);
        res.send(result);
    });
});
app.get('/set/:id', function (req, res) {
    var userData = {};
    userData[req.params.id] =  [getip(req).ll, getip(req).city, getip(req).country]
    console.log(userData);
    save(req, userData);
    res.redirect('..');
});
module.exports = Webtask.fromExpress(app);

// get ip from req object
function getip(req) {
    //from http://stackoverflow.com/questions/29496257/knowing-request-ip-in-hapi-js-restful-api
    const xFF = req.headers['x-forwarded-for'];
    const ip = xFF ? xFF.split(',')[0] : req.info.remoteAddress;
    var geo = geoip.lookup(ip);
    return (geo)
}
// saves data to the json storage
function save(req, input) {
        req.webtaskContext.storage.get(function(error, data) {
        if (error) return res(error);
        var merged = Object.assign(data, input);
        req.webtaskContext.storage.set(merged);
    });
}
