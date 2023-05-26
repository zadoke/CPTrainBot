const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function getUpdatedArrivalTime(station) {
    let arrivalTime;
    if (station.delayInfo && station.delayInfo.includes('Hora Prevista')) {
      const updatedArrivalTime = station.delayInfo.split(':').slice(1).join(':');
      arrivalTime = dayjs.tz(`${dayjs().format('YYYY-MM-DD')}T${updatedArrivalTime}:00.000Z`, 'Europe/Lisbon');
    } else {
      arrivalTime = dayjs.tz(`${dayjs().format('YYYY-MM-DD')}T${station.scheduledTime}:00.000Z`, 'Europe/Lisbon');
    }
    return arrivalTime;
}

module.exports = getUpdatedArrivalTime;