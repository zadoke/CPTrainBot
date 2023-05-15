async function getStationNames(interaction) {
    try {
        // Get the user's input value
        const focusedValue = interaction.options.getFocused(true);

        const response = await fetch(`https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/estacao-nome/${focusedValue.value.split(' ')[0]}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Call the station name endpoint with the user's input value
        const data = await response.json();

        // Extract the station IDs from the response and format as Discord choices
        // Send the filtered choices to the user
        await interaction.respond(
            data.response.slice(0, 25).map(station => ({
                name: station.Nome,
                value: station.NodeID.toString(),
            }))
        );
    } catch (error) {
        console.error(error);
    }
}

module.exports = getStationNames;