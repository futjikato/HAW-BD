(function(module) {
    'use strict';

    const MongoClient = require('mongodb').MongoClient;
    const Promise = require('es6-promise').Promise;

    class AirportStorage {
        /**
         * Create database connection
         */
        constructor() {
            this.db = null;
            this.airportsCollection = null;
        }

        init() {
            var $this = this;
            return new Promise(function(resolve, reject) {
                MongoClient.connect('mongodb://mongodb:27017/bdp', function(err, db) {
                    if (err)
                        return reject(err);

                    $this.db = db;
                    $this.airportsCollection = db.collection('airports');
                    resolve($this);
                });
            });
        }

        /**
         * Returns a promise that resolves to a single airport object
         *
         * @param {string} code
         * @returns {Promise}
         */
        getAirport(code) {
            return this.airportsCollection.find({
                code: code
            }).limit(1).next();
        }

        /**
         * Close database connection
         */
        close() {
            this.db.close();
        }
    }

    module.exports = AirportStorage;
})(module);
