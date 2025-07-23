require('dotenv').config();
const { Client, GatewayIntentBits,Collection } = require('discord.js');
const afkTimeouts = new Map(); // ← Colocar esto al inicio del archivo, si no lo hiciste aún
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot activo.'));
app.listen(3000, () => console.log('🌐 Puerto web activo para Render'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Configuración de nodos para Lavalink

client.commands = new Collection()
// Inicializar el cliente de música
require('./commandHandler2.js')(client)
require('./musicManager.js')(client)
// require('./musicManager2.js')(client)
client.on('ready', () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(`❌ Error ejecutando el comando ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    }
});
client.kazagumo.on('playerStart', (player, track) => {
    console.log(`*Reproduciendo*: \`${track.title}\``);
});

// Mapa para controlar timeouts de AFK

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Caso 1: Bot fue desconectado manualmente
    if (oldState.member?.id === client.user.id && oldState.channelId && !newState.channelId) {
        const guildId = oldState.guild.id;
        await safePlayerDestroy(guildId, '🔌 Me desconectaron del canal de voz. La reproducción fue detenida.');
        return;
    }

    // Caso 2: Usuarios humanos abandonan el canal
    const player = client.kazagumo.players.get(oldState.guild.id);
    if (!player) return;

    const voiceChannel = oldState.guild.channels.cache.get(player.voiceId);
    if (!voiceChannel) return;

    // Verificar si quedan usuarios no bots
    const humansLeft = voiceChannel.members.some(m => !m.user.bot);
    if (humansLeft) return;

    // Desconexión automática
    await safePlayerDestroy(oldState.guild.id, '👋 Me desconecté porque no quedaban usuarios en el canal de voz.');
});

// Función segura para destruir players
async function safePlayerDestroy(guildId, message) {
    try {
        const player = client.kazagumo.getPlayer(guildId);
        if (!player) return;

        // Cancelar timeout de AFK si existe
        if (afkTimeouts.has(guildId)) {
            clearTimeout(afkTimeouts.get(guildId));
            afkTimeouts.delete(guildId);
        }

        // Verificar si el player ya está destruido
        if (player.state === 'DESTROYED') return;

        await player.destroy();
        
        const textChannel = client.textChannels?.get(guildId);
        if (textChannel) textChannel.send(message);

    } catch (err) {
        if (err.code !== 1) { // Ignorar error "Player is already destroyed"
            console.error(`Error en safePlayerDestroy (${guildId}):`, err);
        }
    }
}

// Manejo de AFK mejorado
client.kazagumo.on('playerEnd', (player) => {
    const guildId = player.guildId;

    // Cancelar timeout anterior si existe
    if (afkTimeouts.has(guildId)) {
        clearTimeout(afkTimeouts.get(guildId));
    }

    // Configurar nuevo timeout (2 minutos)
    const timeout = setTimeout(async () => {
        await safePlayerDestroy(guildId, '🕒 Me desconecté por inactividad.');
    }, 120000);
    afkTimeouts.set(guildId, timeout);
});

client.login(process.env.DISCORD_TOKEN);