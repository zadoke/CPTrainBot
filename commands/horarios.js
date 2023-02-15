// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
    async autocomplete(interaction){

        // Get the user's input value
        const focusedValue = interaction.options.getFocused(true);

        const response = await fetch(`https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/estacao-nome/${focusedValue.value.split(' ')[0]}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:97.0) Gecko/20100101 Firefox/97.0'
            }
        });

        console.log(focusedValue);
    
        // Call the station name endpoint with the user's input value
        const data = await response.json();
        
        console.log(data);
        // Extract the station IDs from the response and format as Discord choices
        // Send the filtered choices to the user
        await interaction.respond(
			data.response.slice(0,25).map(station => ({
                name: station.Nome,
                value: station.NodeID.toString(),
                }))
		);

       
    },

    async execute(interaction) {
        console.log(interaction.options.getString('nomeestacao'));
    }

}