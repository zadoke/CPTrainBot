// Import necessary modules
const { SlashCommandBuilder } = require('discord.js');
const getStationNames = require('../utils/getStationNames');
const fetchTrainDetails = require('../utils/fetchTrainDetails');
const getUpdatedArrivalTime = require('../utils/getUpdatedArrivalTime');
const computeTravelTime = require('../utils/computeTravelTime');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

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
      const stationId = parseInt(interaction.options.getString('nomeestacao'));
      const trainNumber = interaction.options.getInteger('numerocomboio');

      const trainData = await fetchTrainDetails(trainNumber);
      if (trainData.trainNotFound) {
        return interaction.reply(trainData.message);
      }

      const stationIndex = trainData.response.NodesPassagemComboio.findIndex(station => station.NodeID === stationId);
      let userStation = trainData.response.NodesPassagemComboio[stationIndex];
      let previousStation = trainData.response.NodesPassagemComboio[stationIndex - 1];
      // Store the current train status to compare with future requests and inform the user if it changes.
      let previousStatus = trainData.response.SituacaoComboio;

      if (!userStation){
        return interaction.reply('O comboio não passa pela a estação que introduziste.');
      }
      if (userStation.ComboioPassou) {
        return interaction.reply('O comboio já passou pela a estação!')
      }

      interaction.reply(`${interaction.user.toString()}, o alerta está definido. Irei avisar-te quando o comboio ${trainNumber} chegar a ${userStation.NomeEstacao}.`);

      // Set an interval to check the train status every 15 seconds
      const interval = setInterval(async () => {
        const trainData = await fetchTrainDetails(trainNumber);
        previousStation = trainData.response.NodesPassagemComboio[stationIndex - 1];

        if (previousStatus && trainData.response.SituacaoComboio && previousStatus !== trainData.response.SituacaoComboio) {
          user.send(`${interaction.user.toString()}, o estado do teu comboio mudou. Estado atual: ${trainData.response.SituacaoComboio}`); //Here we send the response outside of the interaction, for reasons that we explained above.
        }
        previousStatus = trainData.response.SituacaoComboio;
        
        if (previousStation && previousStation.ComboioPassou) {
          // Check if there is an updated arrival time in the Observacoes field
          userStation = trainData.response.NodesPassagemComboio[stationIndex];

          const userStationArrivalTime = getUpdatedArrivalTime(userStation);
          const previousStationArrivalTime = getUpdatedArrivalTime(previousStation);
          const timeDifference = computeTravelTime(userStationArrivalTime, previousStationArrivalTime);
          
          setTimeout(() => {
            user.send(`${interaction.user.toString()}, o teu comboio ${trainNumber} vai chegar a ${userStation.NomeEstacao} daqui a 1 minuto.`);
            return;
          }, timeDifference - 60000); // Subtract 1 minute (60000 miliseconds) from the time difference
          clearInterval(interval);
        }
      }, 15000);
    }
}