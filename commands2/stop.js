const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la música y limpia la cola'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true });
        }

        await player.destroy();
        // await player.pause(true)
        // await player.queue.clear()
        interaction.reply('⏹️ **Música detenida.**');
    },
};