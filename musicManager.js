const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');

module.exports = (client) => {
    const nodes = [{
        name: 'Toddy US/UK',
        url: '69.30.219.179:1038',
        auth: 'yothisnodeishostedbymushroom0162',
        secure: false
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
    // Escuchar errores de Shoukaku directamente (previene el crash)
        kazagumo.shoukaku.on('error', (name, error) => {
            console.error(`🛑 [Shoukaku Error] Nodo: ${name} — ${error?.message || error}`);
        });

        kazagumo.shoukaku.on('close', (name, code, reason) => {
            console.warn(`⚠️ [Shoukaku Close] Nodo: ${name}, Código: ${code}, Motivo: ${reason}`);
        });

        kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
            console.warn(`⚠️ [Shoukaku Disconnect] Nodo: ${name}, Players activos: ${players?.length}`);
        });

        kazagumo.shoukaku.on('ready', (name) => {
            console.log(`✅ Nodo Shoukaku conectado: ${name}`);
        });

    client.kazagumo = kazagumo;
    
};