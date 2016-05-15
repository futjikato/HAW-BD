# Database model

Field name is written in object notation. ( e.g. `Position.Latitude` means model contains object Position with property Latitude )

## Airports

Field|Expected type|Desciption
---|---|---
AirportCode|string|IATA Code
Name|string|German name of the airport
Position.Latitude|float|Geolocation
Position.Longitude|float|Geolocation
Score|float|Value between 0 and 1 describing the timliness
isOperatedByLh|boolean|Speical value for LH Api Collector app.

## Flights

Field|Expected type|Desciption
---|---|---
Departure.AirportCode|string|IATA Code
Departure.isDelayed|boolean|Flag if the flight started late
Departure.ScheduledTime|Date|Datetime of scheduled departure
Departure.ActualTime|Date|Datetime of actual departure
Arrival.AirportCode|string|IATA Code
Arrival.isDelayed|boolean|Flag if the flight arrived late
Arrival.ScheduledTime|Date|Datetime of scheduled arrival
Arrival.ActualTime|Date|Datetime of atual arrival
OperatingCarrier|string|Airline code that operates the flight.
AircraftCode|string|IATA Code
