// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fetchStationNames = require('../api/fetchStationNames');
const fetchSchedule = require('../api/fetchSchedule');
const createTableScheduleEmbed = require('../utils/createTableScheduleEmbed');
const createScheduleEmbed = require('../utils/createScheduleEmbed');

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

        // Generate a unique ID for this command execution
        const commandId = Math.random().toString(36).substring(2, 8);

        // Create an action row builder object and add a button component with a custom id, label and style for the next, previous train and table view button
        const nextTrainButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`${commandId}-nextTrain`)
            .setLabel('⏩ Próximo comboio')
            .setStyle(ButtonStyle.Primary),
        );
        const previousTrainButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`${commandId}-previousTrain`)
            .setLabel('⏪ Comboio anterior')
            .setStyle(ButtonStyle.Primary),
        );
        const tableViewButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`${commandId}-tableView`)
            .setLabel('📋 Vista em tabela')
            .setStyle(ButtonStyle.Danger),
        );
        const previousTableButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`${commandId}-previousTableView`)
            .setLabel('⏪ Tabela anterior')
            .setStyle(ButtonStyle.Primary),
        );
        const nextTableButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`${commandId}-nextTableView`)
            .setLabel('⏩ Próxima tabela')
            .setStyle(ButtonStyle.Primary),
        );

        await interaction.reply({ embeds: [createScheduleEmbed(trains,scheduleIndex)], components: [nextTrainButton, tableViewButton] });
        
        // Create a message component collector to collect user interactions with buttons
        const scheduleCollector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 30000 // Set the time limit to 30 seconds
        });

        // Listen for button clicks and handle them accordingly
        scheduleCollector.on('collect', async button => {
            if (!button.customId.startsWith(commandId)) return;
            await button.deferUpdate();
            // Use a switch statement to handle button clicks based on the custom id of the button that was clicked
            switch (button.customId) {
                case `${commandId}-nextTrain`:
                  // Increment the schedule index and update the message with the next train schedule embed and buttons
                  scheduleIndex++;
                  await button.editReply({ embeds: [createScheduleEmbed(trains, scheduleIndex)], components: [previousTrainButton,nextTrainButton, tableViewButton]});
                  break;
                case `${commandId}-previousTrain`:
                  // Decrement the schedule index and update the message with the previous train schedule embed and buttons
                  scheduleIndex--;
                  await button.editReply({ embeds: [createScheduleEmbed(trains, scheduleIndex)], components: scheduleIndex == 0 ? [nextTrainButton, tableViewButton] : [previousTrainButton,nextTrainButton, tableViewButton]});
                  break;
                case `${commandId}-tableView`:
                  scheduleIndex = 0;
                  // Update the message with the table view embed and remove the buttons
                  await button.editReply({ embeds: [createTableScheduleEmbed(trains, scheduleIndex,scheduleData)], components: trains.length > 10 ? [nextTableButton] : []});
                  break;
                case `${commandId}-nextTableView`:
                  scheduleIndex += 10;
                  // Update the message with the table view embed and the buttons
                  await button.editReply({ embeds: [createTableScheduleEmbed(trains, scheduleIndex, scheduleData)], components: [previousTableButton, ...(scheduleIndex + 10 < trains.length ? [nextTableButton] : [])]});
                  break;
                case `${commandId}-previousTableView`:
                  scheduleIndex -= 10;
                  // Update the message with the table view embed and the buttons
                  await button.editReply({ embeds: [createTableScheduleEmbed(trains, scheduleIndex, scheduleData)], components: [...(scheduleIndex > 0 ? [previousTableButton] : []), ...(scheduleIndex + 10 < trains.length ? [nextTableButton] : [])]});
                  break;
              };
        });

        // Listen for the end of the collector and log the number of items collected
        scheduleCollector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }
}