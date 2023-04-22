// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const getStationNames = require('../utils/getStationNames');

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
    )
    .addIntegerOption(option =>
		option.setName('horas')
        .setRequired(true)
		.setDescription('O periodo de tempo que desejas consultar, em horas')
    ),

    async autocomplete(interaction) {
        await getStationNames(interaction);
    },

    async execute(interaction) {
        // Get the station name and hours offset from the options
        const stationName = parseInt(interaction.options.getString('nomeestacao'));

        // Check if the station name is empty
        try {
          if (!stationName) {
            await interaction.reply("É obrigatório escolher uma estação da lista.");
          }
        } catch (error) {
          console.error(error);
          // Send an error message to the user
          await interaction.reply("Desculpa, algo correu mal!");
          return;
        }

        const hoursOffset = interaction.options.getInteger('horas');

        // Calculate the target time by adding the hours offset to the current time
        const targetTime = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
        // Set options for date formatting. We want Portugal's time zone.
        const options = { timeZone: 'Europe/Lisbon', hour12: false };
        
        // Function to format a date object into a string
        const formatDate = (date) => {
            const [day, month, year] = date.toLocaleDateString('en-GB', options).split('/');
            const [hour, minute] = date.toLocaleTimeString('en-GB', options).split(':');
            // Return the formatted date string
            return `${year}-${month}-${day}%20${hour}:${minute}`;
        };
        
        const formattedCurrentTime = formatDate(new Date());
        const formattedTargetTime = formatDate(targetTime);
        
        // Construct the API URL with the formatted times and station name using template literals
        const apiUrl = `https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/partidas-chegadas/${stationName}/${formattedCurrentTime}/${formattedTargetTime}/INTERNACIONAL,%20ALFA,%20IC,%20IR,%20REGIONAL,%20URB%7CSUBUR,%20ESPECIAL`;

        // Set up the headers
        const headers = {
            'Accept': 'application/json'
        };

        // Send the GET request and return the response
        let stationData;
        try {
          const response = await fetch(apiUrl, { headers });
          stationData = await response.json();
        } catch (error) {
          console.error(error);
          // Send an error message to the user
          await interaction.reply('Desculpa, algo correu mal a retribuir os dados.');
          return;
        }

        // Extract train departure data
        let departureData;
        try {
          departureData = stationData.response[0].NodesComboioTabelsPartidasChegadas;
        } catch (error) {
          console.error(error);
          await interaction.reply('Desculpa, algo correu mal a retribuir os dados.');
        }

        // Check if there are no departureData
        if (!departureData) {
          await interaction.reply('Desculpa, não há comboios para esta estação.');
          return;
        }

        // Define a variable that keeps track of the current index of the departureData array
        let scheduleIndex = 0;

        // Add default value to "Observacoes" if it is undefined
        for (const currentDeparture of departureData) {
            currentDeparture.Observacoes = currentDeparture.Observacoes || 'Sem atraso';
        } 
      
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

        function getStatusColor(observacoes) {
          switch (true) {
              case observacoes.includes('Atraso previsto de'):
                  return '🟡';
              case observacoes === 'SUPRIMIDO':
                  return '🔴';
              default:
                  return '🟢';
          }
        } 

        function createScheduleEmbed(departureData, scheduleIndex) {
          // This function takes an array of departureData, a schedule index.
          // It uses these arguments to create an embed object that displays information about a specific departure
          
          // Get the current departure from the departureData array using the schedule index
          const currentDeparture = departureData[scheduleIndex];
          
          // Create a new embed object and set its properties
          const scheduleEmbed = new EmbedBuilder()
              .setColor(0x0099FF)
              .setTitle(`🚅 ${currentDeparture.NComboio1} (${currentDeparture.NomeEstacaoDestino})`)
              // Add fields to the embed with the currentDeparture time, operator and observations
              .addFields(
                  { name: '🕑 Horas', value: `${currentDeparture.DataHoraPartidaChegada}` },
                  { name: '👮‍♂️ Operador', value: `${currentDeparture.Operador}` },
                  { name: `${getStatusColor(currentDeparture.Observacoes)} Observações`, value: `${currentDeparture.Observacoes}` }
              );
          
              // Return the embed object
          return scheduleEmbed;
        }

        function createTableScheduleEmbed(departureData, scheduleIndex, stationData) {
          // This function takes an array of departureData and stationData
          // It uses these arguments to create an embed object that displays a table view of the departureData
          
          // Create a new embed object and set its properties
          const tableScheduleEmbed = new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle(`Partidas na estação ${stationData.response[0].NomeEstacao}`)
              .setFooter({ text: `Poderão existir falhas entre os horários apresentados e a realidade.\nInfraestruturas de Portugal, S.A.`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Logo_Infraestruturas_de_Portugal_2.svg/512px-Logo_Infraestruturas_de_Portugal_2.svg.png' }); //Icon is public domain
      
          // Loop through the departureData array
          departureData.slice(scheduleIndex, scheduleIndex + 25).forEach(departure => {
            tableScheduleEmbed.addFields(
                { name: ` `, value: `**${departure.DataHoraPartidaChegada}** | 🚅 **${departure.NComboio1}** (${departure.NomeEstacaoDestino}) | ${getStatusColor(departure.Observacoes)} ${departure.Observacoes}` },
            );
          });
          // Return the embed object
          return tableScheduleEmbed;
        }

        await interaction.reply({ embeds: [createScheduleEmbed(departureData,scheduleIndex)], components: [nextTrainButton, tableViewButton] });

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
                  await i.update({ embeds: [createScheduleEmbed(departureData, scheduleIndex)], components: [previousTrainButton,nextTrainButton, tableViewButton]});
                  break;
                case 'previousTrain':
                  // Decrement the schedule index and update the message with the previous train schedule embed and buttons
                  scheduleIndex--;
                  await i.update({ embeds: [createScheduleEmbed(departureData, scheduleIndex)], components: scheduleIndex == 0 ? [nextTrainButton, tableViewButton] : [previousTrainButton,nextTrainButton, tableViewButton]});
                  break;
                case 'tableView':
                  scheduleIndex = 0;
                  // Update the message with the table view embed and remove the buttons
                  await i.update({ embeds: [createTableScheduleEmbed(departureData, scheduleIndex,stationData)], components: departureData.length > 25 ? [nextTableButton] : []});
                  break;
                case 'nextTableView':
                  scheduleIndex += 25;
                  // Update the message with the table view embed and the buttons
                  await i.update({ embeds: [createTableScheduleEmbed(departureData, scheduleIndex, stationData)], components: [previousTableButton, ...(scheduleIndex + 25 < departureData.length ? [nextTableButton] : [])]});
                  break;
                case 'previousTableView':
                  scheduleIndex -= 25;
                  // Update the message with the table view embed and the buttons
                  await i.update({ embeds: [createTableScheduleEmbed(departureData, scheduleIndex, stationData)], components: [...(scheduleIndex > 0 ? [previousTableButton] : []), ...(scheduleIndex + 25 < departureData.length ? [nextTableButton] : [])]});
                  break;
              };
        });

        // Listen for the end of the collector and log the number of items collected
        scheduleCollector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }
}