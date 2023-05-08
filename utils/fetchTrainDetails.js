const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

async function fetchTrainDetails(trainNumber) {
    const currentDate = dayjs().tz('Europe/Lisbon').format('YYYY-MM-DD');
    // Fetch train data from API using train number and current date
    // horarios-ncombio is not a typo, this is the actual endpoint url!
    const response = await fetch(`https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/horarios-ncombio/${trainNumber}/${currentDate}`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    }
    });

    return await response.json();
}

module.exports = fetchTrainDetails;