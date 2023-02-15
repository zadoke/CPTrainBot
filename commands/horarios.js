// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Export an object containing the data and execute method for the slash command
module.exports = {
  	data: new SlashCommandBuilder()
    .setName('horarios')
    .setDescription('Mostra o horario dos comboios na estação dada.')
    .addStringOption((option) =>
      option.setName('nomeestacao')
        .setDescription('O nome da estação.')
        .setRequired(true)
    ),

    async execute(interaction){
        const stationName = interaction.options.getString('nomeestacao');
        console.log(stationName);
    }
}