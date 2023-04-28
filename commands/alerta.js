// Import necessary modules from discord.js
const { SlashCommandBuilder } = require('discord.js');
const getStationNames = require('../utils/getStationNames');
const fetchTrainDetails = require('../utils/fetchTrainDetails');

// Export an object containing the data and execute method for the slash command
module.exports = {
  	data: new SlashCommandBuilder()
    .setName('alerta')
    .setDescription('Introduz o nome da estação e o número do comboio que pretendes seguir.')
    .addStringOption((option) =>
      option.setName('nomeestacao')
        .setDescription('O nome da estação. É necessário escolher da lista apresentada.')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
    option.setName('numerocomboio')
        .setDescription('O número do comboio')
        .setRequired(true)
    ),

    async autocomplete(interaction) {
      await getStationNames(interaction);
    },

    async execute(interaction, client){
      // Retrieve the user ID of the user who triggered the slash command. This is required as interaction tokens for slash commands only remain valid for 15 minutes. We will use this ID to send a Direct Message to the user.
      const userId = interaction.user.id;
      const user = await client.users.fetch(userId);

      // Get the station name and train number from the options
      const stationId = parseInt(interaction.options.getString('nomeestacao'));
      const trainNumber = interaction.options.getInteger('numerocomboio');

      const trainData = await fetchTrainDetails(trainNumber);

      // Check if train data is valid
      if (trainData.response.DataHoraDestino === null) {
        return interaction.reply('O comboio não foi encontrado.');
      }

      // Find the user's station in the stations array
      const userStation = trainData.response.NodesPassagemComboio.find(station => station.NodeID === stationId);

      // Check if the user's station exists in the array of train stations by evaluating the "userStation" variable. If it does not exist, inform the user that the train does not pass through the station they provided and prompt them to try again.
      if (!userStation){
        return interaction.reply('O comboio não passa pela a estação que introduziste. Tenta novamente!');
      }

      // Check if the train has already passed the user's station by evaluating the "ComboioPassou" property of the station data. If true, notify the user that the train has already passed their station.
      if (userStation.ComboioPassou) {
        return interaction.reply('O comboio já passou pela a estação!')
      }

      interaction.reply(`${interaction.user.toString()}, o alerta está definido. Irei avisar-te quando o comboio ${trainNumber} chegar a ${userStation.NomeEstacao}.`);

      // Store the current train status to compare with future requests and inform the user if it changes.
      let previousStatus = trainData.response.SituacaoComboio;

      // Set an interval to check the train status every 15 seconds
      const interval = setInterval(async () => {
        const trainData = await fetchTrainDetails(trainNumber);

        // Compare the previous status of the train with the current one. If they are different, notify the user about the update.
        if (previousStatus && previousStatus !== trainData.response.SituacaoComboio){
          user.send(`${interaction.user.toString()}, o estado do teu comboio mudou. Estado atual: ${trainData.response.SituacaoComboio}`); //Here we send the response outside of the interaction, for reasons that we explained above.
        }

        previousStatus = trainData.response.SituacaoComboio;

        // Find the index of the user's station in the station array, this is necessary to get the previous station.
        const stationIndex = trainData.response.NodesPassagemComboio.findIndex(station => station.NodeID === stationId);
        // Get the previous station by accessing the element in the array before the user's station.
        const previousStation = trainData.response.NodesPassagemComboio[stationIndex - 1];

        // Check if the train has passed the previous station.
        if (previousStation && previousStation.ComboioPassou) {
          user.send(`${interaction.user.toString()}, o teu comboio está prestes a chegar.`);
          clearInterval(interval);
        }
      }, 15000);
    }
}