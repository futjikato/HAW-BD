const AirportStorage = require('./lib/airport');
const Prediction = require('./lib/prediction');

const airst = new AirportStorage();
airst.init().then(function() {
    let prediction = new Prediction(airst);

    prediction.addFlightData({
        airlineCode: 'LH',
        departureAirport: 'DAL',
        arrivalAirport: 'JFK',
        departureDatetime: Date.now()
    }, false);
}, function(err) {
    console.log('storage init err', err);
});
