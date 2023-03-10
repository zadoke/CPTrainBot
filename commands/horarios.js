// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

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
        try {
          // Get the user's input value
          const focusedValue = interaction.options.getFocused(true);
    
          const response = await fetch(`https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/estacao-nome/${focusedValue.value.split(' ')[0]}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:97.0) Gecko/20100101 Firefox/97.0'
            }
          });
    
          // Call the station name endpoint with the user's input value
          const data = await response.json();
    
          // Extract the station IDs from the response and format as Discord choices
          // Send the filtered choices to the user
          await interaction.respond(
            data.response.slice(0, 25).map(station => ({
              name: station.Nome,
              value: station.NodeID.toString(),
            }))
          );
        } catch (error) {
          console.error(error);
        }
    },

    async execute(interaction) {
        // Get the station name and hours offset from the options
        const stationName = parseInt(interaction.options.getString('nomeestacao'));
        const hoursOffset = interaction.options.getInteger('horas');

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
        
        // Calculate the target time by adding the specified hours to the current time
        const targetTime = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);

        // Format the dates as 'YYYY-MM-DD%20HH:MM'
        const formattedCurrentTime = new Date().toISOString().slice(0, 16).replace('T', '%20');
        const formattedTargetTime = targetTime.toISOString().slice(0, 16).replace('T', '%20');
      
        // Construct the API URL with the formatted times and station name using template literals
        const apiUrl = `https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/partidas-chegadas/${stationName}/${formattedCurrentTime}/${formattedTargetTime}/INTERNACIONAL,%20ALFA,%20IC,%20IR,%20REGIONAL,%20URB%7CSUBUR,%20ESPECIAL`;
        
        // Set up the headers to mimic Firefox on a Mac
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:85.0) Gecko/20100101 Firefox/85.0',
            'Accept': 'application/json'
        };

        // Send the GET request and return the response
        try {
          const response = await fetch(apiUrl, { headers });
          scheduleData = await response.json();
        } catch (error) {
          console.error(error);
          // Send an error message to the user
          await interaction.reply('Desculpa, algo correu mal a retribuir os dados.');
          return;
        }

        // Extract train departure data
        let departures;
        try {
          departures = scheduleData.response[0].NodesComboioTabelsPartidasChegadas;
        } catch (error) {
          console.error(error);
          await interaction.reply('Desculpa, algo correu mal a retribuir os dados.');
        }
        
        // Define a variable that keeps track of the current index of the departures array
        let scheduleIndex = 0;

        // Add default value to "Observacoes" if it is undefined
        for (const departure of departures) {
            departure.Observacoes = departure.Observacoes || 'Sem atraso';
        }

        // Define an object with color indicators for different values of Observacoes
        let colorTable = {
          'SUPRIMIDO': '🔴', 
          'Atraso previsto de': '🟡', 
          'default': '🟢' 
        };

        function createScheduleEmbed(){
            // Use the value of Observacoes as a key to lookup the corresponding color in the object
            let statusColor = colorTable[departures[scheduleIndex].Observacoes] || colorTable.default;
            const scheduleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`🚅 ${departures[scheduleIndex].NComboio1} (${departures[scheduleIndex].NomeEstacaoDestino})`)
                // Add fields to the embed with the departure time, operator and observations
                .addFields(
                    { name: '🕑 Horas', value:`${departures[scheduleIndex].DataHoraPartidaChegada}`},
                    { name: '👮‍♂️ Operador', value:`${departures[scheduleIndex].Operador}`},
                    { name: `${statusColor} Observações`, value:`${departures[scheduleIndex].Observacoes}`}
                );
            return scheduleEmbed;
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
        
       

        // Send the embed to the Discord channel
        await interaction.reply({ embeds: [createScheduleEmbed()], components: [nextTrainButton] });
          

        // Create a message component collector to collect user interactions with buttons
        const scheduleCollector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 15000 // Set the time limit to 15 seconds
        });

        // Listen for button clicks and handle them accordingly
        scheduleCollector.on('collect', async i => {
            switch (i.customId) {
                case 'nextTrain':
                    // Increment the schedule index and update the message with the next train schedule embed and buttons
                    scheduleIndex++;
                    await i.update({ embeds: [createScheduleEmbed()], components: [previousTrainButton,nextTrainButton, tableViewButton]});
                    break;
                case 'previousTrain':
                    // Decrement the schedule index and update the message with the previous train schedule embed and buttons
                    scheduleIndex--;
                    await i.update({ embeds: [createScheduleEmbed()], components: scheduleIndex == 0 ? [nextTrainButton, tableViewButton] : [previousTrainButton,nextTrainButton, tableViewButton]});
                    break;
                case 'tableView':
                    // Create a table view embed with the departures data from the station
                    const tableScheduleEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`Partidas na estação ${scheduleData.response[0].NomeEstacao}`)
                        // Loop through the departures array and add fields to the embed with color indicators for supressed trains
                        for (let i = 0; i < Math.min(departures.length, 25); i++) {
                          let statusColor = colorTable[departures[i].Observacoes] || colorTable.default;
                          tableScheduleEmbed.addFields(
                              { name: ` `, value: `**${departures[i].DataHoraPartidaChegada}** | 🚅 **${departures[i].NComboio1}** (${departures[i].NomeEstacaoDestino}) - ${statusColor} ${departures[i].Observacoes}`},
                          );
                      }
                    // Update the message with the table view embed and remove the buttons
                    await i.update({ embeds: [tableScheduleEmbed], components: [] });
                    break;
            }
        });

        scheduleCollector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });


    }

}