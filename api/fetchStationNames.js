require("dotenv").config();

async function fetchStationNames(interaction) {
    try {
        // Get the user's input value
        const focusedValue = interaction.options.getFocused(true);

        const response = await fetch(`${process.env.BACKEND_URL}/station/search/${focusedValue.value.split(' ')[0]}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log(response);

        // Call the station name endpoint with the user's input value
        const stationSearch = await response.json();

        // Extract the station IDs from the response and format as Discord choices
        // Send the filtered choices to the user
        await interaction.respond(
            stationSearch.map(station => ({
                name: station.name,
                value: station.id.toString(),
            }))
        );
    } catch (error) {
        console.error(error);
    }
}

module.exports = fetchStationNames;