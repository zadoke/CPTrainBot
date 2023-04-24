// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fetchTrainDetails = require('../utils/fetchTrainDetails');
// Export an object containing the data and execute method for the slash command
module.exports = {
    data: new SlashCommandBuilder()
		.setName('localizacaocomboio')
		.setDescription('Mostra a localização do comboio atual. É necessário o número do comboio.')
		.addIntegerOption((option) =>
		option.setName('numerocomboio')
			.setDescription('O número do comboio')
			.setRequired(true)
		),

	async execute(interaction) {
		const trainNumber = interaction.options.getInteger('numerocomboio');

		const trainData = await fetchTrainDetails(trainNumber);

		// Check if train data is valid
		if (trainData.response.DataHoraDestino === null) {
			// If train data is invalid, reply with an error message
			return interaction.reply('O comboio não foi encontrado.');
		}

		// Get the current location of the train
		/*This code is filtering and sorting the response data received from the API to obtain the current location of the train. 
		It first filters out all the nodes where the train has already passed (indicated by the 'ComboioPassou' property). 
		It then sorts the remaining nodes in descending order based on the 'ComboioPassou' property, 
		to get the most recent node where the train has not yet passed. 
		Finally, it selects the first element from the resulting array, 
		which represents the current location of the train.*/
		const nextStation = trainData.response.NodesPassagemComboio
		.filter((node) => !node.ComboioPassou)
		.sort((a, b) => b.ComboioPassou - a.ComboioPassou)[0];

		// Check if SituacaoComboio or Observacoes is empty and set to 'Sem observações' if it is
		// A empty string will result in a error.
		trainData.response.SituacaoComboio = trainData.response.SituacaoComboio || 'Sem observações';
		
		//After the train completes its service, nextStation after all nodes are run is undefined. This will only execute the code if nextStation is defined. If it's undefined, it will simply skip over the line.
		if (nextStation) {
			nextStation.Observacoes = nextStation.Observacoes || 'Sem observações';
		}
		  
			
		
		// Create an embed to display the train data
		const estadoComboioEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`🚅 Comboio ${trainNumber} ${trainData.response.TipoServico} - Localização`)
		.setFooter({ text: `Poderão existir falhas entre os horários apresentados e a realidade.\nInfraestruturas de Portugal, S.A.`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Logo_Infraestruturas_de_Portugal_2.svg/512px-Logo_Infraestruturas_de_Portugal_2.svg.png' });
		

		// Check the status of the train and add relevant fields to the embed
		switch (trainData.response.SituacaoComboio) {
			case 'Programado':
			  estadoComboioEmbed.setDescription('O Comboio ainda não foi realizado:')
				.addFields(
				  { name: '⚪ Observações', value: trainData.response.SituacaoComboio, },
				  { name: '🏔 Estação de partida', value: trainData.response.Origem, inline: true },
				  { name: '🕑 Hora de partida', value: nextStation.HoraProgramada, inline: true }
				);
			  await interaction.reply({ embeds: [estadoComboioEmbed] });
			  break;
			case 'Realizado':
			  estadoComboioEmbed.setDescription('O comboio já foi realizado.')
				.addFields(
				  { name: '🏔 Estação Terminal', value: trainData.response.Destino },
				  { name: '🕑 Hora de Chegada', value: trainData.response.DataHoraDestino, inline: true },
				  { name: '⚫ Observações', value: trainData.response.SituacaoComboio, inline: true }
				);
			  await interaction.reply({ embeds: [estadoComboioEmbed] });
			  break;
			case 'SUPRIMIDO':
			  estadoComboioEmbed.setDescription('O comboio foi SUPRIMIDO.')
				.addFields(
				  { name: '🔴 Observações', value: trainData.response.SituacaoComboio,},
				  { name: '🏔 Estação de partida', value: trainData.response.Origem, inline: true },
				  { name: '🕑 Hora de partida', value: nextStation.HoraProgramada, inline: true }
				);
			  await interaction.reply({ embeds: [estadoComboioEmbed] });
			  break;
			default:	
				estadoComboioEmbed.setDescription('O Comboio irá passar/está por:')
					.addFields(
						{ name: '🏔 Estação', value: nextStation.NomeEstacao },
						{ name: '🕑 Hora Programada', value: nextStation.HoraProgramada, inline: true },
						{ name: '🟢 Observações', value: trainData.response.SituacaoComboio, inline: true }
					);
				await interaction.reply({ embeds: [estadoComboioEmbed]});	
				break;	
		}
		
	}	
}
