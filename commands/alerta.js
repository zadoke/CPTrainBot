// Import necessary modules
const { SlashCommandBuilder } = require('discord.js');
const fetchStationNames = require('../api/fetchStationNames');
const fetchTrain = require('../api/fetchTrain');
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
      await fetchStationNames(interaction);
    },

    async execute(interaction, client){
      // Retrieve the user ID of the user who triggered the slash command. This is required as interaction tokens for slash commands only remain valid for 15 minutes. We will use this ID to send a Direct Message to the user.
      const userId = interaction.user.id;
      const user = await client.users.fetch(userId);
      const stationId = parseInt(interaction.options.getString('nomeestacao'));
      const trainNumber = interaction.options.getInteger('numerocomboio');

      const trainData = await fetchTrain(trainNumber);

      // Check if train data is valid
      if (trainData.error) {
        return interaction.reply(trainData.details);
      }

      const stationIndex = trainData.stops.findIndex(stop => stop.stationId === stationId);

      let userStation = trainData.stops[stationIndex];
      let previousStation = trainData.stops[stationIndex - 1];
      // Store the current train status to compare with future requests and inform the user if it changes.
      let previousStatus = trainData.status;

      if (!userStation){
        return interaction.reply('O comboio não passa pela a estação que introduziste.');
      }

      if (userStation.trainPassed) {
        return interaction.reply('O comboio já passou pela a estação!')
      }

      interaction.reply(`${interaction.user.toString()}, o alerta está definido. Irei avisar-te quando o comboio ${trainNumber} chegar a ${userStation.stationName}.`);

      // Set an interval to check the train status every 15 seconds
      // TODO: Implement this feature on the backend
      const interval = setInterval(async () => {
        const trainData = await fetchTrain(trainNumber);
        previousStation = trainData.stops[stationIndex - 1];

        if (trainData.status && previousStatus !== trainData.status) {
          user.send(`${interaction.user.toString()}, o estado do teu comboio mudou. Estado atual: ${trainData.status}`); //Here we send the response outside of the interaction, for reasons that we explained above.
        }
        previousStatus = trainData.status;
        
        if (previousStation && previousStation.trainPassed) {
          // Check if there is an updated arrival time in the Observacoes field
          userStation = trainData.stops[stationIndex];

          const userStationArrivalTime = getUpdatedArrivalTime(userStation);
          const previousStationArrivalTime = getUpdatedArrivalTime(previousStation);
          const timeDifference = computeTravelTime(userStationArrivalTime, previousStationArrivalTime);
          
          setTimeout(() => {
            user.send(`${interaction.user.toString()}, o teu comboio ${trainNumber} vai chegar a ${userStation.stationName} daqui a 1 minuto.`);
            return;
          }, timeDifference - 60000); // Subtract 1 minute (60000 miliseconds) from the time difference
          clearInterval(interval);
        }
      }, 15000);
    }
}