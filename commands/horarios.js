// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder, ComponentType } = require('discord.js');

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

        const departures = scheduleData.response[0].NodesComboioTabelsPartidasChegadas;

        // Create a new Discord embed
		const estadoComboioEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`🚅 Partidas`)
            .setTimestamp()
           ;
        
        // Add each departure as a field to the embed
        
        departures.forEach(departure => {
            estadoComboioEmbed.setDescription("Teste")
            .addFields(
                { name:'🚅 Origem', value: `${departure.NComboio1} (${departure.NomeEstacaoOrigem} para ${departure.NomeEstacaoDestino})`},
                { name: '🕑 Horas', value:`${departure.DataHoraPartidaChegada}`, inline: true}
            );
        });

        // Send the embed to the Discord channel
        await interaction.reply({ embeds: [estadoComboioEmbed] });
          


    }

}