const { SlashCommandBuilder } = require('discord.js');
// prueba
module.exports = {
    data: new SlashCommandBuilder()
        .setName('sortear')
        .setDescription('Agrega tus opciones con / para separarlas')
        .addStringOption(option =>
            option.setName('opciones')
                .setDescription('Ej: pizza / empanadas / hamburguesa')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const { options, member } = interaction;
        const query = options.getString('opciones');
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Debes estar en un canal de voz.', ephemeral: true });
        }

        client.textChannels = client.textChannels || new Map();
        client.textChannels.set(interaction.guildId, interaction.channel);

        // Separar las opciones por "/" y limpiar espacios
        const opciones = query.split('/').map(op => op.trim()).filter(op => op.length > 0);

        if (opciones.length < 2) {
            return interaction.reply({
                content: '❌ Debes ingresar al menos dos opciones separadas por `/`.',
                ephemeral: true
            });
        }

        // Elegir una opción aleatoria
        const ganadora = opciones[Math.floor(Math.random() * opciones.length)];
        const lolOption = 'lol'
        if(ganadora === 'lol' | ganadora=== 'LOL'){
            return interaction.reply({
            content: `🎲 **Sorteando entre:** ${opciones.map(op => `\`${op}\``).join(', ')}\n🤮🤮🤮🤮🤮 Lamentablemente ganó...    **${ganadora}** 🤮🤮🤮🤮🤮`
        });
        }
        await interaction.reply({
            content: `🎲 **Sorteando entre:** ${opciones.map(op => `\`${op}\``).join(', ')}\n🎉 Y la opción ganadora es...    **${ganadora}** 🎉`
        });
    },
};
