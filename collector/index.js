var debug = require('debug')('main');
var lhapi = require('./lhapi');
var storage = require('./storage');

function planCrawling(airports) {
    
    if (airports.length > 0) {

        var code = airports.shift();
        debug('fetch departures for ' + code);

        return lhapi.getDepartures(code, '2016-04-30T00:00', '2016-05-01T00:00').then(function(data) {
            debug('store departures');
            return storage.storeDepartures(data);
        }, function(err) {
            debug('catch error. skipping airport', err);
        }).then(function() {
            return planCrawling(airports);
        });
    }
}

storage.init().then(function() {
    return lhapi.auth(process.env.APIID, process.env.APISEC);
}).then(function() {
    return lhapi.getAirports();
}).then(function(data) {
    debug('got airports .. map to codes');

    var codes = [];
    data.AirportResource.Airports.Airport.forEach(function(port) {
        codes.push(port.AirportCode);
    });

    return codes;
}).then(function(codes) {
    return planCrawling(codes);
}).then(function() {
    debug('All done :)');
}).catch(function(err) {
    debug(err);
});
