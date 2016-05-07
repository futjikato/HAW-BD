# Neural network model

One problem when creating a neural network to predict if a flight is delayed lies
in the transformation of input parameters. This document should explain how this
implementation uses the existing parameters to create proper input values for the
neural network.

The prediction will just say if the flight is likely to be delayed or not. The
actual delay is not part of the prediction.

### List of given information

* Airline code
* Airport code ( departure )
* Airport code ( arrival )
* Departure date and time

## Airline code

Because airlines are completely separate from each other we create a neural
network for each airline. Thus this parameter is not mapped to an input value.

## Airports

We create three input parameters from the two airport codes.

First we calculate the distance between the airports. Max distance maps to 1. Other distances are
calculated relative to the maximum distance.

Next we use a "delay-score" of each airport. This is a score that is calculated by the amount of
delays from an airport. If a flight is delayed the score of the airport gets higher. If each
from or to an airport is delayed the score is 1.

# Departure date and time

We create two input values from this information.

The first input value corresponds to the date of the month. The first day of the month maps to 0
and the last day to 1.

The seconds value corresponds to teh time of the day. 00:00 maps to 0 and 23:59 to 1.
