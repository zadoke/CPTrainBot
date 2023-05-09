const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function getUpdatedArrivalTime(station) {
    let arrivalTime;
    if (station.Observacoes && station.Observacoes.includes('Hora Prevista')) {
      const updatedArrivalTime = station.Observacoes.split(':')[1];
      arrivalTime = dayjs.tz(`${dayjs().format('YYYY-MM-DD')}T${updatedArrivalTime}:00.000Z`, 'Europe/Lisbon');
    } else {
      arrivalTime = dayjs.tz(`${dayjs().format('YYYY-MM-DD')}T${station.HoraProgramada}:00.000Z`, 'Europe/Lisbon');
    }
    return arrivalTime;
  }

module.exports = getUpdatedArrivalTime;