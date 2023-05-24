require("dotenv").config();

async function fetchSchedule(interaction, stationId) {
        // Check if the station name is empty
        try {
            if (!stationId) {
                await interaction.reply("É obrigatório escolher uma estação da lista.");
            }
        } catch (error) {
            console.error(error);
            // Send an error message to the user
            await interaction.reply("Desculpa, algo correu mal!");
            return;
        }

        const apiUrl = `${process.env.BACKEND_URL}/station/${stationId}/departures`;

        // Send the GET request and return the response
        let scheduleData;
        try {
            const response = await fetch(apiUrl);
            scheduleData = await response.json();
        } catch (error) {
            console.error(error);
            await interaction.reply('Desculpa, algo correu mal a retribuir os dados.');
            return;
        }

        if (scheduleData.error){
            await interaction.reply(scheduleData.details);
        } else {
            return scheduleData;
        }
}


module.exports = fetchSchedule;