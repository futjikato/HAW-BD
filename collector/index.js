var debug = require('debug')('main');
var LufthansaApi = require('./lib/lhapi');
var Storage = require('./lib/storage');
var sprintf = require('sprintf-js').sprintf;
var leftPad = require('left-pad');

var storageObj = new Storage();
var lhapi = new LufthansaApi(process.env.APIID, process.env.APISEC);

/**
 * Starts long running part of the application.
 * Internally we check every hour if a new day has begun.
 * Then fetches all flights from yesterday and process the data.
 *
 * @param airports
 */
function planCrawling(airports) {
    var lastLoaded = 0;

    function run() {
        var seq = Promise.resolve();

        const now = Date.now();
        var startDate = new Date(now - 172800000); // 1 days ago
        var endDate = new Date(now - 43200000); // 12 day ago
        lastLoaded = now;

        var startDateStr = startDate.getFullYear()+'-'+leftPad(startDate.getMonth()+1, 2, 0)+'-'+startDate.getDate()+'T00:00';
        var endDateStr = endDate.getFullYear()+'-'+leftPad(endDate.getMonth()+1, 2, 0)+'-'+endDate.getDate()+'T00:00';
        debug(sprintf('NEW TIMEFRAME -- Start: %s -- End: %s', startDateStr, endDateStr));

        airports.forEach(function(airport) {
            if (airport.isOperatedByLh) {
                seq = seq.then(function() {
                    return new Promise(function(resolve, reject) {
                        debug(sprintf('load flights for airport %s', airport.AirportCode));
                        lhapi.getDepartures(airport.AirportCode, startDateStr, endDateStr).then(function(data) {
                            debug('store flight');
                            // @todo: send a payload to http://synaptic:8080/api/flights
                            resolve(storageObj.storeFlight(data));
                        }, function(err) {
                            reject(err);
                        });
                    });
                })
            }
        });

        seq.then(function() {
            check();
        });
    }

    function check() {
        if (lastLoaded < Date.now() - 1000 * 60 * 60 * 12)
            run();
        else
            setTimeout(check, 1000 * 60 * 60);
    }

    check();
}

/**
 * Returns a promise that resolves with a list of newly fetched, normalized and stored airports.
 *
 * @returns {Promise}
 */
function collectAirports() {
    return lhapi.getAirports().then(function(data) {
        debug('collected airports');

        var normalized = [];
        data.AirportResource.Airports.Airport.forEach(function(airport) {
            let normAirport = LufthansaApi.normalizeAirport(airport);
            if (normAirport)
                normalized.push(normAirport);
        });

        return normalized;
    }).then(function(normalized) {
        var storeseq = Promise.resolve();

        normalized.forEach(function(airport) {
            storeseq.then(function() {
                return storageObj.storeAirport(airport);
            }, function() {
                debug('Invalid airport');
            });
        });

        return storeseq;
    }).then(function() {
        return storageObj.loadLhAirports();
    });
}

storageObj.init().then(function() {
    return storageObj.loadLhAirports();
}).then(function(airports) {
    if (!airports || (Array.isArray(airports) && airports.length == 0)) {
        return collectAirports();
    } else {
        return airports;
    }
}).then(function(airports) {
    planCrawling(airports);
}).catch(function(err) {
    debug(err);
});
