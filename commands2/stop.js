const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la música y limpia la cola'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guild.id);
        
        // Caso 1: No hay reproductor (bot no conectado)
        if (!player) {
            return interaction.reply({ 
                content: '❌ No hay música reproduciéndose.', 
                ephemeral: true 
            });
        }

        // Caso 2: Hay reproductor, pero no hay canción activa
        if (!player.playing && player.queue.isEmpty()) {
            return interaction.reply({ 
                content: 'ℹ️ No hay música en reproducción ni en la cola.', 
                ephemeral: true 
            });
        }

        try {
            player.queue.clear(); // Limpia la cola (si hay canciones pendientes)

            // Si hay una canción sonando, la detenemos con skip()
            if (player.playing) {
                await player.skip();
            }

            return interaction.reply('⏹️ **Música detenida y cola limpiada.**');
            
        } catch (err) {
            console.error('Error al detener la música:', err);
            return interaction.reply({ 
                content: '⚠️ Hubo un error al detener la música.', 
                ephemeral: true 
            });
        }
    },
};