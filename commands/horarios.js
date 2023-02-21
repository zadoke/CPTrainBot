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
        const stationNumber = parseInt(interaction.options.getString('nomeestacao'));
        const hoursToAdd = interaction.options.getInteger('horas');
        
        // Calculate the target time by adding the specified hours to the current time
        const targetTime = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);

        // Format the dates as 'YYYY-MM-DD%20HH:MM'
        const formattedCurrentTime = new Date().toISOString().slice(0, 16).replace('T', '%20');
        const formattedTargetTime = targetTime.toISOString().slice(0, 16).replace('T', '%20');
      
        // Construct the API URL with the formatted times and station number
        const apiUrl = `https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/partidas-chegadas/${stationNumber}/${formattedCurrentTime}/${formattedTargetTime}/INTERNACIONAL,%20ALFA,%20IC,%20IR,%20REGIONAL,%20URB|SUBUR,%20ESPECIAL`;
        
        // Set up the headers to mimic Firefox on a Mac
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:85.0) Gecko/20100101 Firefox/85.0',
            'Accept': 'application/json'
        };
        
        // Send the GET request and return the response
        const response = await fetch(apiUrl, { headers });


        scheduleData = await response.json();

        // Extract train departure data
        const departures = scheduleData.response[0].NodesComboioTabelsPartidasChegadas;
        
        let scheduleSelection = 0;


        // Add default value to "Observacoes" if it is undefined
        for (const departure of departures) {
            departure.Observacoes = departure.Observacoes || 'Sem atraso';
        }

        function createScheduleEmbed(){
            const scheduleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`🚅 ${departures[scheduleSelection].NComboio1} (${departures[scheduleSelection].NomeEstacaoDestino})`)
                .addFields(
                    { name: '🕑 Horas', value:`${departures[scheduleSelection].DataHoraPartidaChegada}`},
                    { name: '👮‍♂️ Operador', value:`${departures[scheduleSelection].Operador}`},
                    { name: '🔴 Observações', value:`${departures[scheduleSelection].Observacoes}`}
                );
            return scheduleEmbed;
        }


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
                    .setLabel('Vista em tabela')
                    .setStyle(ButtonStyle.Danger),
        ); 
        
       

        // Send the embed to the Discord channel
        await interaction.reply({ embeds: [createScheduleEmbed()], components: [nextTrainButton] });
          

        const scheduleCollector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 45000 });
        scheduleCollector.on('collect', async i => {
            if (i.customId == 'nextTrain'){
                scheduleSelection++;
                await i.update({ embeds: [createScheduleEmbed()], components: [previousTrainButton,nextTrainButton, tableViewButton]});
            } else if (i.customId == 'previousTrain') {
                scheduleSelection--;
                if (scheduleSelection == 0){
                    await i.update({ embeds: [createScheduleEmbed()], components: [nextTrainButton, tableViewButton]});
                } else {
                    await i.update({ embeds: [createScheduleEmbed()], components: [previousTrainButton,nextTrainButton, tableViewButton]});
                }
            } else {
                const tableScheduleEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Partidas na estação ${scheduleData.response[0].NomeEstacao}`)
                
                for (let i = 0; i < Math.min(departures.length, 25); i++) {
                    tableScheduleEmbed.addFields(
                        { name: ` `, value: `**${departures[i].DataHoraPartidaChegada}** 🚅 **${departures[i].NComboio1}** (${departures[i].NomeEstacaoDestino}) - 🟢 ${departures[scheduleSelection].Observacoes}`},
                    );
                }
                
                await i.update({ embeds: [tableScheduleEmbed], components: [] });
            }

        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });


    }

}