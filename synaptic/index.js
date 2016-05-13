const AirportStorage = require('./lib/airport');
const Prediction = require('./lib/prediction');
const PredictionServer = require('./lib/server.js');

const airst = new AirportStorage();
const server = new PredictionServer(8080);
let prediction = new Prediction(airst);

airst.init().then(function() {
    server.on('flight', function(data) {
        prediction.addFlightData(data);
    });
    server.on('prediction', function(data, fn) {
        fn(prediction.predict(data));
    });
}, function(err) {
    console.log('storage init err', err);
});
