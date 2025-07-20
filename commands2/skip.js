const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta la canción actual'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true });
        }

        await player.skip();
        interaction.reply('⏭️ **Canción saltada.**');
    },
};