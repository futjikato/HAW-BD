(function(module) {
    const synaptic = require('synaptic');
    const Architect = synaptic.Architect;
    const AirportStorage = require('./airport');
    const Promise = require('es6-promise').Promise;

    class Prediction {
        /**
         * Init prediction class with network
         *
         * @param {AirportStorage} airportStorage
         */
        constructor(airportStorage) {
            this.networks = {};
            this.airportStorage = airportStorage;
        }

        /**
         * Add training data to teh neural network
         *
         * @param {object} data Flight to train network with
         * @param {string} [data.airlineCode] IATA airline code
         * @param {string} [data.departureAirport] origin IATA airport code
         * @param {string} [data.arrivalAirport] destination IATA airport code
         * @param {Date} [data.departureDatetime] Datetime object
         * @param {boolean} [data.isDelayed] Flag is the flight had any delay.
         */
        addFlightData(data) {
            let sequence = Promise.resolve({});
            var $this = this;

            sequence.then(function(input) {
                return new Promise(function(resolve, reject) {
                    let airst = $this.airportStorage;
                    let collector = [];

                    collector.push(airst.getAirport(data.departureAirport));
                    collector.push(airst.getAirport(data.arrivalAirport));

                    Promise.all(collector).then(function(airports) {
                        console.log(airports);
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            }).then(function(input) {

            }).then(function(input) {
                let network = $this.getAirlineNetwork(data.airlineCode)
                network.activate(input);
                network.propagate(.2, [isDelayed]);
            }).catch(function(err) {
                console.log('input err', err);
            })
        }

        /**
         * Predict if the flight with the given information is delayed
         *
         * @param {object} data Flight to train network with
         * @param {string} [data.airlineCode] IATA airline code
         * @param {string} [data.departureAirport] origin IATA airport code
         * @param {string} [data.arrivalAirport] destination IATA airport code
         * @param {Date} [data.departureDatetime] Datetime object
         *
         * @return {boolean}
         */
        predict(data) {

        }

        /**
         * Returns a neural network handling the given airline code.
         * Creates a new network if none exists for the given code.
         *
         * @param {string} code IATA airline code
         *
         * @returns {synaptic.Network}
         */
        getAirlineNetwork(code) {
            if (!this.networks.hasOwnProperty(code)) {
                this.networks[code] = new Architect.Perceptron(4,3,1);
            }

            return this.networks[code];
        }
    }

    module.exports = Prediction;
})(module);
