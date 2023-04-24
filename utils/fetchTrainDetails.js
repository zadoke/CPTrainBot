async function fetchTrainDetails(trainNumber) {
    const currentDate = new Date().toISOString().substring(0, 10);
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