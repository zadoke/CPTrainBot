// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fetchStationNames = require('../api/fetchStationNames');
const fetchSchedule = require('../api/fetchSchedule');
const getStatusColor = require('../utils/getStatusColor')
require("dotenv").config();

// Export an object containing the data and execute method for the slash command
module.exports = {
  	data: new SlashCommandBuilder()
    .setName('horarios')
    .setDescription('Mostra o horario dos comboios na estação dada.')
    .addStringOption((option) =>
      option.setName('nomeestacao')
        .setDescription('O nome da estação. É necessário escolher da lista apresentada.')
        .setRequired(true)
        .setAutocomplete(true)
    ),

    async autocomplete(interaction) {
        await fetchStationNames(interaction);
    },

    async execute(interaction) {
        // Get the station name and hours offset from the options
        const stationId = parseInt(interaction.options.getString('nomeestacao'));

        const scheduleData = await fetchSchedule(interaction, stationId);

        let trains
        try {
          trains = scheduleData.trains;
        } catch (error) {
          console.error(error);
          await interaction.reply('Desculpa, algo correu mal a retribuir os dados.');
        }

        // Define a variable that keeps track of the current index of the trains array
        let scheduleIndex = 0;

        // Define constants for the buttons that will be used in the message components
        // Create an action row builder object and add a button component with a custom id, label and style for the next, previous train and table view button
        const nextTrainButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('nextTrain')
            .setLabel('⏩ Próximo comboio')
            .setStyle(ButtonStyle.Primary),
        );
        const previousTrainButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('previousTrain')
            .setLabel('⏪ Comboio anterior')
            .setStyle(ButtonStyle.Primary),
        );
        const tableViewButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('tableView')
            .setLabel('📋 Vista em tabela')
            .setStyle(ButtonStyle.Danger),
        );
        const previousTableButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('previousTableView')
            .setLabel('⏪ Tabela anterior')
            .setStyle(ButtonStyle.Primary),
        );
        const nextTableButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('nextTableView')
            .setLabel('⏩ Próxima tabela')
            .setStyle(ButtonStyle.Primary),
        );


        

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

        function createTableScheduleEmbed(trains, scheduleIndex, scheduleData) {
          // This function takes an array of trains and scheduleData
          // It uses these arguments to create an embed object that displays a table view of the trains
          
          // Create a new embed object and set its properties
          const tableScheduleEmbed = new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle(`Partidas na estação ${scheduleData.stationName}`)
              .setFooter({ text: `Poderão existir falhas entre os horários apresentados e a realidade.\nInfraestruturas de Portugal, S.A.`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Logo_Infraestruturas_de_Portugal_2.svg/512px-Logo_Infraestruturas_de_Portugal_2.svg.png' }); //Icon is public domain
      
          // Loop through the trains array
          trains.slice(scheduleIndex, scheduleIndex + 25).forEach(departure => {
            tableScheduleEmbed.addFields(
                { name: ` `, value: `**${departure.time}** | 🚅 **${departure.trainNumber}** (${departure.destinationStationName}) | ${getStatusColor(departure.info)} ${departure.info}` },
            );
          });
          // Return the embed object
          return tableScheduleEmbed;
        }

        await interaction.reply({ embeds: [createScheduleEmbed(trains,scheduleIndex)], components: [nextTrainButton, tableViewButton] });

        // Create a message component collector to collect user interactions with buttons
        const scheduleCollector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 15000 // Set the time limit to 15 seconds
        });

        // Listen for button clicks and handle them accordingly
        scheduleCollector.on('collect', async i => {
            // Use a switch statement to handle button clicks based on the custom id of the button that was clicked
            switch (i.customId) {
                case 'nextTrain':
                  // Increment the schedule index and update the message with the next train schedule embed and buttons
                  scheduleIndex++;
                  await i.update({ embeds: [createScheduleEmbed(trains, scheduleIndex)], components: [previousTrainButton,nextTrainButton, tableViewButton]});
                  break;
                case 'previousTrain':
                  // Decrement the schedule index and update the message with the previous train schedule embed and buttons
                  scheduleIndex--;
                  await i.update({ embeds: [createScheduleEmbed(trains, scheduleIndex)], components: scheduleIndex == 0 ? [nextTrainButton, tableViewButton] : [previousTrainButton,nextTrainButton, tableViewButton]});
                  break;
                case 'tableView':
                  scheduleIndex = 0;
                  // Update the message with the table view embed and remove the buttons
                  await i.update({ embeds: [createTableScheduleEmbed(trains, scheduleIndex,scheduleData)], components: trains.length > 25 ? [nextTableButton] : []});
                  break;
                case 'nextTableView':
                  scheduleIndex += 25;
                  // Update the message with the table view embed and the buttons
                  await i.update({ embeds: [createTableScheduleEmbed(trains, scheduleIndex, scheduleData)], components: [previousTableButton, ...(scheduleIndex + 25 < trains.length ? [nextTableButton] : [])]});
                  break;
                case 'previousTableView':
                  scheduleIndex -= 25;
                  // Update the message with the table view embed and the buttons
                  await i.update({ embeds: [createTableScheduleEmbed(trains, scheduleIndex, scheduleData)], components: [...(scheduleIndex > 0 ? [previousTableButton] : []), ...(scheduleIndex + 25 < trains.length ? [nextTableButton] : [])]});
                  break;
              };
        });

        // Listen for the end of the collector and log the number of items collected
        scheduleCollector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }
}