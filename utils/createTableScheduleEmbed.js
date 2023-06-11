const getStatusColor = require('../utils/getStatusColor');
const {EmbedBuilder} = require('discord.js');

function createTableScheduleEmbed(trains, scheduleIndex, scheduleData) {
    // This function takes an array of trains and scheduleData
    // It uses these arguments to create an embed object that displays a table view of the trains
    
    // Create a new embed object and set its properties
    const tableScheduleEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Partidas na estação ${scheduleData.stationName}`)
        .setFooter({ text: `Poderão existir falhas entre os horários apresentados e a realidade.\nInfraestruturas de Portugal, S.A.`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Logo_Infraestruturas_de_Portugal_2.svg/512px-Logo_Infraestruturas_de_Portugal_2.svg.png' }); //Icon is public domain

    // Loop through the trains array
    trains.slice(scheduleIndex, scheduleIndex + 10).forEach(departure => {
      tableScheduleEmbed.addFields(
          { name: ` `, value: `**${departure.time}** | 🚅 **(${departure.carriages})** **${departure.trainNumber}** (${departure.destinationStationName}) | ${getStatusColor(departure.info)} ${departure.info}` },
      );
    });
    // Return the embed object
    return tableScheduleEmbed;
}


module.exports = createTableScheduleEmbed;