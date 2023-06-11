// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fetchTrain = require('../api/fetchTrain');
// Export an object containing the data and execute method for the slash command
module.exports = {
    data: new SlashCommandBuilder()
		.setName('comboio')
		.setDescription('Mostra a localização do comboio atual. É necessário o número do comboio.')
		.addIntegerOption((option) =>
		option.setName('numerocomboio')
			.setDescription('O número do comboio')
			.setRequired(true)
		),

	async execute(interaction) {
		const trainNumber = interaction.options.getInteger('numerocomboio');
		const trainData = await fetchTrain(trainNumber);

		// Check if train data is valid
		if (trainData.error) {
			return interaction.reply(trainData.details);
		}

		// Create an embed to display the train data
		const estadoComboioEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`🚅 Comboio ${trainNumber} ${trainData.serviceType} - Localização`)
		.setFooter({ text: `Poderão existir falhas entre os horários apresentados e a realidade.\nInfraestruturas de Portugal, S.A.\nSegue o teu comboio e recebe atualizações usando o comando /alerta!`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Logo_Infraestruturas_de_Portugal_2.svg/512px-Logo_Infraestruturas_de_Portugal_2.svg.png' });
		
		// Check the status of the train and add relevant fields to the embed
		switch (trainData.status) {
			case 'Programado':
				estadoComboioEmbed.setDescription('O Comboio ainda não foi realizado:')
					.addFields(
						{ name: '⚪ Observações', value: trainData.status, },
						{ name: '🏔 Estação de partida', value: trainData.origin, inline: true },
						{ name: '🕑 Hora de partida', value: trainData.departureTime, inline: true }
					);
			  await interaction.reply({ embeds: [estadoComboioEmbed] });
			  break;
			case 'Realizado':
				estadoComboioEmbed.setDescription('O comboio já foi realizado.')
					.addFields(
						{ name: '🏔 Estação Terminal', value: trainData.destination },
						{ name: '🕑 Hora de Chegada', value: trainData.arrivalTime, inline: true },
						{ name: '⚫ Observações', value: trainData.status, inline: true }
					);
			  await interaction.reply({ embeds: [estadoComboioEmbed] });
			  break;
			case 'SUPRIMIDO':
				estadoComboioEmbed.setDescription('O comboio foi SUPRIMIDO.')
					.addFields(
						{ name: '🔴 Observações', value: trainData.status,},
						{ name: '🏔 Estação de partida', value: trainData.origin, inline: true },
						{ name: '🕑 Hora de partida', value: trainData.departureTime, inline: true }
					);
			  await interaction.reply({ embeds: [estadoComboioEmbed] });
			  break;
			default:	
				estadoComboioEmbed.setDescription(`O Comboio está **${trainData.status}**:`)
				const trainCurrentLocation = trainData.stops.find(stop => !stop.trainPassed);
				trainData.stops.forEach((stop) => {
					let stopsList = `**${stop.scheduledTime}** | ${stop.stationName}`;
					if (stop.delayInfo !== "Sem observações") {
						stopsList = `~~${stop.scheduledTime}~~ **${stop.delayInfo}** | ${stop.stationName}`;
					}
					if (stop === trainCurrentLocation) {
						stopsList += ' 🚆';
					}
					if (stop.trainPassed) {
						stopsList = `~~${stop.stationName}~~ ✅`;
					}
					estadoComboioEmbed.addFields(
						{ name: ' ', value: `**•** ${stopsList}` },
					);
				});
				await interaction.reply({ embeds: [estadoComboioEmbed]});	
				break;	
		}
	}	
}
