const convertToMilliseconds = require("./convertToMilliseconds");

// Get the time delta between two stations in miliseconds
function getTravelTime (station1Time, station2Time){
     let time1 = convertToMilliseconds(station1Time);
     let time2 = convertToMilliseconds(station2Time);

     return Math.abs(time1 - time2);
}

module.exports = getTravelTime;