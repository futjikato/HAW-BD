(function(module) {

    var MongoClient = require('mongodb').MongoClient;
    var Promise = require('es6-promise').Promise;
    var sDebug = require('debug')('storage');

    var database;
    var departuresCollection;

    module.exports = {
        init: function() {
            return new Promise(function(resolve, reject) {
                MongoClient.connect('mongodb://mongodb:27017/bdp', function(err, db) {
                    if (err)
                        return reject(err);

                    database = db;
                    departuresCollection = db.collection('departures');

                    sDebug('storage ready');
                    resolve();
                });
            });
        },

        close: function() {
            database.close();
        },

        storeDepartures: function(data) {
            return departuresCollection.insertOne(data);
        }
    };
})(module);
