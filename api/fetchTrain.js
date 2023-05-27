require("dotenv").config();

async function fetchTrain(trainNumber) {
    try {
        const apiUrl = await fetch(`${process.env.BACKEND_URL}/train/${trainNumber}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
        });

        const response = await apiUrl.json();
        return response;

    } catch (error) {
        console.log("Error fetching train data:", error);
    }
}

module.exports = fetchTrain;