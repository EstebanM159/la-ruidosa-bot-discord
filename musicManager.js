const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');

module.exports = (client) => {
    const nodes = [{
        name: '',
        url: 'lavalink_v4.muzykant.xyz:443',
        auth: 'https://discord.gg/v6sdrD9kPh',
        secure: true
    }];

    const kazagumo = new Kazagumo({
        defaultSearchEngine: 'youtube',
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        }
    }, new Connectors.DiscordJS(client), nodes);

    kazagumo.on('playerStart', (player, track) => {
        const channel = client.channels.cache.get(player.textId);
        if (channel) channel.send(`🎶 **Reproduciendo**: \`${track.title}\``);
    });

    kazagumo.on('error', (node, error) => {
        console.error(`Error en nodo ${node.name}:`, error);
    });

    client.kazagumo = kazagumo;
};