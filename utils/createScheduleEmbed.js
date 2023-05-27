const getStatusColor = require('../utils/getStatusColor');
const {EmbedBuilder} = require('discord.js');

function createScheduleEmbed(trains, scheduleIndex) {
    // This function takes an array of trains, a schedule index.
    // It uses these arguments to create an embed object that displays information about a specific departure
    
    // Get the current departure from the trains array using the schedule index
    const currentDeparture = trains[scheduleIndex];
    
    // Create a new embed object and set its properties
    const scheduleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`🚅 ${currentDeparture.trainNumber} (${currentDeparture.destinationStationName})`)
        // Add fields to the embed with the currentDeparture time, operator and observations
        .addFields(
            { name: '🕑 Horas', value: `${currentDeparture.time}` },
            { name: '👮‍♂️ Operador', value: `${currentDeparture.operator}` },
            { name: `${getStatusColor(currentDeparture.info)} Observações`, value: `${currentDeparture.info}` }
        );
    
        // Return the embed object
    return scheduleEmbed;
}

module.exports = createScheduleEmbed;