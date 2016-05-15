(function(module) {
    'use strict';

    const request = require('request');
    const apiDebug = require('debug')('lhapi');
    const selectn = require('selectn');
    const sprintf = require('sprintf-js').sprintf;

    const baseUrl = 'https://api.lufthansa.com/v1';
    const APILIMIT_HOUR = 1000;
    const waitTimerMs = 3600/APILIMIT_HOUR*1000;

    class LufthansaApi {
        /**
         * Create lufthansa interface with client id and secret
         *
         * @param {string} clientId
         * @param {string} clientSec
         */
        constructor(clientId, clientSec) {
            this.clientId = clientId;
            this.clientSec = clientSec;
            this.accessToken = null;
            this.accessExpires = 0;
            this.nextMs = 0;
        }

        /**
         * Return a promise that resolves after authentication
         *
         * @returns {Promise}
         */
        auth() {
            var $this = this;

            return $this.waitNextSlot().then(function() {
                return $this.authRequest();
            });
        }

        /**
         * Returns a promise that resolves with the response from lufthansa with all airports lh operates from.
         * See https://developer.lufthansa.com/docs/read/api_details/reference_data/Airports
         *
         * @returns {Promise}
         */
        getAirports() {
            var $this = this;
            let ep = '/references/airports/?LHoperated=true&lang=de';

            return $this.waitNextSlot().then(function() {
                return $this.authedRequest(ep);
            });
        }

        /**
         * Returns a promsie that resolves with all departures from the given airport in the given timerange.
         * See https://developer.lufthansa.com/docs/read/api_details/operations/Departures_Status
         *
         * @param {string} code IATA airport code
         * @param {string} from Date format yyyy-MM-ddTHH:mm
         * @param {string} until Date format yyyy-MM-ddTHH:mm
         *
         * @returns {Promise}
         */
        getDepartures(code, from, until) {
            let ep = '/operations/flightstatus/departures/' + code + '/' + from + '/' + until;
            var $this = this;

            return $this.waitNextSlot().then(function() {
                return $this.authedRequest(ep);
            });
        }

        /**
         * Returns a promise that resolves when the next request to the lufthansa api can be performed.
         * Before any request call this function to ensure the application does not exceed the rate limit.
         *
         * @returns {Promise}
         */
        waitNextSlot() {
            var $this = this;
            return new Promise(function (resolve) {
                let diff = $this.nextMs - Date.now();
                $this.nextMs = (diff <= 0) ? (Date.now() + waitTimerMs) : ($this.nextMs + waitTimerMs);

                if (diff <= 0)
                    return resolve();

                apiDebug('wait for ', diff, 'ms');
                setTimeout(resolve, diff);
            });
        }

        /**
         * Authenticate against lh api.
         * Will be automatically when authentication is missing or is expired.
         *
         * @returns {Promise}
         */
        authRequest() {
            var $this = this;
            return new Promise(function (resolve, reject) {
                request({
                    url: baseUrl + '/oauth/token',
                    method: 'post',
                    form: {
                        client_id: $this.clientId,
                        client_secret: $this.clientSec,
                        grant_type: 'client_credentials'
                    },
                    headers: {
                        'Accept': 'application/json'
                    }
                }, function (err, httpResponse, body) {
                    apiDebug('auth response');
                    if (err)
                        return reject(err);

                    if (httpResponse.statusCode != 200)
                        return reject(Error('Error with status code ' + httpResponse.statusCode));

                    try {
                        let data = JSON.parse(body);
                        $this.accessToken = data.access_token;
                        $this.accessExpires = Date.now() + data.expires_in * 1000;
                        resolve(data);
                    } catch (e) {
                        reject(Error('Unable to parse json response'));
                    }
                });
            });
        }

        /**
         * Make an authorized request.
         *
         * @param {string} ep
         * @returns {Promise}
         */
        authedRequest(ep) {
            var $this = this;
            function doRequest() {
                return new Promise(function (resolve, reject) {
                    apiDebug(sprintf('Request %s', ep));
                    request({
                        url: baseUrl + ep,
                        method: 'get',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': 'Bearer ' + $this.accessToken
                        }
                    }, function (err, httpResponse, body) {
                        if (err)
                            return reject(err);

                        if (httpResponse.statusCode != 200) {
                            return reject(Error('Error with status code ' + httpResponse.statusCode))
                        }

                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(Error('Unable to parse json response'));
                        }
                    });
                });
            }

            if (!this.accessToken || this.accessExpires < Date.now()) {
                // request new access out of order .. hope this fits into api limit
                apiDebug('inject refresh auth!');
                return this.authRequest().then(function() {
                    return doRequest();
                });
            } else {
                return doRequest();
            }
        }

        static normalizeAirport(data) {
            return {
                AirportCode: selectn('AirportCode', data),
                Name: selectn('Names.Name.$', data),
                Position: {
                    Latitude: selectn('Position.Coordinate.Latitude', data),
                    Longitude: selectn('Position.Coordinates.Longitude', data)
                },
                Score: 0.5,
                isOperatedByLh: true
            };
        }

        static normalizeFlight(data) {
            return {
                Departure: {
                    AirportCode: selectn('Departure.AirportCode', data),
                    isDelayed: selectn('Departure.TimeStatus.Code', data) === 'DL',
                    ScheduledTime: selectn('Departure.ScheduledTimeUTC.DateTime', data),
                    ActualTime: selectn('Departure.ActualTimeUTC.DateTime', data)
                },
                Arrival: {
                    AirportCode: selectn('Arrival.AirportCode', data),
                    isDelayed: selectn('Arrival.TimeStatus.Code', data) === 'DL',
                    ScheduledTime: selectn('Arrival.ScheduledTimeUTC.DateTime', data),
                    ActualTime: selectn('Arrival.ActualTimeUTC.DateTime', data)
                },
                OperatingCarrier: selectn('OperatingCarrier.AirlineID', data),
                AircraftCode: selectn('Equipment.AircraftCode', data)
            };
        }
    }

    module.exports = LufthansaApi;
})(module);
