const { SlashCommandBuilder, AttachmentBuilder, Embed, channelLink, ChannelSelectMenuBuilder} = require('discord.js');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('imagem')
		.setDescription('Imagem de comboio'),
    
    async execute(interaction){
        const url = 'https://www.cp.pt/institucional/pt/comunicacao/imagens'

        fetch(url)
            .then(response => response.text())
            .then(html => {
                
                //Criar um elemento DOM temporario para parsar o conteudo HTML
                const { window } = new JSDOM(html);
                const { document } = window;

                //Encontrar todos os elementos de imagem na pagina e extrair a sua fonte
                const images = document.querySelectorAll('img');
                const imageUrls = Array.from(images).map(img => img.src);
               
                const matchingImageUrls = imageUrls.filter(url => /\.(jpg)$/.test(url));

                const randomImageUrl = matchingImageUrls[Math.floor(Math.random() * matchingImageUrls.length)];

                const comboioEmbed ={ 
                    title: 'Comboio',
                    Image: {
                        url: `https://www.cp.pt${randomImageUrl}`,
                    }
                }

                console.log(randomImageUrl)
        
                interaction.reply({embeds: [comboioEmbed]});
            })
            .catch(error => console.error(error));
    }
}

