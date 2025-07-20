const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción o playlist')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nombre, URL de YouTube o búsqueda')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const { options, member, guild } = interaction;
        const query = options.getString('query');
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Debes estar en un canal de voz.', ephemeral: true });
        }
        // 
        client.textChannels = client.textChannels || new Map();
        client.textChannels.set(interaction.guildId, interaction.channel);

        // await interaction.deferReply();
        await interaction.reply({
            content:` **Buscando...** \`${query}\``
        })

        try {
            const player = client.kazagumo.getPlayer(guild.id) || await client.kazagumo.createPlayer({
                guildId: guild.id,
                voiceId: voiceChannel.id,
                textId: interaction.channel.id,
                deaf: true
            });

            const result = await client.kazagumo.search(query, { requester: interaction.user });

            // Detectar tipos especiales de URLs
            const isYouTubeRadio = /(?:youtube\.com|music\.youtube\.com)\/.*(?:list=RD)/.test(query);
            const isYouTubeMusicPlaylist = /music\.youtube\.com\/playlist\?list=/.test(query);
            const isNormalYouTubePlaylist = /youtube\.com\/.*[?&]list=PL/.test(query);
            const isPlaylist = result.playlist || isYouTubeRadio || isYouTubeMusicPlaylist || isNormalYouTubePlaylist;

            // Añadir canciones a la cola
            if (isPlaylist) {
                player.queue.add(result.tracks);
                interaction.editReply(`📃 Añadida la playlist: \`${result.playlist?.name || result.tracks[0]?.title}\` (${result.tracks.length} canciones)`);
            } else {
                player.queue.add(result.tracks[0]);
                interaction.editReply(`🎵 **Añadido a la cola:** \`${result.tracks[0].title}\``);
            }

            // Reproducir si no está ya reproduciendo
            if (!player.playing && !player.paused && player.queue.size) {
                await player.play();
            }



            if (!result.tracks.length) {
                return interaction.editReply('❌ No se encontraron resultados.');
            }
            // player.queue.add(result.tracks[0]);
            if (!player.playing) await player.play();
            
            // interaction.editReply(`🎵 **Añadido a la cola:** \`${result.tracks[0].title}\``);
        } catch (error) {
            console.error(error);
            interaction.editReply('❌ Error al reproducir la canción.');
        }
    },
};
// https://www.youtube.com/watch?v=-ACG_gupkDw&list=RD-ACG_gupkDw&start_radio=1&ab_channel=GustavoCerati
// https://music.youtube.com/playlist?list=PLNQa7DjDQC-TkQJAMQ8OVsw12aXzey3VA&si=igZQnEE5vh0IprEa
// https://www.youtube.com/watch?v=EI4x9a4SnRc&list=RDEI4x9a4SnRc&start_radio=1&ab_channel=LaTylaMVEVO