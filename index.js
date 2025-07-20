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

// Verifica que no haya nadie en el canal de voz
client.on('voiceStateUpdate', (oldState, newState) => {
    const currentPlayer = client.kazagumo.players.get(oldState.guild.id);
    if (!currentPlayer) return;

    const channel = oldState.guild.channels.cache.get(currentPlayer.voiceId);
    if (!channel || channel.members.filter(m => !m.user.bot).size > 0) return;

    // No hay más humanos en el canal
    const textChannel = client.textChannels?.get(oldState.guild.id);
    if (textChannel) {
        textChannel.send('👋 Me desconecté porque no quedaban usuarios en el canal de voz.');
    }

    currentPlayer.destroy();
});

// AFK

client.kazagumo.on('playerEnd', (player) => {
    console.log(`Reproducción terminada en ${player.guildId}`);

    // Si ya hay timeout pendiente, no hacer nada
    if (afkTimeouts.has(player.guildId)) return;

    const timeout = setTimeout(() => {
        const currentPlayer = client.kazagumo.players.get(player.guildId);
        if (currentPlayer && !currentPlayer.queue.current) {
            const textChannel = client.textChannels?.get(player.guildId);
            if (textChannel) {
                textChannel.send('🕒 Me desconecté por inactividad.');
            }
            currentPlayer.destroy(); // Desconectar al bot
            // console.log(`⏰ Bot se desconectó por inactividad en ${player.guildId}`);
        }
        afkTimeouts.delete(player.guildId); // Limpiar referencia
    }, 120000); // 2 minutos

    afkTimeouts.set(player.guildId, timeout);
});


client.login(process.env.DISCORD_TOKEN);