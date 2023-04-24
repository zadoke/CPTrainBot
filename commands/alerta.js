// Import necessary modules from discord.js
const { SlashCommandBuilder } = require('discord.js');
const getStationNames = require('../utils/getStationNames');
const fetchTrainDetails = require('../utils/fetchTrainDetails');

// Export an object containing the data and execute method for the slash command
module.exports = {
  	data: new SlashCommandBuilder()
    .setName('alerta')
    .setDescription('Introduza o nome da estação e o número do comboio que pretende seguir.')
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

    async execute(interaction){
      // Get the station name and train number from the options
      const stationId = parseInt(interaction.options.getString('nomeestacao'));
      const trainNumber = interaction.options.getInteger('numerocomboio');

      // Fetch the train data from the API
      const trainData = await fetchTrainDetails(trainNumber);

      // Check if train data is valid
      if (trainData.response.DataHoraDestino === null) {
        // If train data is invalid, reply with an error message
        return interaction.reply('O comboio não foi encontrado.');
      }

      // Find the user's station in the stations array
      const userStation = trainData.response.NodesPassagemComboio.find(station => station.NodeID === stationId);

      // See if the user's station is on the station array. Inform the user if it is not.
      if (!userStation){
        return interaction.reply('O comboio não passa pela a estação que introduziste. Tenta novamente!');
      }

      // If ComboioPassou is true, our train already passed the user's station. Inform the user.
      if (userStation.ComboioPassou) {
        return interaction.reply('O comboio já passou pela a estação!')
      }

      interaction.reply(`${interaction.user.toString()}, o alerta está definido. Irei avisar-te quando o comboio ${trainNumber} chegar a ${userStation.NomeEstacao}.`);

      // Set an interval to check the train status every 15 seconds
      const interval = setInterval(async () => {
        // Fetch the train data from the API
        const trainData = await fetchTrainDetails(trainNumber);

        // Find the index of the user's station in the station array
        const stationIndex = trainData.response.NodesPassagemComboio.findIndex(station => station.NodeID === stationId);

        // Get the previous station
        const previousStation = trainData.response.NodesPassagemComboio[stationIndex - 1];
        

        //TODO: Check if the observacoes field changes and alert the user if it does


        // Check if the train has passed the previous station
        if (previousStation && previousStation.ComboioPassou) {
          // If the train has passed the previous station, notify the user and clear the interval
          interaction.followUp(`${interaction.user.toString()}, o teu comboio está prestes a chegar.`);
          clearInterval(interval);
        }
      }, 15000);
    }

}