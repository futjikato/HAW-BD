(function(module) {
    'use strict';

    const MongoClient = require('mongodb').MongoClient;
    const sDebug = require('debug')('storage');

    class Storage {
        constructor() {
            this.db = undefined;
            this.flightsCollection = undefined;
            this.airportsCollection = undefined;
        }

        init() {
            var $this = this;
            return new Promise(function(resolve, reject) {
                MongoClient.connect('mongodb://mongodb:27017/bdp', function(err, db) {
                    if (err)
                        return reject(err);

                    $this.database = db;
                    $this.flightsCollection = db.collection('flights');
                    $this.airportsCollection = db.collection('airports');

                    sDebug('ready');
                    resolve();
                });
            });
        }

        close() {
            this.database.close();
        }

        storeFlight(data) {
            return this.flightsCollection.insertOne(data);
        }

        storeAirport(data) {
            return this.airportsCollection.insertOne(data);
        }

        loadLhAirports() {
            return this.airportsCollection.find({
                isOperatedByLh: true
            }).toArray()
        }
    }

    module.exports = Storage;
})(module);
