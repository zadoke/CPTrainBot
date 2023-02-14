// Import necessary modules from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
		const currentDate = new Date().toISOString().substring(0, 10);

		// Fetch train data from API using train number and current date
		const response = await fetch(`https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/horarios-ncombio/${trainNumber}/${currentDate}`, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:97.0) Gecko/20100101 Firefox/97.0'
		}
		});

		const trainData = await response.json();

		
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
		const currentLocation = trainData.response.NodesPassagemComboio
		.filter((node) => !node.ComboioPassou)
		.sort((a, b) => b.ComboioPassou - a.ComboioPassou)[0];

		// Check if SituacaoComboio or Observacoes is empty and set to 'Sem observações' if it is
		trainData.response.SituacaoComboio = trainData.response.SituacaoComboio || 'Sem observações';
		currentLocation.Observacoes = currentLocation.Observacoes || 'Sem observações';
		
		// Create an embed to display the train data
		const estadoComboioEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`🚅 Comboio ${trainNumber} ${trainData.response.TipoServico} - Localização`)
		.setURL('https://cp.pt/')
		.setTimestamp()
		.setFooter({ text: 'CP - Comboios de Portugal', iconURL: 'https://www.cp.pt/StaticFiles/CP/resources/images/logo_cp/cp_192.png' });
		
		console.log(trainData.response);
		console.log(currentLocation)

		// Check the status of the train and add relevant fields to the embed
		if (trainData.response.SituacaoComboio.includes('Programado')) {
		estadoComboioEmbed.setDescription('O Comboio ainda não foi realizado:')
			.addFields(
				{ name: '🔴 Observações', value: trainData.response.SituacaoComboio },
				{ name: '🏔 Estação de partida', value: trainData.response.Origem, inline: true },
				{ name: '🕑 Hora de partida', value: currentLocation.HoraProgramada, inline: true }
			);
		await interaction.reply({ embeds: [estadoComboioEmbed] });
		} else if (trainData.response.SituacaoComboio.includes('Realizado')) {
		estadoComboioEmbed.setDescription('O comboio já foi realizado.')
			.addFields(
				{ name: '🏔 Estação Terminal', value: trainData.response.Destino },
				{ name: '🕑 Hora de Chegada', value: trainData.response.DataHoraDestino, inline: true },
				{ name: '🔴 Observações', value: trainData.response.SituacaoComboio, inline: true }
			);
		await interaction.reply({ embeds: [estadoComboioEmbed] });
		} else if (trainData.response.SituacaoComboio.includes('SUPRIMIDO')) {
		estadoComboioEmbed.setDescription('O comboio foi SUPRIMIDO.')
			.addFields(
				{ name: '🔴 Observações', value: trainData.response.SituacaoComboio,},
				{ name: '🏔 Estação de partida', value: trainData.response.Origem, inline: true },
				{ name: '🕑 Hora de partida', value: currentLocation.HoraProgramada, inline: true }
			);
		await interaction.reply({ embeds: [estadoComboioEmbed] });
		} else {
		estadoComboioEmbed.setDescription('O Comboio irá passar/está por:')
			.addFields(
				{ name: '🏔 Estação', value: currentLocation.NomeEstacao },
				{ name: '🕑 Hora Programada', value: currentLocation.HoraProgramada, inline: true },
				{ name: '🔴 Observações', value: trainData.response.SituacaoComboio, inline: true }
			);
		await interaction.reply({ embeds: [estadoComboioEmbed] });
	};	
}}
