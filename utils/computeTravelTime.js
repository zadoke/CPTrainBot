const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);          

function computeTravelTime(stationArrivalTime, previousStationArrivalTime) { 
  // Calculate the time difference between the current time and the scheduled arrival time at the next station
  let currentTime = dayjs().tz('Europe/Lisbon');
  let timeDifference = stationArrivalTime.diff(currentTime);

  // Check if there is a delay
  if (currentTime.isAfter(stationArrivalTime)) {
      // Add the travel time between the two stations to the time difference to account for the delay
    const travelTime = stationArrivalTime - previousStationArrivalTime;
    timeDifference += travelTime;
  }

  return timeDifference;
}

module.exports = computeTravelTime;