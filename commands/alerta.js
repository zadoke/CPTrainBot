// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
      
      // Find the stationId in the station array
      const stationData = trainData.response.NodesPassagemComboio.find(station => station.NodeID === stationId);
      
      // See if our station is on the station array. Inform the user if it is not.
      if (!stationData){
        return interaction.reply('O comboio não passa pela a estação que introduziste. Tenta novamente!');
      }

      // If ComboioPassou is true, our train already passed our station. Inform the user
      if (stationData.ComboioPassou) {
        return interaction.reply('O comboio já passou pela a estação!')
      }


      
    }

}