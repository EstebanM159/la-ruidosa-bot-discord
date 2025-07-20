const path = require('node:path');
const fs = require('node:fs');
const { REST, Routes } = require('discord.js');
const commands = [];

module.exports = (client) => {
    const commandsPath = path.join(__dirname, './commands2');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // PARA COMANDOS EN UN SERVIDOR ESPECÍFICO (recomendado para desarrollo)
            // const data = await rest.put(
            //     Routes.applicationGuildCommands(
            //         '1395230717801402478', // Client ID (ID de tu bot)
            //         '1395138571203252345'  // Guild ID (ID del servidor) este server es de prueba
            //     ),
            //     { body: commands }
            // );
            // server de mati: 1360444356636708964


            // Borrar comandos
            // rest.delete(Routes.applicationCommands('1395230717801402478', '1395754117791481982'))
            // .then(() => console.log('Successfully deleted application command'))
            // .catch(console.error);


            // PARA COMANDOS GLOBALES (descomenta si lo necesitas)
            const data = await rest.put(
                Routes.applicationCommands('1395230717801402478'), // Solo Client ID
                { body: commands }
            );

            console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error('❌ Error al registrar comandos:', error);
        }
    })();
};