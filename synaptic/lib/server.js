(function(module) {
    'use strict';

    const Hapi = require('hapi');
    const Joi = require('joi');
    const EventEmitter = require('events');
    const util = require('util');

    class PredictionServer {

        construction(port) {
            var $this = this;
            $this.server = new Hapi.Server();
            $this.server.connection({ port: port });

            $this.server.route({
                method: 'POST',
                path: '/api/flight',
                config: {
                    validate: {
                        payload: {
                            airlineCode: Joi.string().min(2).max(4).required(),
                            departureAirport: Joi.string().min(2).max(4).required(),
                            arrivalAirport: Joi.string().min(2).ax(4).required(),
                            departureDatetime: Joi.date().format('YYYY-MM-DDTHH:mm:ss'),
                            isDelayed: Joi.boolean().required()
                        }
                    }
                },
                handler: $this.getFlightHandler()
            });

            $this.server.route({
                method: 'POST',
                path: '/api/predict',
                config: {
                    validate: {
                        payload: {
                            airlineCode: Joi.string().min(2).max(4).required(),
                            departureAirport: Joi.string().min(2).max(4).required(),
                            arrivalAirport: Joi.string().min(2).ax(4).required(),
                            departureDatetime: Joi.date().format('YYYY-MM-DDTHH:mm:ss')
                        }
                    }
                },
                handler: $this.getPredictionHandler()
            });

            $this.server.start(function(err) {
                throw err;
            });

            EventEmitter.call($this);
        }

        /**
         * Returns a
         *
         * @returns {Function}
         */
        getPredictionHandler() {
            return function(request, reply) {
                var flight = request.rawPayload;
                $this.emit('prediction', flight, function(prediction) {
                    reply({
                        ok: true,
                        prediction: prediction
                    });
                });
            }
        }

        /**
         * Return a handler function for /flight requests.
         *
         * @returns {Function}
         */
        getFlightHandler() {
            return function (request, reply) {
                var flight = request.rawPayload;
                $this.emit('flight', flight);
                reply({
                    ok: true
                });
            };
        }

        /**
         * Stop the HTTP server.
         */
        close() {
            this.server.stop();
        }
    }

    util.inherits(PredictionServer, EventEmitter);

    module.exports = PredictionServer;
})(module);
